import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import type { NextRequest } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { messages, profileId, weather } = await req.json()

    // Get wardrobe items for the selected profile
    let wardrobeItems = []
    if (profileId) {
      try {
        const { data, error } = await supabase.from("wardrobe_items").select("*").eq("profile_id", profileId)

        if (error) {
          console.error("Database error:", error)
        } else {
          wardrobeItems = data || []
        }
      } catch (dbError) {
        console.error("Database connection error:", dbError)
      }
    }

    // If no wardrobe items found, use mock data
    if (wardrobeItems.length === 0) {
      wardrobeItems = [
        { id: 1, name: "Black Blazer", category: "outerwear", color: "black", season: "all", occasion: "work" },
        { id: 2, name: "White Button Shirt", category: "tops", color: "white", season: "all", occasion: "work" },
        { id: 3, name: "Dark Jeans", category: "bottoms", color: "blue", season: "all", occasion: "casual" },
        { id: 4, name: "Summer Dress", category: "dresses", color: "floral", season: "summer", occasion: "casual" },
        { id: 5, name: "Wool Sweater", category: "tops", color: "gray", season: "winter", occasion: "casual" },
        { id: 6, name: "Black Heels", category: "shoes", color: "black", season: "all", occasion: "work" },
        { id: 7, name: "Sneakers", category: "shoes", color: "white", season: "all", occasion: "casual" },
        { id: 8, name: "Cocktail Dress", category: "dresses", color: "red", season: "all", occasion: "formal" },
      ]
    }

    const systemPrompt = `You are Weather Smart, an AI fashion assistant that helps users choose outfits based on their wardrobe, weather conditions, and occasions.

Current weather: ${weather ? `${weather.temperature}°F, ${weather.condition} (${weather.description})` : "Not available"}

Available wardrobe items:
${wardrobeItems.map((item) => `- ${item.name} (${item.category}, ${item.color}, ${item.season} season, ${item.occasion})`).join("\n")}

Guidelines:
1. Always recommend specific items from the user's wardrobe
2. Consider the weather conditions when making recommendations
3. Match outfits to the occasion (work, casual, formal, etc.)
4. Provide styling tips and explain your reasoning
5. If the user asks for something not in their wardrobe, suggest alternatives from available items
6. Be friendly, helpful, and fashion-forward in your responses

Format your responses with:
- Recommended outfit items
- Weather considerations
- Styling tips
- Why this combination works`

    const result = await streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemPrompt,
      messages,
      maxTokens: 1000,
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
