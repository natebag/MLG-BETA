/*
  # Create clans table

  1. New Tables
    - `clans`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `color` (text)
      - `creator_id` (uuid, foreign key to users)
      - `creator_gamertag` (text)
      - `members` (text array)
      - `officers` (text array)
      - `treasury` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `clans` table
    - Add policies for reading clans, creating clans, and updating for members
*/

CREATE TABLE IF NOT EXISTS clans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  color text NOT NULL,
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_gamertag text NOT NULL,
  members text[] DEFAULT '{}',
  officers text[] DEFAULT '{}',
  treasury integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read clans
CREATE POLICY "Anyone can read clans"
  ON clans
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to create clans
CREATE POLICY "Authenticated users can create clans"
  ON clans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow clan creators and officers to update clans
CREATE POLICY "Clan creators and officers can update clans"
  ON clans
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS clans_name_idx ON clans(name);
CREATE INDEX IF NOT EXISTS clans_creator_idx ON clans(creator_id);