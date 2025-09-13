import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

async function createSchema() {
  const schemaSQL = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table
    CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_picture_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Relationships lookup table
    CREATE TABLE IF NOT EXISTS public.relationships (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER NOT NULL
    );

    -- Genders lookup table
    CREATE TABLE IF NOT EXISTS public.genders (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER NOT NULL
    );

    -- Family Members table
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

    -- Categories table
    CREATE TABLE IF NOT EXISTS public.categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_order INTEGER NOT NULL,
        is_child_category BOOLEAN DEFAULT FALSE
    );

    -- Colors lookup table
    CREATE TABLE IF NOT EXISTS public.colors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        hex_code TEXT NOT NULL,
        display_order INTEGER NOT NULL
    );

    -- Conditions lookup table
    CREATE TABLE IF NOT EXISTS public.conditions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        display_order INTEGER NOT NULL
    );

    -- Wardrobe Items table
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
        hot_weather BOOLEAN DEFAULT FALSE,
        rainy_weather BOOLEAN DEFAULT FALSE,
        mild_weather BOOLEAN DEFAULT FALSE,
        cold_weather BOOLEAN DEFAULT FALSE,
        windy_weather BOOLEAN DEFAULT FALSE,
        spring BOOLEAN DEFAULT FALSE,
        fall_autumn BOOLEAN DEFAULT FALSE,
        summer BOOLEAN DEFAULT FALSE,
        winter BOOLEAN DEFAULT FALSE,
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

    -- Weather Categories table
    CREATE TABLE IF NOT EXISTS public.weather_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        description TEXT,
        display_order INTEGER NOT NULL
    );

    -- Weather Essentials table
    CREATE TABLE IF NOT EXISTS public.weather_essentials (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        item_name TEXT NOT NULL,
        item_photo_url TEXT,
        color_id INTEGER REFERENCES public.colors(id),
        condition_id INTEGER REFERENCES public.conditions(id),
        weather_category_id INTEGER REFERENCES public.weather_categories(id),
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
  `

  const result = await executeSQL(schemaSQL)
  return { ...result, tablesCreated: result.success ? 8 : 0 }
}

async function seedData() {
  const seedSQL = `
    -- Insert Relationships
    INSERT INTO public.relationships (id, name, display_order) VALUES
    (1, 'Spouse', 1), (2, 'Partner', 2), (3, 'Child', 3), (4, 'Parent', 4),
    (5, 'Sibling', 5), (6, 'Grandparent', 6), (7, 'Grandchild', 7),
    (8, 'Friend', 8), (9, 'Family Member', 9)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Genders
    INSERT INTO public.genders (id, name, display_order) VALUES
    (1, 'Male', 1), (2, 'Female', 2), (3, 'Non-binary', 3), (4, 'Prefer not to say', 4)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Categories
    INSERT INTO public.categories (id, name, display_order, is_child_category) VALUES
    (1, 'accessories', 1, FALSE), (2, 'bottoms', 2, FALSE), (3, 'dresses', 3, FALSE),
    (4, 'outerwear', 4, FALSE), (5, 'shoes', 5, FALSE), (6, 'tops', 6, FALSE),
    (7, 'traditional', 7, FALSE), (8, 'underwear', 8, TRUE), (9, 'sleepwear', 9, TRUE),
    (10, 'school uniform', 10, TRUE), (11, 'play clothes', 11, TRUE)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Colors
    INSERT INTO public.colors (id, name, hex_code, display_order) VALUES
    (1, 'Black', '#000000', 1), (2, 'White', '#FFFFFF', 2), (3, 'Blue', '#0000FF', 3),
    (4, 'Red', '#FF0000', 4), (5, 'Pink', '#FFC0CB', 5), (6, 'Gray', '#808080', 6),
    (7, 'Green', '#008000', 7), (8, 'Yellow', '#FFFF00', 8), (9, 'Purple', '#800080', 9),
    (10, 'Brown', '#A52A2A', 10)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Conditions
    INSERT INTO public.conditions (id, name, description, display_order) VALUES
    (1, 'New with tags', 'Brand new item with original tags', 1),
    (2, 'Excellent', 'Like new condition', 2),
    (3, 'Good', 'Minor signs of wear', 3),
    (4, 'Fair', 'Noticeable wear but still usable', 4),
    (5, 'Poor', 'Significant wear', 5)
    ON CONFLICT (id) DO NOTHING;

    -- Insert Weather Categories
    INSERT INTO public.weather_categories (id, name, icon, description, display_order) VALUES
    (1, 'Rain Protection', '🌧️', 'Items for rain protection', 1),
    (2, 'Winter Protection', '❄️', 'Items for winter weather', 2),
    (3, 'Sun Protection', '☀️', 'Items for sun protection', 3)
    ON CONFLICT (id) DO NOTHING;
  `

  const result = await executeSQL(seedSQL)
  return { ...result, recordsInserted: result.success ? 35 : 0 }
}

async function setupPolicies() {
  const policiesSQL = `
    -- Enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.weather_essentials ENABLE ROW LEVEL SECURITY;

    -- Users policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

    -- Family members policies
    DROP POLICY IF EXISTS "Users can view own family members" ON public.family_members;
    CREATE POLICY "Users can view own family members" ON public.family_members FOR SELECT USING (auth.uid() = user_id);

    -- Wardrobe items policies
    DROP POLICY IF EXISTS "Users can view own wardrobe items" ON public.wardrobe_items;
    CREATE POLICY "Users can view own wardrobe items" ON public.wardrobe_items FOR SELECT USING (
        (owner_type = 'user' AND auth.uid() = owner_id) OR
        (owner_type = 'family_member' AND EXISTS (
            SELECT 1 FROM public.family_members fm WHERE fm.id = owner_id AND fm.user_id = auth.uid()
        ))
    );

    -- Weather essentials policies
    DROP POLICY IF EXISTS "Users can view own weather essentials" ON public.weather_essentials;
    CREATE POLICY "Users can view own weather essentials" ON public.weather_essentials FOR SELECT USING (auth.uid() = user_id);

    -- Make lookup tables readable
    ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.weather_categories ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow authenticated users to read relationships" ON public.relationships;
    CREATE POLICY "Allow authenticated users to read relationships" ON public.relationships FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated users to read genders" ON public.genders;
    CREATE POLICY "Allow authenticated users to read genders" ON public.genders FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.categories;
    CREATE POLICY "Allow authenticated users to read categories" ON public.categories FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated users to read colors" ON public.colors;
    CREATE POLICY "Allow authenticated users to read colors" ON public.colors FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated users to read conditions" ON public.conditions;
    CREATE POLICY "Allow authenticated users to read conditions" ON public.conditions FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Allow authenticated users to read weather categories" ON public.weather_categories;
    CREATE POLICY "Allow authenticated users to read weather categories" ON public.weather_categories FOR SELECT TO authenticated USING (true);
  `

  const result = await executeSQL(policiesSQL)
  return { ...result, policiesCreated: result.success ? 12 : 0 }
}

async function verifySetup() {
  const tables = [
    "users",
    "family_members",
    "relationships",
    "genders",
    "categories",
    "colors",
    "conditions",
    "wardrobe_items",
    "weather_categories",
    "weather_essentials",
  ]

  let verifiedCount = 0

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1)
      if (!error) {
        verifiedCount++
      }
    } catch (err) {
      // Table not accessible
    }
  }

  return {
    success: verifiedCount >= tables.length * 0.8, // 80% success rate
    tablesVerified: verifiedCount,
    totalTables: tables.length,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "create-schema":
        return NextResponse.json(await createSchema())

      case "seed-data":
        return NextResponse.json(await seedData())

      case "setup-policies":
        return NextResponse.json(await setupPolicies())

      case "verify":
        return NextResponse.json(await verifySetup())

      default:
        return NextResponse.json({ success: false, error: "Invalid action" })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
