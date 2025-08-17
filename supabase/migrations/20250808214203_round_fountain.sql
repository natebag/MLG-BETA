/*
  # Create achievements table

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `achievement_id` (text)
      - `unlocked_at` (timestamp)
      - `points` (integer)

  2. Security
    - Enable RLS on `achievements` table
    - Add policies for reading achievements and inserting new achievements
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  points integer NOT NULL,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow users to read all achievements (for leaderboards, etc.)
CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert achievements
CREATE POLICY "Authenticated users can insert achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS achievements_user_idx ON achievements(user_id);
CREATE INDEX IF NOT EXISTS achievements_achievement_idx ON achievements(achievement_id);
CREATE INDEX IF NOT EXISTS achievements_points_idx ON achievements(points DESC);