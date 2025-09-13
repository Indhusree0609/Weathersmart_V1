import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_K

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("SUPABASE_SERVICE_ROLE_K:", !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAIIntegration() {
  console.log("🔧 Fixing AI Integration Issues...\n")

  const fixes = []

  try {
    // Fix 1: Create outfit_recommendations table
    console.log("1️⃣ Creating outfit_recommendations table...")
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

      CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_user_id ON outfit_recommendations(user_id);
      CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_created_at ON outfit_recommendations(created_at);
    `

    const { error: recError } = await supabase.rpc("exec_sql", { sql: createOutfitRecommendationsSQL })
    if (recError) {
      console.log("❌ outfit_recommendations:", recError.message)
      fixes.push({ table: "outfit_recommendations", success: false, error: recError.message })
    } else {
      console.log("✅ outfit_recommendations: Created successfully")
      fixes.push({ table: "outfit_recommendations", success: true })
    }

    // Fix 2: Create outfits table
    console.log("2️⃣ Creating outfits table...")
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

      CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
      CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
    `

    const { error: outfitsError } = await supabase.rpc("exec_sql", { sql: createOutfitsSQL })
    if (outfitsError) {
      console.log("❌ outfits:", outfitsError.message)
      fixes.push({ table: "outfits", success: false, error: outfitsError.message })
    } else {
      console.log("✅ outfits: Created successfully")
      fixes.push({ table: "outfits", success: true })
    }

    // Fix 3: Create outfit_items junction table
    console.log("3️⃣ Creating outfit_items junction table...")
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

      CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
      CREATE INDEX IF NOT EXISTS idx_outfit_items_wardrobe_item_id ON outfit_items(wardrobe_item_id);
    `

    const { error: itemsError } = await supabase.rpc("exec_sql", { sql: createOutfitItemsSQL })
    if (itemsError) {
      console.log("❌ outfit_items:", itemsError.message)
      fixes.push({ table: "outfit_items", success: false, error: itemsError.message })
    } else {
      console.log("✅ outfit_items: Created successfully")
      fixes.push({ table: "outfit_items", success: true })
    }

    // Fix 4: Ensure categories table exists with proper data
    console.log("4️⃣ Creating/updating categories table...")
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
    if (catError) {
      console.log("❌ categories:", catError.message)
      fixes.push({ table: "categories", success: false, error: catError.message })
    } else {
      console.log("✅ categories: Created/updated successfully")
      fixes.push({ table: "categories", success: true })
    }

    // Fix 5: Create outfit_categories for occasion-based categorization
    console.log("5️⃣ Creating outfit_categories table...")
    const createOutfitCategoriesSQL = `
      CREATE TABLE IF NOT EXISTS outfit_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT DEFAULT '#6B7280',
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE outfit_categories ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Outfit categories are readable by all authenticated users" ON outfit_categories;
      CREATE POLICY "Outfit categories are readable by all authenticated users" ON outfit_categories
        FOR SELECT USING (auth.role() = 'authenticated');

      INSERT INTO outfit_categories (name, description, icon, color, display_order) VALUES
        ('Casual', 'Everyday comfortable outfits', '👕', '#10B981', 1),
        ('Work', 'Professional business attire', '💼', '#3B82F6', 2),
        ('Formal', 'Elegant formal wear', '🤵', '#8B5CF6', 3),
        ('Date Night', 'Special occasion outfits', '💕', '#EC4899', 4),
        ('Exercise', 'Athletic and workout wear', '🏃', '#F59E0B', 5),
        ('Travel', 'Comfortable travel outfits', '✈️', '#06B6D4', 6),
        ('Weekend', 'Relaxed weekend looks', '🌞', '#84CC16', 7)
      ON CONFLICT (name) DO NOTHING;
    `

    const { error: outfitCatError } = await supabase.rpc("exec_sql", { sql: createOutfitCategoriesSQL })
    if (outfitCatError) {
      console.log("❌ outfit_categories:", outfitCatError.message)
      fixes.push({ table: "outfit_categories", success: false, error: outfitCatError.message })
    } else {
      console.log("✅ outfit_categories: Created successfully")
      fixes.push({ table: "outfit_categories", success: true })
    }

    // Summary
    console.log("\n📊 FIX SUMMARY:")
    const successful = fixes.filter((f) => f.success).length
    const failed = fixes.filter((f) => !f.success).length

    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📊 Total: ${fixes.length}`)

    if (failed === 0) {
      console.log("\n🎉 All AI integration issues have been fixed!")
      console.log("\n🔧 Next steps:")
      console.log("1. Test the chat interface at /chat")
      console.log("2. Run the diagnostic at /check-outfit-storage")
      console.log("3. Add some wardrobe items for personalized recommendations")
    } else {
      console.log("\n⚠️ Some issues remain. Check the errors above.")
    }
  } catch (error) {
    console.error("❌ Fix process failed:", error)
    process.exit(1)
  }
}

// Run the fix
fixAIIntegration().catch(console.error)
