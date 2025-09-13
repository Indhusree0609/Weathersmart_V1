const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixUserWardrobe() {
  console.log("🔍 CHECKING ALL USERS AND WARDROBES")
  console.log("===================================")
  
  try {
    // Get all wardrobe profiles
    const { data: profiles, error: profileError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
    
    if (profileError) {
      console.error("❌ Error fetching profiles:", profileError)
      return
    }
    
    console.log("📋 All wardrobe profiles:")
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.name} - User ID: ${profile.user_id}`)
    })
    
    // Find Indhu's profile (should be the one with email containing 'indhu' or similar)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error("❌ Error fetching auth users:", authError)
    } else {
      console.log("\n👥 All authenticated users:")
      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - User ID: ${user.id}`)
      })
      
      // Find Indhu's user ID
      const indhuUser = authUsers.users.find(user => 
        user.email && user.email.toLowerCase().includes('indhu')
      )
      
      if (indhuUser) {
        console.log(`\n✅ Found Indhu's user ID: ${indhuUser.id}`)
        
        // Check if Indhu has a wardrobe profile
        const indhuProfile = profiles.find(p => p.user_id === indhuUser.id)
        
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
          } else {
            console.log("✅ Created wardrobe profile for Indhu")
          }
        }
        
        // Add sample items for Indhu
        console.log("🔧 Adding sample items for Indhu...")
        
        const sampleItems = [
          { name: "Blue Jeans", category: "Bottoms", color: "Blue", season: "All", occasion: "Casual" },
          { name: "White T-Shirt", category: "Tops", color: "White", season: "All", occasion: "Casual" },
          { name: "Black Dress", category: "Dresses", color: "Black", season: "All", occasion: "Formal" },
          { name: "Sneakers", category: "Shoes", color: "White", season: "All", occasion: "Casual" },
          { name: "Jacket", category: "Outerwear", color: "Black", season: "Winter", occasion: "Casual" }
        ]
        
        for (const item of sampleItems) {
          const { error: insertError } = await supabase
            .from("wardrobe_items")
            .insert({
              ...item,
              user_id: indhuUser.id,
              image_url: "/placeholder.jpg"
            })
          
          if (insertError) {
            console.error(`❌ Error adding ${item.name}:`, insertError)
          } else {
            console.log(`✅ Added ${item.name} to Indhu's wardrobe`)
          }
        }
        
        console.log("\n🎉 Fixed! Indhu should now have her own wardrobe with items.")
        
      } else {
        console.log("\n⚠️  Could not find Indhu's user account")
        console.log("Please check the email address or create the account first")
      }
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

fixUserWardrobe()
