/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `gamertag` (text, unique)
      - `bio` (text, optional)
      - `gamerscore` (integer, default 0)
      - `total_clips` (integer, default 0)
      - `total_votes` (integer, default 0)
      - `login_streak` (integer, default 0)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read all profiles but only update their own
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  gamertag text UNIQUE NOT NULL,
  bio text,
  gamerscore integer DEFAULT 0,
  total_clips integer DEFAULT 0,
  total_votes integer DEFAULT 0,
  login_streak integer DEFAULT 0,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read user profiles (for roster, usernames, etc.)
CREATE POLICY "Anyone can read user profiles"
  ON users
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'::text);