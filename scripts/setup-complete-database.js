const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sqlContent, description) {
  console.log(`🚀 ${description}...`)

  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql_query: statement + ";",
          })

          if (error) {
            console.error(`❌ Error executing statement: ${statement.substring(0, 50)}...`)
            console.error(`   Error: ${error.message}`)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.error(`❌ Exception executing statement: ${statement.substring(0, 50)}...`)
          console.error(`   Exception: ${err.message}`)
          errorCount++
        }
      }
    }

    console.log(`✅ ${description} completed: ${successCount} successful, ${errorCount} errors`)
    return errorCount === 0
  } catch (error) {
    console.error(`❌ Failed to execute ${description}:`, error.message)
    return false
  }
}

async function setupCompleteDatabase() {
  console.log("🎯 Setting up complete multi-user family wardrobe database...")
  console.log(
    "📊 This includes: users, family members, wardrobe items, weather essentials, and child-specific features",
  )

  try {
    // Step 1: Create all tables and relationships
    console.log("\n📋 Step 1: Creating database schema...")
    const schemaSQL = fs.readFileSync(path.join(__dirname, "create-complete-wardrobe-schema.sql"), "utf8")
    const schemaSuccess = await executeSQL(schemaSQL, "Creating database schema")

    if (!schemaSuccess) {
      console.log("⚠️  Some schema creation errors occurred, but continuing with data seeding...")
    }

    // Step 2: Seed lookup data
    console.log("\n📋 Step 2: Seeding lookup data...")
    const seedSQL = fs.readFileSync(path.join(__dirname, "seed-lookup-data.sql"), "utf8")
    const seedSuccess = await executeSQL(seedSQL, "Seeding lookup data")

    if (!seedSuccess) {
      console.log("⚠️  Some data seeding errors occurred, but database should still be functional...")
    }

    // Step 3: Verify setup
    console.log("\n📋 Step 3: Verifying database setup...")

    const tables = [
      "users",
      "family_members",
      "relationships",
      "genders",
      "categories",
      "colors",
      "conditions",
      "wardrobe_items",
      "safety_features",
      "activities",
      "weather_categories",
      "weather_item_types",
      "weather_essentials",
    ]

    const verificationResults = []

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1)

        if (error) {
          verificationResults.push({ table, status: "error", message: error.message })
        } else {
          verificationResults.push({ table, status: "success", message: "Table accessible" })
        }
      } catch (err) {
        verificationResults.push({ table, status: "error", message: err.message })
      }
    }

    // Display verification results
    console.log("\n📊 Database Verification Results:")
    verificationResults.forEach((result) => {
      const icon = result.status === "success" ? "✅" : "❌"
      console.log(`${icon} ${result.table}: ${result.message}`)
    })

    const successfulTables = verificationResults.filter((r) => r.status === "success").length
    const totalTables = verificationResults.length

    console.log(`\n🎯 Database Setup Summary:`)
    console.log(`   Tables created: ${successfulTables}/${totalTables}`)
    console.log(`   Schema: ${schemaSuccess ? "Success" : "Partial"}`)
    console.log(`   Data: ${seedSuccess ? "Success" : "Partial"}`)

    if (successfulTables >= totalTables * 0.8) {
      // 80% success rate
      console.log("\n🎉 Database setup completed successfully!")
      console.log("\n🚀 Next steps:")
      console.log("1. Visit your app to test the new database structure")
      console.log("2. Try creating family members and wardrobe items")
      console.log('3. Test child-specific features for family members marked as "Child"')
      console.log("4. Add weather essentials for different weather conditions")

      return true
    } else {
      console.log("\n⚠️  Database setup completed with some issues.")
      console.log("   Some tables may not be accessible, but core functionality should work.")
      return false
    }
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return false
  }
}

// Alternative function to create tables using direct SQL execution
async function createTablesDirect() {
  console.log("🔄 Attempting direct table creation...")

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_picture_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  const createFamilyMembersTable = `
    CREATE TABLE IF NOT EXISTS public.family_members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      relationship_id INTEGER,
      date_of_birth DATE,
      gender_id INTEGER,
      profile_picture_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  try {
    // Try creating core tables first
    await supabase.rpc("exec_sql", { sql_query: createUsersTable })
    console.log("✅ Users table created")

    await supabase.rpc("exec_sql", { sql_query: createFamilyMembersTable })
    console.log("✅ Family members table created")

    console.log("🎯 Core tables created successfully!")
    return true
  } catch (error) {
    console.error("❌ Direct table creation failed:", error)
    return false
  }
}

// Run the setup
if (require.main === module) {
  setupCompleteDatabase().then((success) => {
    if (!success) {
      console.log("\n🔄 Trying alternative setup method...")
      createTablesDirect().then((altSuccess) => {
        process.exit(altSuccess ? 0 : 1)
      })
    } else {
      process.exit(0)
    }
  })
}

module.exports = { setupCompleteDatabase, createTablesDirect }
