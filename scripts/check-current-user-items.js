const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkCurrentUserItems() {
  const currentUserId = "394e5367-0d87-4ef7-b4ca-9db726b5f6f9"
  
  console.log("🔍 CHECKING ITEMS FOR CURRENT USER")
  console.log("==================================")
  console.log(`User ID: ${currentUserId}`)
  console.log("")
  
  try {
    // Check items for current user
    const { data: userItems, error: itemError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", currentUserId)
    
    if (itemError) {
      console.error("❌ Error fetching user items:", itemError)
      return
    }
    
    console.log(`✅ Found ${userItems.length} items for current user`)
    
    if (userItems.length === 0) {
      console.log("⚠️  NO ITEMS FOUND FOR CURRENT USER!")
      console.log("🔧 This explains the 'no wardrobe items' message")
      
      // Let's add some items for this user
      console.log("\n🔧 ADDING SAMPLE ITEMS FOR CURRENT USER...")
      
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
            user_id: currentUserId,
            image_url: "/placeholder.jpg"
          })
        
        if (insertError) {
          console.error(`❌ Error adding ${item.name}:`, insertError)
        } else {
          console.log(`✅ Added ${item.name}`)
        }
      }
      
      console.log("\n🎉 Sample items added! Try refreshing the chat page.")
      
    } else {
      console.log("\n📦 Current user's items:")
      userItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (${item.category}) - ${item.color}`)
      })
    }
    
    // Check if user has a wardrobe profile
    const { data: userProfile, error: profileError } = await supabase
      .from("wardrobe_profiles")
      .select("*")
      .eq("user_id", currentUserId)
      .single()
    
    if (profileError && profileError.code !== "PGRST116") {
      console.error("❌ Error fetching user profile:", profileError)
    } else if (!userProfile) {
      console.log("\n⚠️  No wardrobe profile found for current user")
      console.log("🔧 Creating a default profile...")
      
      const { error: createProfileError } = await supabase
        .from("wardrobe_profiles")
        .insert({
          user_id: currentUserId,
          name: "My Wardrobe",
          age: 25,
          date_of_birth: "1999-01-01"
        })
      
      if (createProfileError) {
        console.error("❌ Error creating profile:", createProfileError)
      } else {
        console.log("✅ Created default wardrobe profile")
      }
    } else {
      console.log(`\n✅ User has wardrobe profile: ${userProfile.name}`)
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

checkCurrentUserItems()
