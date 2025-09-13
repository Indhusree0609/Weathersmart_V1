import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment variables")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    console.log("=== SIMPLE CHAT API ===")
    console.log("User ID:", userId)
    console.log("Message:", message)

    // Simple wardrobe fetch with error handling
    let wardrobeData = []
    let hasWardrobeData = false
    
    try {
      console.log("Fetching wardrobe items...")
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", userId)
        .limit(50)

      if (error) {
        console.error("Wardrobe fetch error:", error)
      } else {
        wardrobeData = data || []
        hasWardrobeData = wardrobeData.length > 0
        console.log(`Found ${wardrobeData.length} wardrobe items`)
      }
    } catch (error) {
      console.error("Wardrobe fetch exception:", error)
    }

    // Build system prompt
    let systemPrompt = `You are Weather Smart AI, an expert fashion and wardrobe assistant. Help users pick outfits based on their wardrobe and weather conditions.`

    if (hasWardrobeData) {
      systemPrompt += `\n\nUSER'S WARDROBE ITEMS:\n`
      
      // Group by category
      const categories = {}
      wardrobeData.forEach(item => {
        const category = item.category || 'Other'
        if (!categories[category]) categories[category] = []
        categories[category].push(item)
      })

      Object.entries(categories).forEach(([category, items]) => {
        systemPrompt += `\n${category.toUpperCase()}:\n`
        items.forEach(item => {
          systemPrompt += `• ${item.name}`
          if (item.color) systemPrompt += ` (${item.color})`
          if (item.brand) systemPrompt += ` - ${item.brand}`
          systemPrompt += `\n`
        })
      })

      systemPrompt += `\n\nPlease recommend specific items from the wardrobe above when suggesting outfits.`
    } else {
      systemPrompt += `\n\nNOTE: No wardrobe items found. Provide general styling advice and suggest the user add items to their wardrobe.`
    }

    console.log("Generating AI response...")

    // Generate AI response
    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307", { apiKey }),
      system: systemPrompt,
      prompt: message,
      maxTokens: 1000,
    })

    console.log("AI response generated successfully")

    return NextResponse.json({
      response: text,
      hasWardrobeData,
      wardrobeItemCount: wardrobeData.length,
      suggestions: hasWardrobeData ? [
        "What should I wear today?",
        "Suggest a work outfit",
        "What's good for this weather?",
        "Help me style these items"
      ] : [
        "Add items to your wardrobe first",
        "Tell me what clothes you have",
        "How can I help you today?"
      ],
    })

  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json({
      response: "I'm sorry, I encountered an error. Please try again or check your wardrobe connection.",
      hasWardrobeData: false,
      wardrobeItemCount: 0,
      suggestions: ["Try again", "Check your wardrobe", "Add wardrobe items"],
      error: true,
      errorDetails: error instanceof Error ? error.message : "Unknown error"
    }, { status: 200 })
  }
}
