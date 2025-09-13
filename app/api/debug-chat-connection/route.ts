import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    console.log("=== DEBUG CHAT CONNECTION ===")

    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("Environment variables:", {
      hasSupabaseUrl,
      hasAnonKey,
      hasServiceKey,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })

    if (!hasSupabaseUrl || (!hasAnonKey && !hasServiceKey)) {
      return NextResponse.json({
        status: "error",
        message: "Missing Supabase credentials",
        usingMockData: true,
        environment: {
          hasSupabaseUrl,
          hasAnonKey,
          hasServiceKey,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
      })
    }

    // Test Supabase connection
    const { createClient } = await import("@supabase/supabase-js")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test basic connection
    const { data: testData, error: testError } = await supabase.from("wardrobe_items").select("count").limit(1)

    if (testError) {
      console.error("Supabase connection test failed:", testError)
      return NextResponse.json({
        status: "error",
        message: "Supabase connection failed",
        error: testError.message,
        usingMockData: true,
        environment: {
          hasSupabaseUrl,
          hasAnonKey,
          hasServiceKey,
        },
      })
    }

    // Test wardrobe items query
    const { data: wardrobeData, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("id, name, category_id, user_id, wardrobe_profile_id")
      .limit(5)

    // Test profiles query
    const { data: profilesData, error: profilesError } = await supabase
      .from("wardrobe_profiles")
      .select("id, name, user_id")
      .limit(5)

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      usingMockData: false,
      environment: {
        hasSupabaseUrl,
        hasAnonKey,
        hasServiceKey,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      testResults: {
        wardrobeItems: {
          success: !wardrobeError,
          count: wardrobeData?.length || 0,
          error: wardrobeError?.message || null,
          sampleData: wardrobeData?.slice(0, 2) || [],
        },
        profiles: {
          success: !profilesError,
          count: profilesData?.length || 0,
          error: profilesError?.message || null,
          sampleData: profilesData?.slice(0, 2) || [],
        },
      },
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({
      status: "error",
      message: "Debug endpoint failed",
      error: error instanceof Error ? error.message : "Unknown error",
      usingMockData: true,
    })
  }
}
