import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_K

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("SUPABASE_SERVICE_ROLE_K:", !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkOutfitStorage() {
  console.log("🔍 Checking AI Outfit Storage Integration...\n")

  const results = []

  // Check wardrobe_items table
  try {
    const { data, error, count } = await supabase.from("wardrobe_items").select("*", { count: "exact", head: true })

    if (error) {
      results.push({
        component: "Wardrobe Items Table",
        status: "❌ ERROR",
        details: error.message,
        count: 0,
      })
    } else {
      results.push({
        component: "Wardrobe Items Table",
        status: count > 0 ? "✅ OK" : "⚠️  EMPTY",
        details: "Core table storing user clothing items",
        count: count || 0,
      })
    }
  } catch (error) {
    results.push({
      component: "Wardrobe Items Table",
      status: "❌ ERROR",
      details: error.message,
      count: 0,
    })
  }

  // Check outfit_recommendations table
  try {
    const { data, error, count } = await supabase
      .from("outfit_recommendations")
      .select("*", { count: "exact", head: true })

    if (error) {
      results.push({
        component: "AI Recommendations Table",
        status: "❌ MISSING",
        details: "Table does not exist - will be created automatically",
        count: 0,
      })
    } else {
      results.push({
        component: "AI Recommendations Table",
        status: "✅ OK",
        details: "Stores AI-generated outfit suggestions",
        count: count || 0,
      })
    }
  } catch (error) {
    results.push({
      component: "AI Recommendations Table",
      status: "❌ MISSING",
      details: "Table does not exist - will be created automatically",
      count: 0,
    })
  }

  // Check outfits table
  try {
    const { data, error, count } = await supabase.from("outfits").select("*", { count: "exact", head: true })

    if (error) {
      results.push({
        component: "Outfits Table",
        status: "❌ MISSING",
        details: "Table does not exist - will be created automatically",
        count: 0,
      })
    } else {
      results.push({
        component: "Outfits Table",
        status: "✅ OK",
        details: "Saved complete outfit combinations",
        count: count || 0,
      })
    }
  } catch (error) {
    results.push({
      component: "Outfits Table",
      status: "❌ MISSING",
      details: "Table does not exist - will be created automatically",
      count: 0,
    })
  }

  // Check categories table
  try {
    const { data, error, count } = await supabase.from("categories").select("*", { count: "exact", head: true })

    if (error) {
      results.push({
        component: "Categories Table",
        status: "❌ MISSING",
        details: "Table does not exist - will be created automatically",
        count: 0,
      })
    } else {
      results.push({
        component: "Categories Table",
        status: count > 0 ? "✅ OK" : "⚠️  EMPTY",
        details: "Clothing categories (tops, bottoms, etc.)",
        count: count || 0,
      })
    }
  } catch (error) {
    results.push({
      component: "Categories Table",
      status: "❌ MISSING",
      details: "Table does not exist - will be created automatically",
      count: 0,
    })
  }

  // Check weather_essentials table
  try {
    const { data, error, count } = await supabase.from("weather_essentials").select("*", { count: "exact", head: true })

    if (error) {
      results.push({
        component: "Weather Essentials Table",
        status: "⚠️  MISSING",
        details: "Optional table for weather-specific items",
        count: 0,
      })
    } else {
      results.push({
        component: "Weather Essentials Table",
        status: "✅ OK",
        details: "Weather-specific clothing items",
        count: count || 0,
      })
    }
  } catch (error) {
    results.push({
      component: "Weather Essentials Table",
      status: "⚠️  MISSING",
      details: "Optional table for weather-specific items",
      count: 0,
    })
  }

  // Display results
  console.log("📊 INTEGRATION STATUS:\n")
  results.forEach((result) => {
    console.log(`${result.status} ${result.component}`)
    console.log(`   ${result.details}`)
    if (result.count !== undefined) {
      console.log(`   Items: ${result.count}`)
    }
    console.log("")
  })

  // Summary
  const working = results.filter((r) => r.status.includes("✅")).length
  const missing = results.filter((r) => r.status.includes("❌")).length
  const warnings = results.filter((r) => r.status.includes("⚠️")).length

  console.log("📈 SUMMARY:")
  console.log(`✅ Working: ${working}`)
  console.log(`❌ Missing: ${missing}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`📊 Total: ${results.length}`)

  if (missing > 0) {
    console.log("\n🔧 Run the fix script to create missing tables:")
    console.log("node scripts/fix-ai-integration.js")
  } else {
    console.log("\n🎉 AI Outfit Storage Integration is ready!")
  }
}

// Run the check
checkOutfitStorage().catch(console.error)
