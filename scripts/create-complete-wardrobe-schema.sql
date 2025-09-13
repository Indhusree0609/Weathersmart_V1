-- Complete Multi-User Family Wardrobe Database Schema
-- This script creates all tables with proper relationships and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Relationships lookup table
CREATE TABLE IF NOT EXISTS public.relationships (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL
);

-- 3. Genders lookup table
CREATE TABLE IF NOT EXISTS public.genders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL
);

-- 4. Family Members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship_id INTEGER REFERENCES public.relationships(id),
    date_of_birth DATE,
    gender_id INTEGER REFERENCES public.genders(id),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Categories table (with child-specific flag)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL,
    is_child_category BOOLEAN DEFAULT FALSE
);

-- 6. Colors lookup table
CREATE TABLE IF NOT EXISTS public.colors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT NOT NULL,
    display_order INTEGER NOT NULL
);

-- 7. Conditions lookup table
CREATE TABLE IF NOT EXISTS public.conditions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL
);

-- 8. Safety Features table (for children's items)
CREATE TABLE IF NOT EXISTS public.safety_features (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    display_order INTEGER NOT NULL
);

-- 9. Activities table (for children's items)
CREATE TABLE IF NOT EXISTS public.activities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL
);

-- 10. Weather Categories table
CREATE TABLE IF NOT EXISTS public.weather_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    display_order INTEGER NOT NULL
);

-- 11. Weather Item Types table
CREATE TABLE IF NOT EXISTS public.weather_item_types (
    id SERIAL PRIMARY KEY,
    weather_category_id INTEGER REFERENCES public.weather_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL
);

-- 12. Main Wardrobe Items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID NOT NULL,
    owner_type TEXT NOT NULL CHECK (owner_type IN ('user', 'family_member')),
    item_name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    color_id INTEGER REFERENCES public.colors(id),
    size TEXT,
    condition_id INTEGER REFERENCES public.conditions(id),
    price DECIMAL(10,2),
    purchase_date DATE,
    times_worn INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES public.categories(id),
    image_url TEXT,
    
    -- Weather suitability flags
    hot_weather BOOLEAN DEFAULT FALSE,
    rainy_weather BOOLEAN DEFAULT FALSE,
    mild_weather BOOLEAN DEFAULT FALSE,
    cold_weather BOOLEAN DEFAULT FALSE,
    windy_weather BOOLEAN DEFAULT FALSE,
    
    -- Season flags
    spring BOOLEAN DEFAULT FALSE,
    fall_autumn BOOLEAN DEFAULT FALSE,
    summer BOOLEAN DEFAULT FALSE,
    winter BOOLEAN DEFAULT FALSE,
    
    -- Occasion flags
    work_professional BOOLEAN DEFAULT FALSE,
    formal_event BOOLEAN DEFAULT FALSE,
    travel BOOLEAN DEFAULT FALSE,
    home_lounging BOOLEAN DEFAULT FALSE,
    casual BOOLEAN DEFAULT FALSE,
    date_night BOOLEAN DEFAULT FALSE,
    exercise_gym BOOLEAN DEFAULT FALSE,
    work_appropriate BOOLEAN DEFAULT FALSE,
    
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Weather Essentials table
CREATE TABLE IF NOT EXISTS public.weather_essentials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    item_photo_url TEXT,
    color_id INTEGER REFERENCES public.colors(id),
    condition_id INTEGER REFERENCES public.conditions(id),
    weather_category_id INTEGER REFERENCES public.weather_categories(id),
    item_type_id INTEGER REFERENCES public.weather_item_types(id),
    
    -- Weather condition flags
    rain BOOLEAN DEFAULT FALSE,
    snow BOOLEAN DEFAULT FALSE,
    sun BOOLEAN DEFAULT FALSE,
    wind BOOLEAN DEFAULT FALSE,
    cold BOOLEAN DEFAULT FALSE,
    hot BOOLEAN DEFAULT FALSE,
    humid BOOLEAN DEFAULT FALSE,
    dry BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Junction table for item safety features
CREATE TABLE IF NOT EXISTS public.item_safety_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
    safety_feature_id INTEGER REFERENCES public.safety_features(id) ON DELETE CASCADE,
    UNIQUE(item_id, safety_feature_id)
);

-- 15. Junction table for item activities
CREATE TABLE IF NOT EXISTS public.item_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES public.activities(id) ON DELETE CASCADE,
    UNIQUE(item_id, activity_id)
);

-- 16. Weather Essential Assignments table
CREATE TABLE IF NOT EXISTS public.weather_essential_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    weather_essential_id UUID REFERENCES public.weather_essentials(id) ON DELETE CASCADE,
    assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('user', 'family_member')),
    assigned_to_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_owner ON public.wardrobe_items(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON public.wardrobe_items(category_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_user ON public.weather_essentials(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_essentials_category ON public.weather_essentials(weather_category_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wardrobe_items_updated_at BEFORE UPDATE ON public.wardrobe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weather_essentials_updated_at BEFORE UPDATE ON public.weather_essentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_essentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_safety_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_essential_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for family_members
CREATE POLICY "Users can view own family members" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own family members" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own family members" ON public.family_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own family members" ON public.family_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wardrobe_items
CREATE POLICY "Users can view own wardrobe items" ON public.wardrobe_items FOR SELECT USING (
    (owner_type = 'user' AND auth.uid() = owner_id) OR
    (owner_type = 'family_member' AND EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.id = owner_id AND fm.user_id = auth.uid()
    ))
);

CREATE POLICY "Users can insert own wardrobe items" ON public.wardrobe_items FOR INSERT WITH CHECK (
    (owner_type = 'user' AND auth.uid() = owner_id) OR
    (owner_type = 'family_member' AND EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.id = owner_id AND fm.user_id = auth.uid()
    ))
);

CREATE POLICY "Users can update own wardrobe items" ON public.wardrobe_items FOR UPDATE USING (
    (owner_type = 'user' AND auth.uid() = owner_id) OR
    (owner_type = 'family_member' AND EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.id = owner_id AND fm.user_id = auth.uid()
    ))
);

CREATE POLICY "Users can delete own wardrobe items" ON public.wardrobe_items FOR DELETE USING (
    (owner_type = 'user' AND auth.uid() = owner_id) OR
    (owner_type = 'family_member' AND EXISTS (
        SELECT 1 FROM public.family_members fm WHERE fm.id = owner_id AND fm.user_id = auth.uid()
    ))
);

-- RLS Policies for weather_essentials
CREATE POLICY "Users can view own weather essentials" ON public.weather_essentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weather essentials" ON public.weather_essentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weather essentials" ON public.weather_essentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weather essentials" ON public.weather_essentials FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for junction tables
CREATE POLICY "Users can view own item safety features" ON public.item_safety_features FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = item_id AND (
            (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
            (wi.owner_type = 'family_member' AND EXISTS (
                SELECT 1 FROM public.family_members fm WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
            ))
        )
    )
);

CREATE POLICY "Users can manage own item safety features" ON public.item_safety_features FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = item_id AND (
            (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
            (wi.owner_type = 'family_member' AND EXISTS (
                SELECT 1 FROM public.family_members fm WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
            ))
        )
    )
);

CREATE POLICY "Users can view own item activities" ON public.item_activities FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = item_id AND (
            (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
            (wi.owner_type = 'family_member' AND EXISTS (
                SELECT 1 FROM public.family_members fm WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
            ))
        )
    )
);

CREATE POLICY "Users can manage own item activities" ON public.item_activities FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = item_id AND (
            (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
            (wi.owner_type = 'family_member' AND EXISTS (
                SELECT 1 FROM public.family_members fm WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
            ))
        )
    )
);

-- Make lookup tables readable by all authenticated users
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_item_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read lookup tables
CREATE POLICY "Allow authenticated users to read relationships" ON public.relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read genders" ON public.genders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read colors" ON public.colors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read conditions" ON public.conditions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read safety features" ON public.safety_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read weather categories" ON public.weather_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read weather item types" ON public.weather_item_types FOR SELECT TO authenticated USING (true);
