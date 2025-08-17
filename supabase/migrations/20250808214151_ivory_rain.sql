/*
  # Create clips table

  1. New Tables
    - `clips`
      - `id` (uuid, primary key)
      - `title` (text)
      - `game` (text)
      - `url` (text)
      - `uploader_id` (uuid, foreign key to users)
      - `uploader_gamertag` (text)
      - `votes` (integer, default 0)
      - `likes` (integer, default 0)
      - `voters` (text array)
      - `likers` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `clips` table
    - Add policies for reading clips, inserting own clips, and updating votes/likes
*/

CREATE TABLE IF NOT EXISTS clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  game text NOT NULL,
  url text NOT NULL,
  uploader_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploader_gamertag text NOT NULL,
  votes integer DEFAULT 0,
  likes integer DEFAULT 0,
  voters text[] DEFAULT '{}',
  likers text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read clips
CREATE POLICY "Anyone can read clips"
  ON clips
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert clips
CREATE POLICY "Authenticated users can insert clips"
  ON clips
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update votes and likes
CREATE POLICY "Authenticated users can update clips"
  ON clips
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS clips_created_at_idx ON clips(created_at DESC);
CREATE INDEX IF NOT EXISTS clips_votes_idx ON clips(votes DESC);
CREATE INDEX IF NOT EXISTS clips_uploader_idx ON clips(uploader_id);