import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { occasion, weather, userId, profileId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Fetch wardrobe items for the selected profile
    let wardrobeItems = []
    if (profileId) {
      const { data: items, error } = await supabase.from("wardrobe_items").select("*").eq("profile_id", profileId)

      if (error) {
        console.error("Error fetching wardrobe items:", error)
        return NextResponse.json({ error: "Failed to fetch wardrobe items" }, { status: 500 })
      }

      wardrobeItems = items || []
    }

    if (wardrobeItems.length === 0) {
      return NextResponse.json(
        {
          error: "No wardrobe items found",
          message: "Please add some clothes to your wardrobe first!",
        },
        { status: 404 },
      )
    }

    // Create wardrobe context
    const wardrobeContext = wardrobeItems
      .map((item) => `${item.name} (${item.category}, ${item.color || "no color"}, ${item.brand || "no brand"})`)
      .join(", ")

    const prompt = `Based on the following wardrobe items: ${wardrobeContext}

Create an outfit recommendation for:
- Occasion: ${occasion}
- Weather: ${weather}

Please respond with a JSON object containing:
{
  "items": [array of 2-4 selected wardrobe items that work together],
  "reasoning": "explanation of why this outfit works",
  "stylingTips": ["tip1", "tip2", "tip3"]
}

Select actual items from the wardrobe that complement each other and are appropriate for the occasion and weather.`

    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      prompt,
      maxTokens: 800,
    })

    const recommendation = JSON.parse(text)

    // Match recommended items with actual wardrobe items
    const matchedItems = wardrobeItems
      .filter((item) =>
        recommendation.items.some(
          (recItem: any) =>
            item.name.toLowerCase().includes(recItem.name?.toLowerCase() || "") ||
            item.category.toLowerCase().includes(recItem.category?.toLowerCase() || ""),
        ),
      )
      .slice(0, 4)

    return NextResponse.json({
      items: matchedItems,
      reasoning: recommendation.reasoning,
      stylingTips: recommendation.stylingTips,
      occasion,
      weather,
    })
  } catch (error) {
    console.error("Outfit recommendation error:", error)
    return NextResponse.json({ error: "Failed to generate outfit recommendation" }, { status: 500 })
  }
}
