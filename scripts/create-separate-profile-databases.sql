-- Weather Smart: Separate Database Schema for Each Profile
-- This script creates a new approach where each profile gets its own isolated database space

-- 1. Create a new table to track profile databases
CREATE TABLE IF NOT EXISTS profile_databases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE NOT NULL,
  database_name VARCHAR(255) NOT NULL UNIQUE,
  connection_string TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create a new user management table for profile-specific authentication
CREATE TABLE IF NOT EXISTS profile_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES wardrobe_profiles(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  auth_provider VARCHAR(50) DEFAULT 'supabase',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create profile-specific wardrobe items table template
-- This will be dynamically created for each profile
CREATE OR REPLACE FUNCTION create_profile_wardrobe_schema(profile_id_param UUID, profile_name_param TEXT)
RETURNS TEXT AS $$
DECLARE
  schema_name TEXT;
  table_prefix TEXT;
BEGIN
  -- Generate schema name based on profile
  schema_name := 'profile_' || REPLACE(profile_id_param::TEXT, '-', '_');
  table_prefix := 'wardrobe_' || REPLACE(profile_name_param, ' ', '_');
  
  -- Create schema for this profile
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Create wardrobe_items table for this profile
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.wardrobe_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      profile_id UUID DEFAULT %L,
      category_id UUID REFERENCES public.categories(id) NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      color TEXT,
      size TEXT,
      price DECIMAL(10,2),
      purchase_date DATE,
      image_url TEXT,
      image_path TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      condition TEXT CHECK (condition IN (''new'', ''excellent'', ''good'', ''fair'', ''poor'')) DEFAULT ''good'',
      last_worn DATE,
      wear_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', schema_name, profile_id_param);
  
  -- Create wardrobe_item_tags table for this profile
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.wardrobe_item_tags (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      wardrobe_item_id UUID REFERENCES %I.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
      tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(wardrobe_item_id, tag_id)
    )', schema_name, schema_name);
  
  -- Create outfits table for this profile
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.outfits (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      profile_id UUID DEFAULT %L,
      name TEXT NOT NULL,
      description TEXT,
      occasion TEXT,
      weather_condition TEXT,
      temperature_range TEXT,
      season TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      worn_date DATE,
      image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', schema_name, profile_id_param);
  
  -- Create outfit_items table for this profile
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.outfit_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      outfit_id UUID REFERENCES %I.outfits(id) ON DELETE CASCADE NOT NULL,
      wardrobe_item_id UUID REFERENCES %I.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(outfit_id, wardrobe_item_id)
    )', schema_name, schema_name, schema_name);
  
  -- Create indexes for better performance
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_wardrobe_items_profile_id ON %I.wardrobe_items(profile_id)', 
    REPLACE(schema_name, 'profile_', ''), schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_wardrobe_items_category_id ON %I.wardrobe_items(category_id)', 
    REPLACE(schema_name, 'profile_', ''), schema_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_wardrobe_items_created_at ON %I.wardrobe_items(created_at DESC)', 
    REPLACE(schema_name, 'profile_', ''), schema_name);
  
  -- Enable Row Level Security
  EXECUTE format('ALTER TABLE %I.wardrobe_items ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.wardrobe_item_tags ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.outfits ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.outfit_items ENABLE ROW LEVEL SECURITY', schema_name);
  
  -- Create RLS policies for this profile's data
  EXECUTE format('
    CREATE POLICY "Profile can view own wardrobe items" ON %I.wardrobe_items
      FOR SELECT USING (profile_id = %L)', schema_name, profile_id_param);
  
  EXECUTE format('
    CREATE POLICY "Profile can insert own wardrobe items" ON %I.wardrobe_items
      FOR INSERT WITH CHECK (profile_id = %L)', schema_name, profile_id_param);
  
  EXECUTE format('
    CREATE POLICY "Profile can update own wardrobe items" ON %I.wardrobe_items
      FOR UPDATE USING (profile_id = %L)', schema_name, profile_id_param);
  
  EXECUTE format('
    CREATE POLICY "Profile can delete own wardrobe items" ON %I.wardrobe_items
      FOR DELETE USING (profile_id = %L)', schema_name, profile_id_param);
  
  -- Create storage bucket for this profile
  INSERT INTO storage.buckets (id, name, public) 
  VALUES (schema_name || '-images', schema_name || '-wardrobe-images', false)
  ON CONFLICT (id) DO NOTHING;
  
  -- Create storage policies for this profile
  EXECUTE format('
    CREATE POLICY "Profile can upload images" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = %L)', schema_name || '-images');
  
  EXECUTE format('
    CREATE POLICY "Profile can view own images" ON storage.objects
      FOR SELECT USING (bucket_id = %L)', schema_name || '-images');
  
  RETURN schema_name;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to migrate existing data to separate schemas
CREATE OR REPLACE FUNCTION migrate_profile_to_separate_database(profile_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  profile_record RECORD;
  schema_name TEXT;
  migration_count INTEGER := 0;
BEGIN
  -- Get profile information
  SELECT * INTO profile_record FROM wardrobe_profiles WHERE id = profile_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', profile_id_param;
  END IF;
  
  -- Create the separate schema for this profile
  schema_name := create_profile_wardrobe_schema(profile_id_param, profile_record.name);
  
  -- Migrate existing wardrobe items from shared table to profile-specific table
  EXECUTE format('
    INSERT INTO %I.wardrobe_items (
      id, category_id, name, description, brand, color, size, price, 
      purchase_date, image_url, image_path, is_favorite, condition, 
      last_worn, wear_count, created_at, updated_at
    )
    SELECT 
      id, category_id, name, description, brand, color, size, price,
      purchase_date, image_url, image_path, is_favorite, condition,
      last_worn, wear_count, created_at, updated_at
    FROM public.wardrobe_items 
    WHERE wardrobe_profile_id = %L
    ON CONFLICT (id) DO NOTHING', schema_name, profile_id_param);
  
  GET DIAGNOSTICS migration_count = ROW_COUNT;
  
  -- Record the database creation in profile_databases table
  INSERT INTO profile_databases (profile_id, database_name, is_active)
  VALUES (profile_id_param, schema_name, true)
  ON CONFLICT (database_name) DO UPDATE SET 
    is_active = true,
    updated_at = NOW();
  
  -- Optionally remove migrated items from shared table
  -- DELETE FROM public.wardrobe_items WHERE wardrobe_profile_id = profile_id_param;
  
  RETURN format('Successfully migrated %s items to schema %s', migration_count, schema_name);
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get profile's database schema name
CREATE OR REPLACE FUNCTION get_profile_schema_name(profile_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  schema_name TEXT;
BEGIN
  SELECT database_name INTO schema_name 
  FROM profile_databases 
  WHERE profile_id = profile_id_param AND is_active = true;
  
  IF schema_name IS NULL THEN
    -- Schema doesn't exist yet, return null
    RETURN NULL;
  END IF;
  
  RETURN schema_name;
END;
$$ LANGUAGE plpgsql;

-- 6. Enable RLS on new tables
ALTER TABLE profile_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_users ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for profile management tables
CREATE POLICY "Users can view own profile databases" ON profile_databases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = profile_databases.profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own profile databases" ON profile_databases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM wardrobe_profiles 
      WHERE id = profile_databases.profile_id 
      AND user_id = auth.uid()
    )
  );

-- 8. Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profile_databases
  BEFORE UPDATE ON profile_databases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profile_users
  BEFORE UPDATE ON profile_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create a view to easily see all profile schemas
CREATE OR REPLACE VIEW profile_database_summary AS
SELECT 
  wp.id as profile_id,
  wp.name as profile_name,
  wp.relation,
  wp.user_id as owner_user_id,
  pd.database_name as schema_name,
  pd.is_active,
  pd.created_at as schema_created_at,
  (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = pd.database_name 
    AND table_name = 'wardrobe_items'
  ) as has_wardrobe_table
FROM wardrobe_profiles wp
LEFT JOIN profile_databases pd ON wp.id = pd.profile_id
WHERE pd.is_active = true OR pd.is_active IS NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
