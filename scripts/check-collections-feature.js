const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCollectionsFeature() {
  console.log("🔍 Checking if Collections feature exists in wardrobe database...")

  try {
    // Check if collections table exists
    console.log("\n📋 Checking for collections table...")
    const { data: collectionsData, error: collectionsError } = await supabase.from("collections").select("*").limit(1)

    let collectionsExists = false
    if (collectionsError) {
      if (collectionsError.message.includes('relation "public.collections" does not exist')) {
        console.log("❌ Collections table does not exist")
      } else {
        console.log("❌ Error accessing collections table:", collectionsError.message)
      }
    } else {
      console.log("✅ Collections table exists")
      collectionsExists = true
    }

    // Check if wardrobe_items has collection_id column
    console.log("\n📋 Checking for collection_id in wardrobe_items...")
    const { data: wardrobeData, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("collection_id")
      .limit(1)

    let collectionIdExists = false
    if (wardrobeError) {
      if (wardrobeError.message.includes('column "collection_id" does not exist')) {
        console.log("❌ collection_id column does not exist in wardrobe_items")
      } else {
        console.log("❌ Error checking collection_id column:", wardrobeError.message)
      }
    } else {
      console.log("✅ collection_id column exists in wardrobe_items")
      collectionIdExists = true
    }

    // Check if item_collections junction table exists
    console.log("\n📋 Checking for item_collections junction table...")
    const { data: junctionData, error: junctionError } = await supabase.from("item_collections").select("*").limit(1)

    let junctionExists = false
    if (junctionError) {
      if (junctionError.message.includes('relation "public.item_collections" does not exist')) {
        console.log("❌ item_collections junction table does not exist")
      } else {
        console.log("❌ Error accessing item_collections table:", junctionError.message)
      }
    } else {
      console.log("✅ item_collections junction table exists")
      junctionExists = true
    }

    // Summary
    console.log("\n📊 Collections Feature Summary:")
    console.log(`   Collections table: ${collectionsExists ? "✅ Exists" : "❌ Missing"}`)
    console.log(`   Collection ID column: ${collectionIdExists ? "✅ Exists" : "❌ Missing"}`)
    console.log(`   Junction table: ${junctionExists ? "✅ Exists" : "❌ Missing"}`)

    const collectionsFullyImplemented = collectionsExists && (collectionIdExists || junctionExists)

    if (collectionsFullyImplemented) {
      console.log("\n🎉 Collections feature is implemented!")

      // Get some sample data
      if (collectionsExists) {
        const { data: sampleCollections } = await supabase.from("collections").select("*").limit(5)

        if (sampleCollections && sampleCollections.length > 0) {
          console.log("\n📋 Sample Collections:")
          sampleCollections.forEach((collection) => {
            console.log(`   • ${collection.name} (${collection.description || "No description"})`)
          })
        } else {
          console.log("\n📋 No collections found in database")
        }
      }
    } else {
      console.log("\n❌ Collections feature is NOT implemented")
      console.log("\n🔧 To add collections feature, you need:")

      if (!collectionsExists) {
        console.log("   1. Create collections table")
      }

      if (!collectionIdExists && !junctionExists) {
        console.log("   2. Add collection relationship (either collection_id column or junction table)")
      }

      console.log("   3. Set up proper foreign key constraints")
      console.log("   4. Add Row Level Security policies")
    }

    return {
      collectionsExists,
      collectionIdExists,
      junctionExists,
      fullyImplemented: collectionsFullyImplemented,
    }
  } catch (error) {
    console.error("❌ Error checking collections feature:", error)
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
  console.log("\n🚀 Adding Collections feature to wardrobe database...")

  const collectionsSQL = `
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

    -- Create junction table for many-to-many relationship between items and collections
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

    -- Create updated_at trigger for collections
    CREATE TRIGGER update_collections_updated_at 
        BEFORE UPDATE ON public.collections 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security
    ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.item_collections ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for collections
    CREATE POLICY "Users can view own collections" ON public.collections 
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own collections" ON public.collections 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own collections" ON public.collections 
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own collections" ON public.collections 
        FOR DELETE USING (auth.uid() = user_id);

    -- RLS Policies for item_collections junction table
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
    // Execute the SQL to create collections feature
    const { error } = await supabase.rpc("exec_sql", { sql_query: collectionsSQL })

    if (error) {
      console.error("❌ Error creating collections feature:", error.message)
      return false
    }

    console.log("✅ Collections feature added successfully!")

    // Add some sample collections
    console.log("\n📋 Adding sample collections...")

    const sampleCollectionsSQL = `
      -- Insert sample collections (these will only work if there are users)
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

    const { error: sampleError } = await supabase.rpc("exec_sql", { sql_query: sampleCollectionsSQL })

    if (sampleError) {
      console.log("⚠️  Could not add sample collections (no users found):", sampleError.message)
    } else {
      console.log("✅ Sample collections added")
    }

    return true
  } catch (error) {
    console.error("❌ Error adding collections feature:", error)
    return false
  }
}

// Run the check
if (require.main === module) {
  checkCollectionsFeature().then(async (result) => {
    if (!result.fullyImplemented) {
      console.log("\n🔧 Would you like to add the Collections feature? (This will create the necessary tables)")

      // Auto-add collections feature
      const success = await addCollectionsFeature()

      if (success) {
        console.log("\n🎉 Collections feature has been added to your database!")
        console.log("\n🚀 You can now:")
        console.log("   • Create collections to organize wardrobe items")
        console.log("   • Group items by season, occasion, or personal preference")
        console.log("   • Add items to multiple collections")
        console.log("   • Use color themes for visual organization")

        // Re-check to confirm
        console.log("\n🔍 Re-checking collections feature...")
        await checkCollectionsFeature()
      }
    }

    process.exit(0)
  })
}

module.exports = { checkCollectionsFeature, addCollectionsFeature }
