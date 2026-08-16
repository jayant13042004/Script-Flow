-- ScriptFlow Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders for organizing scripts
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Script',
  content JSONB,
  plain_text TEXT DEFAULT '',
  platform TEXT,
  content_type TEXT,
  tone TEXT,
  language TEXT DEFAULT 'en',
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  estimated_duration INTEGER DEFAULT 0,
  production_plan JSONB,
  structure JSONB,
  is_archived BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Script version history
CREATE TABLE IF NOT EXISTS script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES scripts ON DELETE CASCADE NOT NULL,
  content JSONB,
  plain_text TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User custom hooks
CREATE TABLE IF NOT EXISTS custom_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  example TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hook favorites (references both built-in hook IDs and custom hook UUIDs)
CREATE TABLE IF NOT EXISTS hook_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  hook_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hook_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_folder_id ON scripts(folder_id);
CREATE INDEX IF NOT EXISTS idx_scripts_updated_at ON scripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_script_versions_script_id ON script_versions(script_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_hooks_user_id ON custom_hooks(user_id);
CREATE INDEX IF NOT EXISTS idx_hook_favorites_user_id ON hook_favorites(user_id);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders: users can only manage their own folders
CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (auth.uid() = user_id);

-- Scripts: users can only manage their own scripts
CREATE POLICY "Users can manage own scripts" ON scripts FOR ALL USING (auth.uid() = user_id);

-- Script Versions: users can manage versions of their own scripts
CREATE POLICY "Users can manage own script versions" ON script_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM scripts WHERE scripts.id = script_versions.script_id AND scripts.user_id = auth.uid())
  );

-- Custom Hooks: users can manage their own hooks
CREATE POLICY "Users can manage own custom hooks" ON custom_hooks FOR ALL USING (auth.uid() = user_id);

-- Hook Favorites: users can manage their own favorites
CREATE POLICY "Users can manage own hook favorites" ON hook_favorites FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
