import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

async function addShoeCollectionForCurrentUser() {
  try {
    console.log("👠 Adding shoe collection for current user...")

    // This would work if called from within your app where user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ No authenticated user found:", userError)
      console.log("This script needs to be run from within your authenticated app.")
      return
    }

    console.log(`✅ Adding shoes for user: ${user.email} (ID: ${user.id})`)

    // Add each shoe to the wardrobe
    for (const shoe of shoeCollection) {
      const wardrobeItem = {
        user_id: user.id,
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
  } catch (error) {
    console.error("❌ Script error:", error)
  }
}

function getTagColor(tagName) {
  const colorMap = {
    // Colors
    white: "#ffffff",
    black: "#000000",
    pink: "#ff69b4",
    brown: "#8b4513",

    // Occasions
    casual: "#4ade80",
    business: "#3b82f6",
    professional: "#1e40af",
    party: "#f59e0b",
    formal: "#6366f1",

    // Seasons
    spring: "#10b981",
    summer: "#f59e0b",
    fall: "#d97706",
    winter: "#6b7280",

    // Attributes
    comfortable: "#84cc16",
    elegant: "#8b5cf6",
    versatile: "#06b6d4",
    dressy: "#ec4899",
  }

  return colorMap[tagName.toLowerCase()] || "#6b7280"
}

// Run the script
addShoeCollectionForCurrentUser()
