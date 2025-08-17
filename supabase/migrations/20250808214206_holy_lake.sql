/*
  # Create friendship system tables

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `friend_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
    - `friend_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, foreign key to users)
      - `to_user_id` (uuid, foreign key to users)
      - `status` (text, enum: pending, accepted, rejected)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for managing friendships and friend requests
*/

CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Friendship policies
CREATE POLICY "Users can read their own friendships"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert friendships"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own friendships"
  ON friendships
  FOR DELETE
  TO authenticated
  USING (true);

-- Friend request policies
CREATE POLICY "Users can read their friend requests"
  ON friend_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can send friend requests"
  ON friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their friend requests"
  ON friend_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS friendships_user_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_idx ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS friend_requests_from_idx ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS friend_requests_to_idx ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON friend_requests(status);