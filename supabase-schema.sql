-- License Plate Tracker Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX idx_groups_code ON groups(code);

-- Group members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- License plates table
CREATE TABLE license_plates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  photo_path TEXT NOT NULL,
  is_vanity BOOLEAN DEFAULT FALSE,
  is_special BOOLEAN DEFAULT FALSE,
  special_type TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  spotted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id, state)
);

-- Create indexes for faster queries
CREATE INDEX idx_license_plates_user_id ON license_plates(user_id);
CREATE INDEX idx_license_plates_group_id ON license_plates(group_id);
CREATE INDEX idx_license_plates_state ON license_plates(state);

-- User profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username
CREATE INDEX idx_profiles_username ON profiles(username);

-- Row Level Security (RLS) Policies

-- Helper function to check group membership (prevents RLS recursion)
CREATE OR REPLACE FUNCTION is_group_member(check_group_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = check_group_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  USING (is_group_member(id, auth.uid()) OR created_by = auth.uid());

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- License plates policies
CREATE POLICY "Users can view plates in their groups"
  ON license_plates FOR SELECT
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can add their own plates"
  ON license_plates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plates"
  ON license_plates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plates"
  ON license_plates FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
