import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI3MjAsImV4cCI6MTk2MDc2ODcyMH0.M9jrxyvPLkUxWgOYSf5dNdJ8v_eRrZLpvQjNbbhHZ_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface User {
  id: string;
  wallet_address: string;
  gamertag: string;
  bio?: string;
  gamerscore: number;
  total_clips: number;
  total_votes: number;
  login_streak: number;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface Clip {
  id: string;
  title: string;
  game: string;
  url: string;
  uploader_id: string;
  uploader_gamertag: string;
  votes: number;
  likes: number;
  voters: string[];
  likers: string[];
  created_at: string;
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  color: string;
  creator_id: string;
  creator_gamertag: string;
  members: string[];
  officers: string[];
  treasury: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  points: number;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  sender_id: string;
  sender_gamertag: string;
  sender_clan_tag?: string;
  sender_clan_color?: string;
  message: string;
  created_at: string;
}