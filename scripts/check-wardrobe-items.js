const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkWardrobeItems() {
  console.log("🔍 CHECKING WARDROBE ITEMS IN DATABASE")
  console.log("=====================================\n")
  
  try {
    // 1. Check total count of wardrobe items
    console.log("1️⃣ Checking total wardrobe items...")
    const { count: totalCount, error: countError } = await supabase
      .from("wardrobe_items")
      .select("*", { count: "exact", head: true })
    
    if (countError) {
      console.error("❌ Error counting items:", countError)
      return
    }
    
    console.log(`✅ Total wardrobe items in database: ${totalCount}`)
    
    if (totalCount === 0) {
      console.log("⚠️  No wardrobe items found in database!")
      console.log("🔧 This explains why the chatbot shows 0 items")
      return
    }
    
    // 2. Get sample items
    console.log("\n2️⃣ Fetching sample wardrobe items...")
    const { data: sampleItems, error: sampleError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .limit(5)
    
    if (sampleError) {
      console.error("❌ Error fetching sample items:", sampleError)
      return
    }
    
    console.log("📦 Sample items:")
    sampleItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} (${item.category}) - User: ${item.user_id}`)
    })
    
    // 3. Check items by user
    console.log("\n3️⃣ Checking items by user...")
    const { data: userCounts, error: userError } = await supabase
      .from("wardrobe_items")
      .select("user_id")
    
    if (userError) {
      console.error("❌ Error fetching user data:", userError)
      return
    }
    
    // Count items per user
    const userItemCounts = {}
    userCounts.forEach(item => {
      userItemCounts[item.user_id] = (userItemCounts[item.user_id] || 0) + 1
    })
    
    console.log("👥 Items per user:")
    Object.entries(userItemCounts).forEach(([userId, count]) => {
      console.log(`   User ${userId}: ${count} items`)
    })
    
    // 4. Check wardrobe profiles
    console.log("\n4️⃣ Checking wardrobe profiles...")
    const { data: profiles, error: profileError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
    
    if (profileError) {
      console.error("❌ Error fetching profiles:", profileError)
    } else {
      console.log(`✅ Found ${profiles.length} wardrobe profiles`)
      profiles.forEach(profile => {
        console.log(`   - ${profile.name} (Age: ${profile.age}, DOB: ${profile.date_of_birth})`)
      })
    }
    
    // 5. Check if items have wardrobe_profile_id
    console.log("\n5️⃣ Checking wardrobe_profile_id column...")
    const { data: profileItems, error: profileItemError } = await supabase
      .from("wardrobe_items")
      .select("id, name, wardrobe_profile_id")
      .limit(5)
    
    if (profileItemError) {
      if (profileItemError.code === "42703") {
        console.log("⚠️  wardrobe_profile_id column does not exist")
        console.log("🔧 This might cause issues with profile-specific filtering")
      } else {
        console.error("❌ Error checking wardrobe_profile_id:", profileItemError)
      }
    } else {
      console.log("✅ wardrobe_profile_id column exists")
      const itemsWithProfile = profileItems.filter(item => item.wardrobe_profile_id)
      console.log(`   ${itemsWithProfile.length}/${profileItems.length} sample items have profile assignments`)
    }
    
    console.log("\n📊 SUMMARY:")
    console.log(`- Total items in database: ${totalCount}`)
    console.log(`- Number of users with items: ${Object.keys(userItemCounts).length}`)
    console.log(`- Number of profiles: ${profiles?.length || 0}`)
    
    if (totalCount > 0) {
      console.log("\n✅ GOOD NEWS: You have wardrobe items in the database!")
      console.log("🔧 The issue is likely with:")
      console.log("   1. Frontend authentication (user session)")
      console.log("   2. API calls failing due to auth errors")
      console.log("   3. Profile filtering logic")
    } else {
      console.log("\n❌ ISSUE: No wardrobe items found in database")
      console.log("🔧 You need to add items first through the wardrobe page")
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

// Run the check
checkWardrobeItems()
