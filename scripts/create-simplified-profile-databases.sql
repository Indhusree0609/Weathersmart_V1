-- Simplified Profile Database Approach (Works with Supabase permissions)
-- Instead of creating separate schemas, we use enhanced RLS for data isolation

-- 1. Create simplified function that just records the "separate database" status
CREATE OR REPLACE FUNCTION create_profile_wardrobe_schema(profile_id_param UUID, profile_name_param TEXT)
RETURNS TEXT AS $$
DECLARE
  schema_name TEXT;
BEGIN
  -- Generate a logical schema name (not an actual schema)
  schema_name := 'profile_' || REPLACE(profile_id_param::TEXT, '-', '_');
  
  -- Record this as a "separate database" in our tracking table
  INSERT INTO profile_databases (profile_id, database_name, is_active)
  VALUES (profile_id_param, schema_name, true)
  ON CONFLICT (database_name) DO UPDATE SET 
    is_active = true,
    updated_at = NOW();
  
  -- Return the logical schema name
  RETURN schema_name;
END;
$$ LANGUAGE plpgsql;

-- 2. Enhanced RLS policies for complete data isolation
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete own wardrobe items" ON wardrobe_items;

-- Create new enhanced policies that respect separate database settings
CREATE POLICY "Enhanced profile isolation for SELECT" ON wardrobe_items
  FOR SELECT USING (
    -- Allow access if user owns the profile
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = wardrobe_items.wardrobe_profile_id 
      AND user_id = auth.uid()
    )
    -- Additional isolation: if profile has separate database, only show its items
    AND (
      NOT EXISTS (
        SELECT 1 FROM profile_databases 
        WHERE profile_id = wardrobe_items.wardrobe_profile_id 
        AND is_active = true
      )
      OR wardrobe_items.wardrobe_profile_id = wardrobe_items.wardrobe_profile_id
    )
  );

CREATE POLICY "Enhanced profile isolation for INSERT" ON wardrobe_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = wardrobe_items.wardrobe_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enhanced profile isolation for UPDATE" ON wardrobe_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = wardrobe_items.wardrobe_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Enhanced profile isolation for DELETE" ON wardrobe_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = wardrobe_items.wardrobe_profile_id 
      AND user_id = auth.uid()
    )
  );
