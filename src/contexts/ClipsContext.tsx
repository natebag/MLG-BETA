import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Clip } from '../lib/supabase';
import { useUser } from './UserContext';
import toast from 'react-hot-toast';

interface ClipsContextType {
  clips: Clip[];
  loading: boolean;
  uploadClip: (clipData: Omit<Clip, 'id' | 'created_at' | 'votes' | 'likes' | 'voters' | 'likers'>) => Promise<boolean>;
  voteClip: (clipId: string) => Promise<boolean>;
  likeClip: (clipId: string) => Promise<boolean>;
  refreshClips: () => Promise<void>;
}

const ClipsContext = createContext<ClipsContextType | null>(null);

export const useClips = () => {
  const context = useContext(ClipsContext);
  if (!context) {
    throw new Error('useClips must be used within a ClipsProvider');
  }
  return context;
};

interface ClipsProviderProps {
  children: ReactNode;
}

export const ClipsProvider: React.FC<ClipsProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClips(data || []);
    } catch (error) {
      console.error('Error fetching clips:', error);
      toast.error('Failed to load clips');
    } finally {
      setLoading(false);
    }
  };

  const uploadClip = async (clipData: Omit<Clip, 'id' | 'created_at' | 'votes' | 'likes' | 'voters' | 'likers'>): Promise<boolean> => {
    if (!user) {
      toast.error('Please connect your wallet first!');
      return false;
    }

    try {
      const newClip = {
        ...clipData,
        votes: 0,
        likes: 0,
        voters: [],
        likers: [],
      };

      const { data, error } = await supabase
        .from('clips')
        .insert([newClip])
        .select()
        .single();

      if (error) throw error;

      setClips(prev => [data, ...prev]);
      
      // Update user's total clips
      await supabase
        .from('users')
        .update({ total_clips: (user.total_clips || 0) + 1 })
        .eq('id', user.id);

      toast.success('Clip uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Error uploading clip:', error);
      toast.error('Failed to upload clip');
      return false;
    }
  };

  const voteClip = async (clipId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please connect your wallet first!');
      return false;
    }

    try {
      const clip = clips.find(c => c.id === clipId);
      if (!clip) return false;

      if (clip.uploader_id === user.id) {
        toast.error('You cannot vote for your own clip!');
        return false;
      }

      if (clip.voters.includes(user.id)) {
        toast.error('You have already voted for this clip!');
        return false;
      }

      const newVoters = [...clip.voters, user.id];
      const newVotes = clip.votes + 1;

      const { error } = await supabase
        .from('clips')
        .update({ 
          votes: newVotes,
          voters: newVoters
        })
        .eq('id', clipId);

      if (error) throw error;

      // Update local state
      setClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, votes: newVotes, voters: newVoters }
          : c
      ));

      toast.success('Vote cast successfully!');
      return true;
    } catch (error) {
      console.error('Error voting on clip:', error);
      toast.error('Failed to vote');
      return false;
    }
  };

  const likeClip = async (clipId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please connect your wallet first!');
      return false;
    }

    try {
      const clip = clips.find(c => c.id === clipId);
      if (!clip) return false;

      let newLikers: string[];
      let newLikes: number;

      if (clip.likers.includes(user.id)) {
        // Unlike
        newLikers = clip.likers.filter(id => id !== user.id);
        newLikes = clip.likes - 1;
      } else {
        // Like
        newLikers = [...clip.likers, user.id];
        newLikes = clip.likes + 1;
      }

      const { error } = await supabase
        .from('clips')
        .update({ 
          likes: newLikes,
          likers: newLikers
        })
        .eq('id', clipId);

      if (error) throw error;

      // Update local state
      setClips(prev => prev.map(c => 
        c.id === clipId 
          ? { ...c, likes: newLikes, likers: newLikers }
          : c
      ));

      return true;
    } catch (error) {
      console.error('Error liking clip:', error);
      toast.error('Failed to like clip');
      return false;
    }
  };

  const refreshClips = async () => {
    await fetchClips();
  };

  return (
    <ClipsContext.Provider value={{ 
      clips, 
      loading, 
      uploadClip, 
      voteClip, 
      likeClip, 
      refreshClips 
    }}>
      {children}
    </ClipsContext.Provider>
  );
};