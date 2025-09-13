import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// CHANGE THIS TO YOUR EMAIL ADDRESS
const TARGET_USER_EMAIL = "your-email@example.com"

const shoeCollection = [
  {
    name: "White Casual Sneakers",
    description: "Comfortable white sneakers perfect for everyday wear and casual outings",
    brand: "Adidas",
    color: "White",
    category: "Shoes",
    condition: "excellent",
    is_favorite: true,
    image_url: "/images/white-casual-sneakers.png",
    size: "8",
    price: 55.0,
    purchase_date: "2024-01-15",
    wear_count: 12,
    tags: ["white", "casual", "sneakers", "comfortable", "everyday", "spring", "summer", "athletic"],
    notes: "Great for walking and casual outings. Clean with mild soap and water.",
  },
  {
    name: "Black Chain Loafers",
    description: "Elegant black loafers with gold chain detail for professional and semi-formal occasions",
    brand: "Aldo",
    color: "Black",
    category: "Shoes",
    condition: "new",
    is_favorite: false,
    image_url: "/images/black-chain-loafers.png",
    size: "8",
    price: 65.0,
    purchase_date: "2024-02-20",
    wear_count: 3,
    tags: ["black", "loafers", "professional", "formal", "chain", "gold", "office", "elegant"],
    notes: "Perfect for office wear and business meetings. Use leather conditioner monthly.",
  },
  {
    name: "Pink Block Heel Sandals",
    description: "Stylish pink block heel sandals perfect for spring and summer occasions",
    brand: "Steve Madden",
    color: "Pink",
    category: "Shoes",
    condition: "excellent",
    is_favorite: true,
    image_url: "/images/pink-block-heel-sandals.png",
    size: "8",
    price: 60.0,
    purchase_date: "2024-03-10",
    wear_count: 8,
    tags: ["pink", "heels", "sandals", "block heel", "spring", "summer", "party", "feminine"],
    notes: "Comfortable block heel makes these perfect for longer wear. Great with dresses and skirts.",
  },
  {
    name: "Brown Pointed Toe Mules",
    description: "Chic brown pointed toe mules that slip on easily for effortless style",
    brand: "Zara",
    color: "Brown",
    category: "Shoes",
    condition: "good",
    is_favorite: false,
    image_url: "/images/brown-pointed-toe-mules.png",
    size: "8",
    price: 50.0,
    purchase_date: "2024-01-30",
    wear_count: 15,
    tags: ["brown", "mules", "pointed toe", "slip on", "versatile", "fall", "winter", "chic"],
    notes: "Easy to slip on and off. Pairs well with both casual and dressy outfits.",
  },
]

async function addShoeCollection() {
  try {
    console.log("🚀 Starting shoe collection addition...")

    console.log("🔍 Looking for user with email:", TARGET_USER_EMAIL)

    // First, let's see what users exist
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("❌ Error fetching users:", userError)
      return
    }

    console.log("👥 Available users:")
    users.users.forEach((user) => {
      console.log(`  - ${user.email} (ID: ${user.id})`)
    })

    // Find the target user
    const targetUser = users.users.find((user) => user.email === TARGET_USER_EMAIL)

    if (!targetUser) {
      console.error(`❌ User with email ${TARGET_USER_EMAIL} not found!`)
      console.log("Please update TARGET_USER_EMAIL in the script to match one of the emails above.")
      return
    }

    console.log(`✅ Found target user: ${targetUser.email} (ID: ${targetUser.id})`)

    // Add each shoe to the wardrobe
    console.log("👠 Adding shoe collection...")

    for (const shoe of shoeCollection) {
      const wardrobeItem = {
        user_id: targetUser.id,
        name: shoe.name,
        description: shoe.description,
        brand: shoe.brand,
        color: shoe.color,
        category: shoe.category,
        condition: shoe.condition,
        is_favorite: shoe.is_favorite,
        image_url: shoe.image_url,
        size: shoe.size,
        price: shoe.price,
        purchase_date: shoe.purchase_date,
        wear_count: shoe.wear_count,
        tags: shoe.tags,
        notes: shoe.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("wardrobe_items").insert([wardrobeItem]).select()

      if (error) {
        console.error(`❌ Error adding ${shoe.name}:`, error)
      } else {
        console.log(`✅ Added: ${shoe.name} (${shoe.brand})`)
      }
    }

    console.log("🎉 Shoe collection added successfully!")
    console.log("👠 Added 4 beautiful shoes to your wardrobe")

    // Verify the items were added
    const { data: items, error: fetchError } = await supabase
      .from("wardrobe_items")
      .select("name, brand, category")
      .eq("user_id", targetUser.id)
      .eq("category", "Shoes")

    if (fetchError) {
      console.error("❌ Error verifying items:", fetchError)
    } else {
      console.log("✅ Verification - Shoes in wardrobe:")
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.brand})`)
      })
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error)
  }
}

// Run the script
addShoeCollection()
