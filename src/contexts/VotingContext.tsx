import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../lib/supabase';
import { mlgTokenService } from '../lib/mlgToken';
import { useUser } from './UserContext';
import toast from 'react-hot-toast';

interface VotingContextType {
  votesUsedToday: number;
  maxFreeVotes: number;
  mlgTokenBalance: number;
  canVoteFree: () => boolean;
  voteOnClip: (clipId: string, isPaid?: boolean) => Promise<boolean>;
  refreshVotingData: () => Promise<void>;
  loading: boolean;
}

const VotingContext = createContext<VotingContextType | null>(null);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const { user } = useUser();
  const { publicKey } = useWallet();
  const [votesUsedToday, setVotesUsedToday] = useState(0);
  const [mlgTokenBalance, setMlgTokenBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const maxFreeVotes = 1; // Users get 1 free vote per day

  useEffect(() => {
    if (user && publicKey) {
      refreshVotingData();
    }
  }, [user, publicKey]);

  const refreshVotingData = async () => {
    if (!user || !publicKey) return;

    try {
      setLoading(true);
      
      // Check if we need to reset daily votes
      await resetDailyVotesIfNeeded();
      
      // Get current voting data
      const { data: userData } = await supabase
        .from('users')
        .select('votes_used_today, last_vote_reset')
        .eq('id', user.id)
        .single();

      if (userData) {
        setVotesUsedToday(userData.votes_used_today || 0);
      }

      // Get MLG token balance
      const balance = await mlgTokenService.getFormattedBalance(publicKey);
      setMlgTokenBalance(balance);
      
    } catch (error) {
      console.error('Error refreshing voting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDailyVotesIfNeeded = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: userData } = await supabase
      .from('users')
      .select('last_vote_reset')
      .eq('id', user.id)
      .single();

    const lastReset = userData?.last_vote_reset;
    
    if (!lastReset || lastReset !== today) {
      // Reset daily votes
      await supabase
        .from('users')
        .update({
          votes_used_today: 0,
          last_vote_reset: today
        })
        .eq('id', user.id);
      
      setVotesUsedToday(0);
    }
  };

  const canVoteFree = (): boolean => {
    return votesUsedToday < maxFreeVotes;
  };

  const voteOnClip = async (clipId: string, isPaid: boolean = false): Promise<boolean> => {
    if (!user || !publicKey) {
      toast.error('Please connect your wallet!');
      return false;
    }

    try {
      setLoading(true);

      // Check if user already voted on this clip
      const { data: existingVote } = await supabase
        .from('vote_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('clip_id', clipId)
        .single();

      if (existingVote) {
        toast.error('You have already voted on this clip!');
        return false;
      }

      // Check voting eligibility
      if (!isPaid && !canVoteFree()) {
        toast.error(`You've used all ${maxFreeVotes} free vote(s) today. Use MLG tokens for additional votes!`);
        return false;
      }

      // If it's a paid vote, check token balance and burn tokens
      if (isPaid) {
        const hasTokens = await mlgTokenService.hasEnoughTokens(publicKey, 1);
        if (!hasTokens) {
          toast.error('Insufficient MLG tokens! You need 1 MLG token to vote.');
          return false;
        }

        // Burn 1 MLG token
        const burnSuccess = await mlgTokenService.burnTokens(
          { publicKey, signTransaction: (tx) => Promise.resolve(tx) } as any,
          1
        );
        
        if (!burnSuccess) {
          return false;
        }
      }

      // Get current clip data
      const { data: clip } = await supabase
        .from('clips')
        .select('votes, voters')
        .eq('id', clipId)
        .single();

      if (!clip) {
        toast.error('Clip not found!');
        return false;
      }

      // Update clip votes
      const newVoters = [...(clip.voters || []), user.id];
      const newVotes = (clip.votes || 0) + 1;

      // Update clip in database
      const { error: clipError } = await supabase
        .from('clips')
        .update({
          votes: newVotes,
          voters: newVoters
        })
        .eq('id', clipId);

      if (clipError) throw clipError;

      // Record vote in history
      const { error: voteError } = await supabase
        .from('vote_history')
        .insert({
          user_id: user.id,
          clip_id: clipId,
          vote_type: isPaid ? 'paid' : 'free',
          mlg_tokens_burned: isPaid ? 1 : 0
        });

      if (voteError) throw voteError;

      // Update user's daily vote count if it was a free vote
      if (!isPaid) {
        const newVotesUsed = votesUsedToday + 1;
        
        await supabase
          .from('users')
          .update({ votes_used_today: newVotesUsed })
          .eq('id', user.id);
        
        setVotesUsedToday(newVotesUsed);
      }

      // Update token balance
      if (isPaid) {
        const newBalance = await mlgTokenService.getFormattedBalance(publicKey);
        setMlgTokenBalance(newBalance);
      }

      toast.success(isPaid ? 'Vote cast with MLG tokens!' : 'Free vote cast!');
      return true;

    } catch (error) {
      console.error('Error voting on clip:', error);
      toast.error('Failed to vote. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <VotingContext.Provider value={{
      votesUsedToday,
      maxFreeVotes,
      mlgTokenBalance,
      canVoteFree,
      voteOnClip,
      refreshVotingData,
      loading
    }}>
      {children}
    </VotingContext.Provider>
  );
};