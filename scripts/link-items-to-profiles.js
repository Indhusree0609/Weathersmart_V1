const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function linkItemsToProfiles() {
  console.log("🔗 LINKING WARDROBE ITEMS TO PROFILES")
  console.log("===================================\n")
  
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
    
    console.log(`👥 Found ${profiles.length} profiles`)
    
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

linkItemsToProfiles()
