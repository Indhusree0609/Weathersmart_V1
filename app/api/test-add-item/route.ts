import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Authentication failed", 
        details: authError?.message 
      }, { status: 401 })
    }

    // Test simple insert
    const testItem = {
      user_id: user.id,
      name: "Test Item",
      category: "tops",
      condition: "good",
      wear_count: 0
    }

    console.log("Attempting to insert:", testItem)

    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert([testItem])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: "Database insertion failed",
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Test item added successfully",
      item: data
    })

  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ 
      error: "Unexpected error occurred",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
