-- Create weather_essentials table
CREATE TABLE IF NOT EXISTS weather_essentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  size VARCHAR(50),
  color VARCHAR(100),
  condition VARCHAR(20) NOT NULL DEFAULT 'good',
  weather_conditions TEXT[] DEFAULT '{}',
  assigned_to UUID[] DEFAULT '{}',
  image_url TEXT,
  image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weather_essentials_user_id ON weather_essentials(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_category ON weather_essentials(category);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_profile_id ON weather_essentials(wardrobe_profile_id);

-- Enable Row Level Security
ALTER TABLE weather_essentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own weather essentials" ON weather_essentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather essentials" ON weather_essentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather essentials" ON weather_essentials
  FOR UPDATE USING (auth.uid() = user_id);

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

CREATE TRIGGER update_weather_essentials_updated_at 
  BEFORE UPDATE ON weather_essentials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
