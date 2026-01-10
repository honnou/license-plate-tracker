-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor to fix the group_members policy

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view plates in their groups" ON license_plates;

-- Create a helper function to check group membership (prevents recursion)
CREATE OR REPLACE FUNCTION is_group_member(check_group_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = check_group_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate group_members SELECT policy without recursion
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    is_group_member(group_id, auth.uid())
  );

-- Recreate license_plates SELECT policy using the function
CREATE POLICY "Users can view plates in their groups"
  ON license_plates FOR SELECT
  USING (
    is_group_member(group_id, auth.uid())
  );
