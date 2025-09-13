const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseConnection() {
  console.log("🔍 Checking WeatherSmart database connection...")
  console.log("📍 Supabase URL:", supabaseUrl)
  console.log("🔑 Using anon key (first 20 chars):", supabaseAnonKey.substring(0, 20) + "...")

  try {
    // Test 1: Basic connection
    console.log("\n1️⃣ Testing basic connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

    if (connectionError) {
      console.log("❌ Connection failed:", connectionError.message)
      console.log("   Error code:", connectionError.code)
      return false
    }

    console.log("✅ Basic connection successful!")

    // Test 2: Check authentication
    console.log("\n2️⃣ Testing authentication...")
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError) {
      console.log("❌ Auth check failed:", authError.message)
    } else {
      console.log("✅ Auth system accessible")
      console.log("   Current session:", session ? "Active" : "No active session")
    }

    // Test 3: List all tables
    console.log("\n3️⃣ Checking available tables...")

    const tablesToCheck = [
      "profiles",
      "wardrobe_items",
      "wardrobe_profiles",
      "categories",
      "tags",
      "wardrobe_item_tags",
      "outfit_recommendations",
      "weather_essentials",
    ]

    const tableStatus = {}

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1)

        if (error) {
          if (error.code === "PGRST116" || error.message.includes("does not exist")) {
            tableStatus[table] = "❌ Does not exist"
          } else if (error.code === "42501") {
            tableStatus[table] = "🔒 Exists but access denied (RLS)"
          } else {
            tableStatus[table] = `⚠️ Error: ${error.message}`
          }
        } else {
          tableStatus[table] = "✅ Exists and accessible"
        }
      } catch (err) {
        tableStatus[table] = `❌ Error: ${err.message}`
      }
    }

    console.log("\n📊 Table Status:")
    Object.entries(tableStatus).forEach(([table, status]) => {
      console.log(`   ${table}: ${status}`)
    })

    // Test 4: Check storage buckets
    console.log("\n4️⃣ Checking storage buckets...")

    const bucketsToCheck = ["wardrobe-images", "profile-pictures"]

    for (const bucket of bucketsToCheck) {
      try {
        const { data, error } = await supabase.storage.from(bucket).list("", { limit: 1 })

        if (error) {
          console.log(`   ${bucket}: ❌ ${error.message}`)
        } else {
          console.log(`   ${bucket}: ✅ Accessible`)
        }
      } catch (err) {
        console.log(`   ${bucket}: ❌ ${err.message}`)
      }
    }

    // Test 5: Sample data check
    console.log("\n5️⃣ Checking for sample data...")

    try {
      const { data: categories, error: catError } = await supabase.from("categories").select("*").limit(5)

      if (!catError && categories) {
        console.log(`   Categories: ✅ Found ${categories.length} categories`)
        if (categories.length > 0) {
          console.log(`   Sample: ${categories.map((c) => c.name).join(", ")}`)
        }
      } else {
        console.log("   Categories: ❌ No data or access denied")
      }
    } catch (err) {
      console.log("   Categories: ❌ Error checking data")
    }

    console.log("\n🎯 Summary:")
    console.log("✅ Database connection is working!")
    console.log("📝 Check the table status above to see what needs to be set up")

    return true
  } catch (error) {
    console.error("❌ Database check failed:", error)
    console.error("   Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n")[0],
    })
    return false
  }
}

// Test with a specific user if provided
async function checkUserData(userId) {
  if (!userId) return

  console.log(`\n👤 Checking data for user: ${userId}`)

  try {
    // Check wardrobe items
    const { data: items, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .limit(5)

    if (!itemsError && items) {
      console.log(`   Wardrobe items: ✅ Found ${items.length} items`)
    } else {
      console.log(`   Wardrobe items: ❌ ${itemsError?.message || "No access"}`)
    }

    // Check wardrobe profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
      .eq("user_id", userId)

    if (!profilesError && profiles) {
      console.log(`   Wardrobe profiles: ✅ Found ${profiles.length} profiles`)
    } else {
      console.log(`   Wardrobe profiles: ❌ ${profilesError?.message || "No access"}`)
    }
  } catch (error) {
    console.log(`   User data check failed: ${error.message}`)
  }
}

// Run the check
async function main() {
  const success = await checkDatabaseConnection()

  // If you want to check a specific user, uncomment and add user ID:
  // await checkUserData('your-user-id-here')

  console.log("\n" + "=".repeat(50))

  if (success) {
    console.log("🎉 Database is connected and ready!")
    console.log("\n💡 Next steps:")
    console.log("1. If any tables are missing, run the setup scripts")
    console.log("2. Check your app authentication")
    console.log("3. Test adding data through your app")
  } else {
    console.log("❌ Database connection issues detected")
    console.log("\n💡 Troubleshooting:")
    console.log("1. Check your Supabase project URL and keys")
    console.log("2. Verify your project is active in Supabase dashboard")
    console.log("3. Check network connectivity")
  }

  process.exit(success ? 0 : 1)
}

main()
