import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCollectionsFeature() {
  try {
    // Check if collections table exists
    const { data: collectionsData, error: collectionsError } = await supabase.from("collections").select("*").limit(1)

    const collectionsExists = !collectionsError || !collectionsError.message.includes("does not exist")

    // Check if wardrobe_items has collection_id column
    const { data: wardrobeData, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("collection_id")
      .limit(1)

    const collectionIdExists =
      !wardrobeError || !wardrobeError.message.includes('column "collection_id" does not exist')

    // Check if item_collections junction table exists
    const { data: junctionData, error: junctionError } = await supabase.from("item_collections").select("*").limit(1)

    const junctionExists = !junctionError || !junctionError.message.includes("does not exist")

    return {
      collectionsExists,
      collectionIdExists,
      junctionExists,
      fullyImplemented: collectionsExists && (collectionIdExists || junctionExists),
    }
  } catch (error: any) {
    return {
      collectionsExists: false,
      collectionIdExists: false,
      junctionExists: false,
      fullyImplemented: false,
      error: error.message,
    }
  }
}

async function addCollectionsFeature() {
  const collectionsSQL = `
    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create Collections table
    CREATE TABLE IF NOT EXISTS public.collections (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color_theme TEXT DEFAULT '#3B82F6',
        is_seasonal BOOLEAN DEFAULT FALSE,
        season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
        is_occasion_based BOOLEAN DEFAULT FALSE,
        occasion TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Ensure unique collection names per user
        UNIQUE(user_id, name)
    );

    -- Create junction table for many-to-many relationship
    CREATE TABLE IF NOT EXISTS public.item_collections (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
        collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Ensure unique item-collection pairs
        UNIQUE(item_id, collection_id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_seasonal ON public.collections(is_seasonal, season);
    CREATE INDEX IF NOT EXISTS idx_item_collections_item_id ON public.item_collections(item_id);
    CREATE INDEX IF NOT EXISTS idx_item_collections_collection_id ON public.item_collections(collection_id);

    -- Enable Row Level Security
    ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.item_collections ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for collections
    DROP POLICY IF EXISTS "Users can view own collections" ON public.collections;
    CREATE POLICY "Users can view own collections" ON public.collections 
        FOR SELECT USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own collections" ON public.collections;
    CREATE POLICY "Users can insert own collections" ON public.collections 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
    CREATE POLICY "Users can update own collections" ON public.collections 
        FOR UPDATE USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;
    CREATE POLICY "Users can delete own collections" ON public.collections 
        FOR DELETE USING (auth.uid() = user_id);

    -- RLS Policies for item_collections junction table
    DROP POLICY IF EXISTS "Users can view own item collections" ON public.item_collections;
    CREATE POLICY "Users can view own item collections" ON public.item_collections 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.wardrobe_items wi 
                WHERE wi.id = item_id AND (
                    (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
                    (wi.owner_type = 'family_member' AND EXISTS (
                        SELECT 1 FROM public.family_members fm 
                        WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
                    ))
                )
            )
        );

    DROP POLICY IF EXISTS "Users can manage own item collections" ON public.item_collections;
    CREATE POLICY "Users can manage own item collections" ON public.item_collections 
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.wardrobe_items wi 
                WHERE wi.id = item_id AND (
                    (wi.owner_type = 'user' AND auth.uid() = wi.owner_id) OR
                    (wi.owner_type = 'family_member' AND EXISTS (
                        SELECT 1 FROM public.family_members fm 
                        WHERE fm.id = wi.owner_id AND fm.user_id = auth.uid()
                    ))
                )
            )
        );
  `

  try {
    const { error } = await supabase.rpc("exec_sql", { sql_query: collectionsSQL })

    if (error) {
      return { success: false, error: error.message }
    }

    // Add sample collections if there are users
    const sampleCollectionsSQL = `
      INSERT INTO public.collections (user_id, name, description, color_theme, is_seasonal, season) 
      SELECT 
          id as user_id,
          'Summer Essentials' as name,
          'Light and breathable clothes for hot weather' as description,
          '#FFA500' as color_theme,
          true as is_seasonal,
          'summer' as season
      FROM auth.users 
      LIMIT 1
      ON CONFLICT (user_id, name) DO NOTHING;

      INSERT INTO public.collections (user_id, name, description, color_theme, is_occasion_based, occasion) 
      SELECT 
          id as user_id,
          'Work Wardrobe' as name,
          'Professional attire for the office' as description,
          '#1F2937' as color_theme,
          true as is_occasion_based,
          'work' as occasion
      FROM auth.users 
      LIMIT 1
      ON CONFLICT (user_id, name) DO NOTHING;

      INSERT INTO public.collections (user_id, name, description, color_theme) 
      SELECT 
          id as user_id,
          'Favorites' as name,
          'My most loved clothing items' as description,
          '#EF4444' as color_theme
      FROM auth.users 
      LIMIT 1
      ON CONFLICT (user_id, name) DO NOTHING;
    `

    await supabase.rpc("exec_sql", { sql_query: sampleCollectionsSQL })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function listCollections() {
  try {
    const { data, error } = await supabase.from("collections").select("*").limit(10)

    if (error) {
      return { collections: [], error: error.message }
    }

    return { collections: data || [] }
  } catch (error: any) {
    return { collections: [], error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "check":
        return NextResponse.json(await checkCollectionsFeature())

      case "add":
        return NextResponse.json(await addCollectionsFeature())

      case "list":
        return NextResponse.json(await listCollections())

      default:
        return NextResponse.json({ success: false, error: "Invalid action" })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
