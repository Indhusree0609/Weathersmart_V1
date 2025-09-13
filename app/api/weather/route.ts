import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")

    if (!location) {
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 })
    }

    // Get coordinates for the location
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    const geoResponse = await fetch(geoUrl)
    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    const { lat, lon } = geoData[0]

    // Get weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()

    if (!weatherResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    return NextResponse.json({
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0,
      icon: weatherData.weather[0].icon,
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
