import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_K || "your_service_role_key_here"

if (!supabaseServiceKey || !supabaseUrl) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("SUPABASE_SERVICE_ROLE_K:", !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupOutfitStorage() {
  console.log("🚀 SETTING UP AI OUTFIT STORAGE INTEGRATION")
  console.log("=".repeat(60))

  try {
    // Read the SQL schema file
    const schemaPath = join(process.cwd(), "scripts", "create-outfit-storage-schema.sql")
    const schema = readFileSync(schemaPath, "utf8")

    console.log("📄 Executing outfit storage schema...")

    // Execute the schema
    const { data, error } = await supabase.rpc("exec_sql", { sql: schema })

    if (error) {
      console.error("❌ Error executing schema:", error)
      return
    }

    console.log("✅ Schema executed successfully!")

    // Verify tables were created
    console.log("\n🔍 Verifying table creation...")

    const tables = ["outfit_recommendations", "outfits", "outfit_items", "outfit_categories"]

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Created successfully (${count || 0} rows)`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    console.log("\n🎉 AI OUTFIT STORAGE SETUP COMPLETE!")
    console.log("=".repeat(60))

    console.log("\n📋 What was created:")
    console.log("• outfit_recommendations - Stores AI-generated suggestions")
    console.log("• outfits - Saved complete outfit combinations")
    console.log("• outfit_items - Links outfits to wardrobe items")
    console.log("• outfit_categories - Categorizes outfits by occasion")
    console.log("\n🔧 Next steps:")
    console.log("1. Test the chat interface at /chat")
    console.log("2. Run the diagnostic at /check-outfit-storage")
    console.log("3. Add some wardrobe items for personalized recommendations")
  } catch (error) {
    console.error("\n❌ SETUP FAILED:", error)
    console.error("Error details:", error.message)
    console.error("Stack trace:", error.stack)

    console.log("\n🔧 Manual Setup Instructions:")
    console.log("If the automated setup failed, you can:")
    console.log("1. Run the SQL script manually in Supabase SQL Editor")
    console.log("2. Copy the contents of scripts/create-outfit-storage-schema.sql")
    console.log("3. Paste and execute in your Supabase dashboard")
    console.log("4. Then test the integration at /check-outfit-storage")
  }
}

// Run the setup
setupOutfitStorage().catch(console.error)
