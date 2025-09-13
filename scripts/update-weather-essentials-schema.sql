-- Add is_common column to weather_essentials table
-- This handles the case where items are shared by all family members

-- First, check if the table exists
DO $$
BEGIN
    -- Check if weather_essentials table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'weather_essentials') THEN
        -- Add is_common column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'weather_essentials' AND column_name = 'is_common') THEN
            ALTER TABLE weather_essentials ADD COLUMN is_common BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_common column to weather_essentials table';
        ELSE
            RAISE NOTICE 'is_common column already exists in weather_essentials table';
        END IF;
        
        -- Update existing records that might have 'common' in assigned_to
        -- Since we can't directly check for 'common' in a UUID array, we'll set all existing records to is_common = false
        UPDATE weather_essentials SET is_common = FALSE WHERE is_common IS NULL;
        RAISE NOTICE 'Updated existing weather_essentials records';
        
    ELSE
        RAISE NOTICE 'weather_essentials table does not exist yet. Please create it first.';
    END IF;
END
$$;

-- Create the weather_essentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS weather_essentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    color VARCHAR(100),
    condition VARCHAR(20) CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
    weather_conditions TEXT[] NOT NULL DEFAULT '{}',
    assigned_to UUID[] NOT NULL DEFAULT '{}',
    is_common BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    image_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weather_essentials_user_id ON weather_essentials(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_wardrobe_profile_id ON weather_essentials(wardrobe_profile_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_category ON weather_essentials(category);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_is_common ON weather_essentials(is_common);

-- Enable RLS (Row Level Security)
ALTER TABLE weather_essentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own weather essentials" ON weather_essentials;
CREATE POLICY "Users can view their own weather essentials" ON weather_essentials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own weather essentials" ON weather_essentials;
CREATE POLICY "Users can insert their own weather essentials" ON weather_essentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own weather essentials" ON weather_essentials;
CREATE POLICY "Users can update their own weather essentials" ON weather_essentials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own weather essentials" ON weather_essentials;
CREATE POLICY "Users can delete their own weather essentials" ON weather_essentials
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_weather_essentials_updated_at ON weather_essentials;
CREATE TRIGGER update_weather_essentials_updated_at
    BEFORE UPDATE ON weather_essentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
