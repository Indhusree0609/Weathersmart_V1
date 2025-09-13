import { NextRequest, NextResponse } from "next/server"
import { wardrobeService, wardrobeProfileService, checkSupabaseConnection } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId parameter required" }, { status: 400 })
  }

  try {
    console.log(`=== COMPREHENSIVE WARDROBE DEBUG ===`)
    console.log(`User ID: ${userId}`)
    
    // Test 1: Basic Supabase connection
    console.log("1. Testing Supabase connection...")
    const connectionOk = await checkSupabaseConnection()
    console.log("Connection status:", connectionOk)

    // Test 2: Check if profile column exists
    console.log("2. Checking wardrobe_profile_id column...")
    const profileColumnExists = await wardrobeService.checkProfileColumnExists()
    console.log("Profile column exists:", profileColumnExists)

    // Test 3: Run full debug connection
    console.log("3. Running full debug connection...")
    await wardrobeService.debugConnection(userId)

    // Test 4: Fetch wardrobe items
    console.log("4. Fetching wardrobe items...")
    const items = await wardrobeService.getWardrobeItems(userId)
    console.log("Items fetched:", items?.length || 0)

    // Test 5: Fetch wardrobe profiles
    console.log("5. Fetching wardrobe profiles...")
    let profiles = []
    try {
      profiles = await wardrobeProfileService.getWardrobeProfiles(userId) || []
      console.log("Profiles fetched:", profiles.length)
    } catch (profileError) {
      console.error("Profile fetch error:", profileError)
    }

    // Test 6: Test profile-specific wardrobe items
    let profileItems = []
    if (profiles.length > 0) {
      console.log("6. Testing profile-specific items...")
      try {
        profileItems = await wardrobeService.getWardrobeItems(userId, profiles[0].id)
        console.log("Profile-specific items:", profileItems?.length || 0)
      } catch (profileItemError) {
        console.error("Profile item fetch error:", profileItemError)
      }
    }

    const debugResult = {
      userId,
      timestamp: new Date().toISOString(),
      tests: {
        supabaseConnection: connectionOk,
        profileColumnExists,
        wardrobeItemsFetch: {
          success: true,
          itemCount: items?.length || 0,
          sampleItems: items?.slice(0, 3).map(item => ({
            id: item.id,
            name: item.name,
            category: item.category?.name || 'No category',
            brand: item.brand || 'No brand',
            color: item.color || 'No color'
          })) || []
        },
        profilesFetch: {
          success: true,
          profileCount: profiles.length,
          profiles: profiles.map(p => ({
            id: p.id,
            name: p.name,
            relation: p.relation
          }))
        },
        profileSpecificItems: {
          tested: profiles.length > 0,
          itemCount: profileItems?.length || 0
        }
      },
      summary: {
        totalItems: items?.length || 0,
        totalProfiles: profiles.length,
        hasData: (items?.length || 0) > 0,
        recommendations: []
      }
    }

    // Add recommendations based on test results
    if (!connectionOk) {
      debugResult.summary.recommendations.push("Database connection failed - check Supabase configuration")
    }
    if (!profileColumnExists) {
      debugResult.summary.recommendations.push("wardrobe_profile_id column missing - run database migration")
    }
    if ((items?.length || 0) === 0) {
      debugResult.summary.recommendations.push("No wardrobe items found - user should add items to wardrobe")
    }
    if (debugResult.summary.recommendations.length === 0) {
      debugResult.summary.recommendations.push("All tests passed - wardrobe integration should work correctly")
    }

    console.log("=== DEBUG COMPLETE ===")
    
    return NextResponse.json(debugResult)
    
  } catch (error) {
    console.error("Debug wardrobe error:", error)
    return NextResponse.json({ 
      error: "Failed to debug wardrobe",
      details: error instanceof Error ? error.message : "Unknown error",
      userId,
      timestamp: new Date().toISOString(),
      tests: {
        supabaseConnection: false,
        error: true
      }
    }, { status: 500 })
  }
}
