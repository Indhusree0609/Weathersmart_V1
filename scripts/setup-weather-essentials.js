const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWeatherEssentials() {
  try {
    console.log('Setting up weather essentials table...');

    // Check if table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('weather_essentials')
      .select('count')
      .limit(1);

    if (tableError && (tableError.code === 'PGRST116' || tableError.message?.includes('does not exist'))) {
      console.log('Weather essentials table does not exist. Creating it...');
      
      // Create the table using SQL
      const createTableSQL = `
        -- Create weather_essentials table
        CREATE TABLE IF NOT EXISTS weather_essentials (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE SET NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          size TEXT,
          color TEXT,
          condition TEXT NOT NULL CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
          weather_conditions TEXT[] NOT NULL DEFAULT '{}',
          assigned_to TEXT[] NOT NULL DEFAULT '{}',
          image_url TEXT,
          image_path TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_weather_essentials_user_id ON weather_essentials(user_id);
        CREATE INDEX IF NOT EXISTS idx_weather_essentials_wardrobe_profile_id ON weather_essentials(wardrobe_profile_id);
        CREATE INDEX IF NOT EXISTS idx_weather_essentials_category ON weather_essentials(category);
        CREATE INDEX IF NOT EXISTS idx_weather_essentials_weather_conditions ON weather_essentials USING GIN(weather_conditions);

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
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating weather essentials table:', createError);
        console.log('\nPlease run this SQL manually in your Supabase SQL editor:');
        console.log(createTableSQL);
        return;
      }

      console.log('✅ Weather essentials table created successfully!');
    } else if (tableError) {
      console.error('Error checking table:', tableError);
      return;
    } else {
      console.log('✅ Weather essentials table already exists!');
    }

    // Test the table
    console.log('Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('weather_essentials')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('Error testing table:', testError);
    } else {
      console.log('✅ Table is accessible and ready to use!');
    }

  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\nIf the automated setup failed, please run this SQL manually in your Supabase SQL editor:');
    console.log(`
-- Create weather_essentials table
CREATE TABLE IF NOT EXISTS weather_essentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT,
  color TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
  weather_conditions TEXT[] NOT NULL DEFAULT '{}',
  assigned_to TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weather_essentials_user_id ON weather_essentials(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_wardrobe_profile_id ON weather_essentials(wardrobe_profile_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_category ON weather_essentials(category);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_weather_conditions ON weather_essentials USING GIN(weather_conditions);

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
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
    `);
  }
}

if (require.main === module) {
  setupWeatherEssentials();
}

module.exports = { setupWeatherEssentials };
