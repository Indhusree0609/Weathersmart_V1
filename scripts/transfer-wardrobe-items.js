const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function transferWardrobeItems() {
  console.log("🔄 TRANSFERRING WARDROBE ITEMS")
  console.log("==============================")
  
  try {
    // Get all authenticated users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error("❌ Error fetching auth users:", authError)
      return
    }
    
    console.log("👥 All authenticated users:")
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - User ID: ${user.id}`)
    })
    
    // Find Indhu's user ID
    const indhuUser = authUsers.users.find(user => 
      user.email && user.email.toLowerCase().includes('indhu')
    )
    
    if (!indhuUser) {
      console.log("❌ Could not find Indhu's user account")
      return
    }
    
    console.log(`\n✅ Found Indhu's user ID: ${indhuUser.id}`)
    
    // Find VDK's user ID (the hardcoded one from the original script)
    const vdkUserId = "394e5367-0d87-4ef7-b4ca-9db726b5f6f9"
    
    // Get all wardrobe items for VDK
    const { data: vdkItems, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", vdkUserId)
    
    if (itemsError) {
      console.error("❌ Error fetching VDK's items:", itemsError)
      return
    }
    
    console.log(`\n📦 Found ${vdkItems.length} items in VDK's wardrobe`)
    
    if (vdkItems.length === 0) {
      console.log("⚠️  No items to transfer")
      return
    }
    
    // Check if Indhu has a wardrobe profile
    const { data: indhuProfile, error: profileError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
      .eq("user_id", indhuUser.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("❌ Error checking Indhu's profile:", profileError)
      return
    }
    
    if (!indhuProfile) {
      console.log("🔧 Creating wardrobe profile for Indhu...")
      
      const { error: createProfileError } = await supabase
        .from("wardrobe_profiles")
        .insert({
          user_id: indhuUser.id,
          name: "Indhu's Wardrobe",
          age: 25,
          date_of_birth: "1999-01-01"
        })
      
      if (createProfileError) {
        console.error("❌ Error creating profile:", createProfileError)
        return
      } else {
        console.log("✅ Created wardrobe profile for Indhu")
      }
    }
    
    // Transfer each item from VDK to Indhu
    console.log("\n🔄 Transferring items...")
    
    for (const item of vdkItems) {
      // Create a copy of the item for Indhu (without the id)
      const { id, created_at, updated_at, ...itemData } = item
      const newItem = {
        ...itemData,
        user_id: indhuUser.id
      }
      
      const { error: insertError } = await supabase
        .from("wardrobe_items")
        .insert(newItem)
      
      if (insertError) {
        console.error(`❌ Error transferring ${item.name}:`, insertError)
      } else {
        console.log(`✅ Transferred ${item.name} to Indhu's wardrobe`)
      }
    }
    
    // Delete VDK's items
    console.log("\n🗑️  Cleaning up VDK's items...")
    const { error: deleteError } = await supabase
      .from("wardrobe_items")
      .delete()
      .eq("user_id", vdkUserId)
    
    if (deleteError) {
      console.error("❌ Error deleting VDK's items:", deleteError)
    } else {
      console.log("✅ Cleaned up VDK's items")
    }
    
    console.log("\n🎉 Transfer complete! Indhu should now see her wardrobe items.")
    console.log("Please refresh the wardrobes page to see the changes.")
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

transferWardrobeItems()
