-- Create outfit_recommendations table for AI-generated suggestions
CREATE TABLE IF NOT EXISTS outfit_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  occasion TEXT,
  weather_data JSONB,
  location TEXT,
  ai_response TEXT,
  recommended_items UUID[],
  similar_items JSONB,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfit_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy for outfit_recommendations
DROP POLICY IF EXISTS "Users can manage their own outfit recommendations" ON outfit_recommendations;
CREATE POLICY "Users can manage their own outfit recommendations" ON outfit_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Create outfits table for saved outfit combinations
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  weather_condition TEXT,
  temperature_range TEXT,
  season TEXT,
  is_favorite BOOLEAN DEFAULT false,
  worn_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Create policy for outfits
DROP POLICY IF EXISTS "Users can manage their own outfits" ON outfits;
CREATE POLICY "Users can manage their own outfits" ON outfits
  FOR ALL USING (auth.uid() = user_id);

-- Create outfit_items junction table
CREATE TABLE IF NOT EXISTS outfit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, wardrobe_item_id)
);

-- Enable RLS
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- Create policy for outfit_items
DROP POLICY IF EXISTS "Users can manage outfit items for their outfits" ON outfit_items;
CREATE POLICY "Users can manage outfit items for their outfits" ON outfit_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM outfits 
      WHERE outfits.id = outfit_items.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

-- Create outfit_categories table
CREATE TABLE IF NOT EXISTS outfit_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6B7280',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for outfit_categories
ALTER TABLE outfit_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for outfit_categories (readable by all authenticated users)
DROP POLICY IF EXISTS "Outfit categories are readable by all authenticated users" ON outfit_categories;
CREATE POLICY "Outfit categories are readable by all authenticated users" ON outfit_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default outfit categories
INSERT INTO outfit_categories (name, description, icon, color, display_order) VALUES
  ('Casual', 'Everyday comfortable outfits', '👕', '#10B981', 1),
  ('Work', 'Professional business attire', '💼', '#3B82F6', 2),
  ('Formal', 'Elegant formal wear', '🤵', '#8B5CF6', 3),
  ('Date Night', 'Special occasion outfits', '💕', '#EC4899', 4),
  ('Exercise', 'Athletic and workout wear', '🏃', '#F59E0B', 5),
  ('Travel', 'Comfortable travel outfits', '✈️', '#06B6D4', 6),
  ('Weekend', 'Relaxed weekend looks', '🌞', '#84CC16', 7)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_user_id ON outfit_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_created_at ON outfit_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_wardrobe_item_id ON outfit_items(wardrobe_item_id);
