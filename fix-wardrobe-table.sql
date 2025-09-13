-- Fix wardrobe_items table schema for Weather Smart app
-- Run this SQL in your Supabase SQL Editor

-- First, let's check if the table exists and what columns it has
-- (This is just for reference, you can see the results in Supabase)

-- Add the missing category column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'wardrobe_items' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE wardrobe_items ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to wardrobe_items table';
    ELSE
        RAISE NOTICE 'Category column already exists in wardrobe_items table';
    END IF;
END $$;

-- Ensure all other required columns exist
DO $$ 
BEGIN
    -- Add missing columns one by one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'wardrobe_profile_id') THEN
        ALTER TABLE wardrobe_items ADD COLUMN wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'condition') THEN
        ALTER TABLE wardrobe_items ADD COLUMN condition TEXT DEFAULT 'good';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'wear_count') THEN
        ALTER TABLE wardrobe_items ADD COLUMN wear_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'is_favorite') THEN
        ALTER TABLE wardrobe_items ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'last_worn') THEN
        ALTER TABLE wardrobe_items ADD COLUMN last_worn DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'image_url') THEN
        ALTER TABLE wardrobe_items ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'image_path') THEN
        ALTER TABLE wardrobe_items ADD COLUMN image_path TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'price') THEN
        ALTER TABLE wardrobe_items ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wardrobe_items' AND column_name = 'purchase_date') THEN
        ALTER TABLE wardrobe_items ADD COLUMN purchase_date DATE;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Recreate policies (drop and create to ensure they're correct)
DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON wardrobe_items;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON wardrobe_items;

CREATE POLICY "Users can view their own wardrobe items" ON wardrobe_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" ON wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'wardrobe_items'
ORDER BY ordinal_position;
