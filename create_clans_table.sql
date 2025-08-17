-- Create clans table if it doesn't exist
CREATE TABLE IF NOT EXISTS clans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 1,
  is_recruiting BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clan_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS clan_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clan_id, user_id)
);

-- Create vote_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS vote_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  vote_type TEXT DEFAULT 'free' CHECK (vote_type IN ('free', 'paid')),
  mlg_tokens_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, clip_id)
);

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add votes_used_today column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'votes_used_today') THEN
    ALTER TABLE users ADD COLUMN votes_used_today INTEGER DEFAULT 0;
  END IF;

  -- Add last_vote_reset column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_vote_reset') THEN
    ALTER TABLE users ADD COLUMN last_vote_reset DATE;
  END IF;

  -- Add clan_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'clan_id') THEN
    ALTER TABLE users ADD COLUMN clan_id UUID REFERENCES clans(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON clan_members(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_history_user_id ON vote_history(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_history_clip_id ON vote_history(clip_id);
CREATE INDEX IF NOT EXISTS idx_users_clan_id ON users(clan_id);

-- Insert the default MLG clan if it doesn't exist
INSERT INTO clans (id, name, tag, description, color, owner_id, created_by, member_count, is_recruiting)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Major League Gaming',
  '[MLG]',
  'The original MLG clan - home to elite gamers and content creators.',
  '#8B5CF6',
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  (SELECT COUNT(*) FROM users),
  true
WHERE NOT EXISTS (SELECT 1 FROM clans WHERE name = 'Major League Gaming');

-- Add all existing users to the MLG clan if they don't have a clan
INSERT INTO clan_members (clan_id, user_id, role, joined_at)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  u.id,
  'member',
  NOW()
FROM users u
WHERE u.clan_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM clan_members cm 
    WHERE cm.user_id = u.id 
    AND cm.clan_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- Update users to have the MLG clan_id if they don't have one
UPDATE users 
SET clan_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE clan_id IS NULL;