const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createMissingProfiles() {
  console.log("👤 CREATING MISSING WARDROBE PROFILES")
  console.log("====================================\n")
  
  try {
    // Get all unique user IDs from wardrobe items
    const { data: wardrobeUsers, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("user_id")
    
    if (wardrobeError) {
      console.error("❌ Error fetching wardrobe users:", wardrobeError)
      return
    }
    
    const uniqueUserIds = [...new Set(wardrobeUsers.map(item => item.user_id))]
    console.log(`📦 Found ${uniqueUserIds.length} unique users with wardrobe items`)
    
    // Get existing wardrobe profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from("wardrobe_profiles")
      .select("user_id")
    
    if (profilesError) {
      console.error("❌ Error fetching existing profiles:", profilesError)
      return
    }
    
    const existingUserIds = new Set(existingProfiles.map(p => p.user_id))
    console.log(`👥 Found ${existingProfiles.length} existing wardrobe profiles`)
    
    // Find users who need profiles
    const usersNeedingProfiles = uniqueUserIds.filter(userId => !existingUserIds.has(userId))
    console.log(`🔍 Found ${usersNeedingProfiles.length} users needing profiles`)
    
    let createdCount = 0
    
    // Create default profiles for users without them
    for (const userId of usersNeedingProfiles) {
      try {
        // Get user info from profiles table if available
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userId)
          .single()
        
        const profileName = userProfile?.full_name || userProfile?.email?.split('@')[0] || "My Wardrobe"
        
        const { error: createError } = await supabase
          .from("wardrobe_profiles")
          .insert([{
            user_id: userId,
            name: profileName,
            is_owner: true,
            age: 25 // Default age for adults
          }])
        
        if (createError) {
          console.error(`❌ Failed to create profile for user ${userId}:`, createError)
        } else {
          console.log(`✅ Created profile "${profileName}" for user ${userId}`)
          createdCount++
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error)
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdCount} new wardrobe profiles!`)
    
    if (createdCount > 0) {
      console.log("\n🔗 Now running the linking script to connect items to profiles...")
      // Re-run the linking logic
      await linkItemsToProfiles()
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

async function linkItemsToProfiles() {
  try {
    // Get all items without profile assignments
    const { data: unlinkedItems, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("id, user_id, name, wardrobe_profile_id")
      .is("wardrobe_profile_id", null)
    
    if (itemsError) {
      console.error("❌ Error fetching items:", itemsError)
      return
    }
    
    console.log(`📦 Found ${unlinkedItems.length} items without profile assignments`)
    
    // Get all profiles grouped by user
    const { data: profiles, error: profilesError } = await supabase
      .from("wardrobe_profiles")
      .select("id, user_id, name, age")
    
    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      return
    }
    
    // Group profiles by user_id
    const profilesByUser = {}
    profiles.forEach(profile => {
      if (!profilesByUser[profile.user_id]) {
        profilesByUser[profile.user_id] = []
      }
      profilesByUser[profile.user_id].push(profile)
    })
    
    let updatedCount = 0
    
    // Link items to the first profile of each user (or adult profile if available)
    for (const item of unlinkedItems) {
      const userProfiles = profilesByUser[item.user_id]
      
      if (userProfiles && userProfiles.length > 0) {
        // Prefer adult profiles (age >= 18), otherwise use first profile
        const targetProfile = userProfiles.find(p => p.age >= 18) || userProfiles[0]
        
        const { error: updateError } = await supabase
          .from("wardrobe_items")
          .update({ wardrobe_profile_id: targetProfile.id })
          .eq("id", item.id)
        
        if (updateError) {
          console.error(`❌ Failed to update item ${item.name}:`, updateError)
        } else {
          console.log(`✅ Linked "${item.name}" to profile "${targetProfile.name}"`)
          updatedCount++
        }
      } else {
        console.log(`⚠️  No profile found for user ${item.user_id} (item: ${item.name})`)
      }
    }
    
    console.log(`\n🎉 Successfully linked ${updatedCount} items to profiles!`)
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

createMissingProfiles()
