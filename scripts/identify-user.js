const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function identifyUser() {
  const userId = "af0a0786-1807-4513-9354-65fbf65b6c08"
  
  console.log("🔍 IDENTIFYING USER ACCOUNT")
  console.log("==========================")
  console.log(`User ID: ${userId}`)
  console.log("")
  
  try {
    // Check auth.users table for user information
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError) {
      console.error("❌ Error fetching auth user:", authError)
    } else if (authUser.user) {
      console.log("✅ Found user in auth.users:")
      console.log(`   Email: ${authUser.user.email}`)
      console.log(`   Created: ${authUser.user.created_at}`)
      console.log(`   Last Sign In: ${authUser.user.last_sign_in_at}`)
      console.log(`   Phone: ${authUser.user.phone || 'Not set'}`)
    } else {
      console.log("❌ No user found in auth.users table")
    }
    
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    
    if (profileError && profileError.code !== "PGRST116") {
      console.error("❌ Error fetching profile:", profileError)
    } else if (profile) {
      console.log("\n✅ Found user profile:")
      console.log(`   Name: ${profile.name || 'Not set'}`)
      console.log(`   Email: ${profile.email || 'Not set'}`)
      console.log(`   Created: ${profile.created_at}`)
    } else {
      console.log("\n❌ No profile found in profiles table")
    }
    
    // Check wardrobe_profiles table
    const { data: wardrobeProfiles, error: wardrobeError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
      .eq("user_id", userId)
    
    if (wardrobeError) {
      console.error("❌ Error fetching wardrobe profiles:", wardrobeError)
    } else {
      console.log(`\n📁 Found ${wardrobeProfiles.length} wardrobe profile(s):`)
      wardrobeProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.name} (Age: ${profile.age || 'Not set'})`)
      })
    }
    
    // Check wardrobe items
    const { data: wardrobeItems, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
    
    if (itemsError) {
      console.error("❌ Error fetching wardrobe items:", itemsError)
    } else {
      console.log(`\n👕 Found ${wardrobeItems.length} wardrobe item(s)`)
      if (wardrobeItems.length > 0) {
        console.log("   Sample items:")
        wardrobeItems.slice(0, 5).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} (${item.category}) - ${item.color}`)
        })
        if (wardrobeItems.length > 5) {
          console.log(`   ... and ${wardrobeItems.length - 5} more items`)
        }
      }
    }
    
    // Summary
    console.log("\n📊 SUMMARY")
    console.log("==========")
    if (authUser.user) {
      console.log(`✅ This user ID belongs to: ${authUser.user.email}`)
    } else {
      console.log("❌ User ID not found in authentication system")
    }
    
    if (wardrobeProfiles.length === 0) {
      console.log("⚠️  No wardrobe profiles found - this explains 'Profiles Loaded: 0'")
    }
    
    if (wardrobeItems.length === 0) {
      console.log("⚠️  No wardrobe items found - chatbot won't have wardrobe data")
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

identifyUser()
