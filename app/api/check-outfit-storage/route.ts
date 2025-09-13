import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "check"

  try {
    if (action === "check") {
      return await checkOutfitStorage()
    } else if (action === "fix") {
      return await fixOutfitStorage()
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function checkOutfitStorage() {
  const results = []

  // Check wardrobe_items table
  try {
    const { data, error, count } = await supabase.from("wardrobe_items").select("*", { count: "exact", head: true })

    results.push({
      component: "Wardrobe Items Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Core table storing user clothing items",
      status: error ? "error" : count && count > 0 ? "success" : "warning",
    })
  } catch (error) {
    results.push({
      component: "Wardrobe Items Table",
      exists: false,
      error: error.message,
      details: "Core table storing user clothing items",
      status: "error",
    })
  }

  // Check outfit_recommendations table
  try {
    const { data, error, count } = await supabase
      .from("outfit_recommendations")
      .select("*", { count: "exact", head: true })

    results.push({
      component: "AI Recommendations Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Stores AI-generated outfit suggestions",
      status: error ? "error" : "success",
    })
  } catch (error) {
    results.push({
      component: "AI Recommendations Table",
      exists: false,
      error: error.message,
      details: "Stores AI-generated outfit suggestions",
      status: "error",
    })
  }

  // Check outfits table
  try {
    const { data, error, count } = await supabase.from("outfits").select("*", { count: "exact", head: true })

    results.push({
      component: "Outfits Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Saved complete outfit combinations",
      status: error ? "error" : "success",
    })
  } catch (error) {
    results.push({
      component: "Outfits Table",
      exists: false,
      error: error.message,
      details: "Saved complete outfit combinations",
      status: "error",
    })
  }

  // Check outfit_items table
  try {
    const { data, error, count } = await supabase.from("outfit_items").select("*", { count: "exact", head: true })

    results.push({
      component: "Outfit Items Junction Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Links outfits to individual wardrobe items",
      status: error ? "error" : "success",
    })
  } catch (error) {
    results.push({
      component: "Outfit Items Junction Table",
      exists: false,
      error: error.message,
      details: "Links outfits to individual wardrobe items",
      status: "error",
    })
  }

  // Check categories table
  try {
    const { data, error, count } = await supabase.from("categories").select("*", { count: "exact", head: true })

    results.push({
      component: "Categories Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Clothing categories (tops, bottoms, etc.)",
      status: error ? "error" : count && count > 0 ? "success" : "warning",
    })
  } catch (error) {
    results.push({
      component: "Categories Table",
      exists: false,
      error: error.message,
      details: "Clothing categories (tops, bottoms, etc.)",
      status: "error",
    })
  }

  // Check weather_essentials table
  try {
    const { data, error, count } = await supabase.from("weather_essentials").select("*", { count: "exact", head: true })

    results.push({
      component: "Weather Essentials Table",
      exists: !error,
      count: count || 0,
      error: error?.message,
      details: "Weather-specific clothing items",
      status: error ? "warning" : "success", // This is optional, so warning instead of error
    })
  } catch (error) {
    results.push({
      component: "Weather Essentials Table",
      exists: false,
      error: error.message,
      details: "Weather-specific clothing items (optional)",
      status: "warning",
    })
  }

  // Calculate summary
  const summary = {
    total: results.length,
    working: results.filter((r) => r.status === "success").length,
    missing: results.filter((r) => !r.exists).length,
    errors: results.filter((r) => r.status === "error").length,
  }

  return NextResponse.json({
    success: true,
    results,
    summary,
  })
}

async function fixOutfitStorage() {
  const fixes = []

  try {
    // Create outfit_recommendations table if it doesn't exist
    const createOutfitRecommendationsSQL = `
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

      ALTER TABLE outfit_recommendations ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can manage their own outfit recommendations" ON outfit_recommendations;
      CREATE POLICY "Users can manage their own outfit recommendations" ON outfit_recommendations
        FOR ALL USING (auth.uid() = user_id);
    `

    const { error: recError } = await supabase.rpc("exec_sql", { sql: createOutfitRecommendationsSQL })
    fixes.push({
      component: "Outfit Recommendations Table",
      success: !recError,
      error: recError?.message,
    })

    // Create outfits table
    const createOutfitsSQL = `
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

      ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can manage their own outfits" ON outfits;
      CREATE POLICY "Users can manage their own outfits" ON outfits
        FOR ALL USING (auth.uid() = user_id);
    `

    const { error: outfitsError } = await supabase.rpc("exec_sql", { sql: createOutfitsSQL })
    fixes.push({
      component: "Outfits Table",
      success: !outfitsError,
      error: outfitsError?.message,
    })

    // Create outfit_items table
    const createOutfitItemsSQL = `
      CREATE TABLE IF NOT EXISTS outfit_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
        wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(outfit_id, wardrobe_item_id)
      );

      ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can manage outfit items for their outfits" ON outfit_items;
      CREATE POLICY "Users can manage outfit items for their outfits" ON outfit_items
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM outfits 
            WHERE outfits.id = outfit_items.outfit_id 
            AND outfits.user_id = auth.uid()
          )
        );
    `

    const { error: itemsError } = await supabase.rpc("exec_sql", { sql: createOutfitItemsSQL })
    fixes.push({
      component: "Outfit Items Table",
      success: !itemsError,
      error: itemsError?.message,
    })

    // Create categories table if it doesn't exist
    const createCategoriesSQL = `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      INSERT INTO categories (name, display_order) VALUES
        ('tops', 1),
        ('bottoms', 2),
        ('dresses', 3),
        ('outerwear', 4),
        ('shoes', 5),
        ('accessories', 6),
        ('traditional', 7)
      ON CONFLICT (name) DO NOTHING;
    `

    const { error: catError } = await supabase.rpc("exec_sql", { sql: createCategoriesSQL })
    fixes.push({
      component: "Categories Table",
      success: !catError,
      error: catError?.message,
    })

    return NextResponse.json({
      success: true,
      fixes,
      message: "Outfit storage integration has been fixed!",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        fixes,
      },
      { status: 500 },
    )
  }
}
