import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase, User } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  gamerscore: number;
  updateGamerscore: (points: number) => void;
  createProfile: (gamertag: string, bio?: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamerscore, setGamerscore] = useState(0);

  useEffect(() => {
    if (connected && publicKey) {
      fetchOrCreateUser();
    } else {
      setUser(null);
      setGamerscore(0);
      setLoading(false);
    }
  }, [connected, publicKey]);

  const fetchOrCreateUser = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const walletAddress = publicKey.toString();

      // Try to fetch existing user
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser && !error) {
        setUser(existingUser);
        setGamerscore(existingUser.gamerscore || 0);
        
        // Update last login and streak
        await updateLoginStreak(existingUser);
      } else {
        // No existing user found
        setUser(null);
        setGamerscore(0);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  const updateLoginStreak = async (userData: User) => {
    const today = new Date().toDateString();
    const lastLogin = userData.last_login ? new Date(userData.last_login).toDateString() : null;
    
    if (lastLogin !== today) {
      let newStreak = 1;
      
      if (lastLogin) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLogin === yesterday.toDateString()) {
          newStreak = (userData.login_streak || 0) + 1;
        }
      }

      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          login_streak: newStreak,
        })
        .eq('id', userData.id);

      setUser(prev => prev ? { ...prev, login_streak: newStreak, last_login: new Date().toISOString() } : null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...userData } : null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
    }
  };

  const refreshUser = async () => {
    await fetchOrCreateUser();
  };

  const logout = () => {
    setUser(null);
    setGamerscore(0);
  };

  const updateGamerscore = (points: number) => {
    const newScore = gamerscore + points;
    setGamerscore(newScore);
    
    if (user) {
      setUser({ ...user, gamerscore: newScore });
      // Update in database
      supabase
        .from('users')
        .update({ gamerscore: newScore })
        .eq('id', user.id);
    }
  };

  const createProfile = async (gamertag: string, bio?: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const walletAddress = publicKey.toString();

      // Check if gamertag is already taken
      const { data: existingGamertag } = await supabase
        .from('users')
        .select('id')
        .eq('gamertag', gamertag)
        .single();

      if (existingGamertag) {
        toast.error('Gamertag already taken');
        return;
      }

      // Create new user profile
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          gamertag: gamertag,
          bio: bio || '',
          gamerscore: 0,
          total_clips: 0,
          total_votes: 0,
          login_streak: 1,
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUser(newUser);
      setGamerscore(0);
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      updateUser, 
      refreshUser, 
      logout,
      gamerscore,
      updateGamerscore,
      createProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

