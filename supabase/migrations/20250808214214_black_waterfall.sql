/*
  # Create chat messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `channel` (text) - trollbox, clan, dm, etc.
      - `sender_id` (uuid, foreign key to users)
      - `sender_gamertag` (text)
      - `sender_clan_tag` (text, optional)
      - `sender_clan_color` (text, optional)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_messages` table
    - Add policies for reading and sending messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_gamertag text NOT NULL,
  sender_clan_tag text,
  sender_clan_color text,
  message text NOT NULL CHECK (length(message) <= 500),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messages
CREATE POLICY "Authenticated users can read chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to send messages
CREATE POLICY "Authenticated users can send chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_messages_channel_idx ON chat_messages(channel);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_sender_idx ON chat_messages(sender_id);

-- Create a function to automatically clean old messages (keep last 1000 per channel)
CREATE OR REPLACE FUNCTION clean_old_chat_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages 
  WHERE id IN (
    SELECT id FROM chat_messages 
    WHERE channel IN (
      SELECT DISTINCT channel FROM chat_messages
    )
    ORDER BY created_at DESC 
    OFFSET 1000
  );
END;
$$ LANGUAGE plpgsql;