"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, MapPin, Thermometer, Cloud, User, Shirt, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Comprehensive US locations database
const US_LOCATIONS = [
  // Major Metropolitan Areas
  { city: "New York", state: "NY", isCapital: false },
  { city: "Los Angeles", state: "CA", isCapital: false },
  { city: "Chicago", state: "IL", isCapital: false },
  { city: "Houston", state: "TX", isCapital: false },
  { city: "Phoenix", state: "AZ", isCapital: false },
  { city: "Philadelphia", state: "PA", isCapital: false },
  { city: "San Antonio", state: "TX", isCapital: false },
  { city: "San Diego", state: "CA", isCapital: false },
  { city: "Dallas", state: "TX", isCapital: false },
  { city: "San Jose", state: "CA", isCapital: false },

  // State Capitals
  { city: "Montgomery", state: "AL", isCapital: true },
  { city: "Juneau", state: "AK", isCapital: true },
  { city: "Phoenix", state: "AZ", isCapital: true },
  { city: "Little Rock", state: "AR", isCapital: true },
  { city: "Sacramento", state: "CA", isCapital: true },
  { city: "Denver", state: "CO", isCapital: true },
  { city: "Hartford", state: "CT", isCapital: true },
  { city: "Dover", state: "DE", isCapital: true },
  { city: "Tallahassee", state: "FL", isCapital: true },
  { city: "Atlanta", state: "GA", isCapital: true },
  { city: "Honolulu", state: "HI", isCapital: true },
  { city: "Boise", state: "ID", isCapital: true },
  { city: "Springfield", state: "IL", isCapital: true },
  { city: "Indianapolis", state: "IN", isCapital: true },
  { city: "Des Moines", state: "IA", isCapital: true },
  { city: "Topeka", state: "KS", isCapital: true },
  { city: "Frankfort", state: "KY", isCapital: true },
  { city: "Baton Rouge", state: "LA", isCapital: true },
  { city: "Augusta", state: "ME", isCapital: true },
  { city: "Annapolis", state: "MD", isCapital: true },
  { city: "Boston", state: "MA", isCapital: true },
  { city: "Lansing", state: "MI", isCapital: true },
  { city: "Saint Paul", state: "MN", isCapital: true },
  { city: "Jackson", state: "MS", isCapital: true },
  { city: "Jefferson City", state: "MO", isCapital: true },
  { city: "Helena", state: "MT", isCapital: true },
  { city: "Lincoln", state: "NE", isCapital: true },
  { city: "Carson City", state: "NV", isCapital: true },
  { city: "Concord", state: "NH", isCapital: true },
  { city: "Trenton", state: "NJ", isCapital: true },
  { city: "Santa Fe", state: "NM", isCapital: true },
  { city: "Albany", state: "NY", isCapital: true },
  { city: "Raleigh", state: "NC", isCapital: true },
  { city: "Bismarck", state: "ND", isCapital: true },
  { city: "Columbus", state: "OH", isCapital: true },
  { city: "Oklahoma City", state: "OK", isCapital: true },
  { city: "Salem", state: "OR", isCapital: true },
  { city: "Harrisburg", state: "PA", isCapital: true },
  { city: "Providence", state: "RI", isCapital: true },
  { city: "Columbia", state: "SC", isCapital: true },
  { city: "Pierre", state: "SD", isCapital: true },
  { city: "Nashville", state: "TN", isCapital: true },
  { city: "Austin", state: "TX", isCapital: true },
  { city: "Salt Lake City", state: "UT", isCapital: true },
  { city: "Montpelier", state: "VT", isCapital: true },
  { city: "Richmond", state: "VA", isCapital: true },
  { city: "Olympia", state: "WA", isCapital: true },
  { city: "Charleston", state: "WV", isCapital: true },
  { city: "Madison", state: "WI", isCapital: true },
  { city: "Cheyenne", state: "WY", isCapital: true },

  // Additional Major Cities
  { city: "Miami", state: "FL", isCapital: false },
  { city: "Orlando", state: "FL", isCapital: false },
  { city: "Tampa", state: "FL", isCapital: false },
  { city: "Las Vegas", state: "NV", isCapital: false },
  { city: "Seattle", state: "WA", isCapital: false },
  { city: "Portland", state: "OR", isCapital: false },
  { city: "San Francisco", state: "CA", isCapital: false },
  { city: "Detroit", state: "MI", isCapital: false },
  { city: "Memphis", state: "TN", isCapital: false },
  { city: "Baltimore", state: "MD", isCapital: false },
  { city: "Milwaukee", state: "WI", isCapital: false },
  { city: "Albuquerque", state: "NM", isCapital: false },
  { city: "Tucson", state: "AZ", isCapital: false },
  { city: "Fresno", state: "CA", isCapital: false },
  { city: "Mesa", state: "AZ", isCapital: false },
  { city: "Kansas City", state: "MO", isCapital: false },
  { city: "Virginia Beach", state: "VA", isCapital: false },
  { city: "Colorado Springs", state: "CO", isCapital: false },
  { city: "Omaha", state: "NE", isCapital: false },
  { city: "Raleigh", state: "NC", isCapital: true },
  { city: "Long Beach", state: "CA", isCapital: false },
  { city: "Minneapolis", state: "MN", isCapital: false },
  { city: "Cleveland", state: "OH", isCapital: false },
  { city: "New Orleans", state: "LA", isCapital: false },
  { city: "Wichita", state: "KS", isCapital: false },
  { city: "Arlington", state: "TX", isCapital: false },
  { city: "Bakersfield", state: "CA", isCapital: false },
  { city: "Tampa", state: "FL", isCapital: false },
  { city: "Aurora", state: "CO", isCapital: false },
  { city: "Anaheim", state: "CA", isCapital: false },
  { city: "Honolulu", state: "HI", isCapital: true },
  { city: "Santa Ana", state: "CA", isCapital: false },
  { city: "Corpus Christi", state: "TX", isCapital: false },
  { city: "Riverside", state: "CA", isCapital: false },
  { city: "Lexington", state: "KY", isCapital: false },
  { city: "Stockton", state: "CA", isCapital: false },
  { city: "St. Louis", state: "MO", isCapital: false },
  { city: "Saint Paul", state: "MN", isCapital: true },
  { city: "Cincinnati", state: "OH", isCapital: false },
  { city: "Pittsburgh", state: "PA", isCapital: false },
  { city: "Greensboro", state: "NC", isCapital: false },
  { city: "Lincoln", state: "NE", isCapital: true },
  { city: "Plano", state: "TX", isCapital: false },
  { city: "Anchorage", state: "AK", isCapital: false },
  { city: "Orlando", state: "FL", isCapital: false },
  { city: "Irvine", state: "CA", isCapital: false },
  { city: "Newark", state: "NJ", isCapital: false },
  { city: "Durham", state: "NC", isCapital: false },
  { city: "Chula Vista", state: "CA", isCapital: false },
  { city: "Toledo", state: "OH", isCapital: false },
  { city: "Fort Wayne", state: "IN", isCapital: false },
  { city: "St. Petersburg", state: "FL", isCapital: false },
  { city: "Laredo", state: "TX", isCapital: false },
  { city: "Jersey City", state: "NJ", isCapital: false },
  { city: "Chandler", state: "AZ", isCapital: false },
  { city: "Madison", state: "WI", isCapital: true },
  { city: "Lubbock", state: "TX", isCapital: false },
  { city: "Scottsdale", state: "AZ", isCapital: false },
  { city: "Reno", state: "NV", isCapital: false },
  { city: "Buffalo", state: "NY", isCapital: false },
  { city: "Gilbert", state: "AZ", isCapital: false },
  { city: "Glendale", state: "AZ", isCapital: false },
  { city: "North Las Vegas", state: "NV", isCapital: false },
  { city: "Winston-Salem", state: "NC", isCapital: false },
  { city: "Chesapeake", state: "VA", isCapital: false },
  { city: "Norfolk", state: "VA", isCapital: false },
  { city: "Fremont", state: "CA", isCapital: false },
  { city: "Garland", state: "TX", isCapital: false },
  { city: "Irving", state: "TX", isCapital: false },
  { city: "Hialeah", state: "FL", isCapital: false },
  { city: "Richmond", state: "VA", isCapital: true },
  { city: "Boise", state: "ID", isCapital: true },
  { city: "Spokane", state: "WA", isCapital: false },
  { city: "Baton Rouge", state: "LA", isCapital: true },
]

interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

interface WardrobeProfile {
  id: string
  name: string
  relationship: string
  age?: number
}

export default function ChatPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [locationOpen, setLocationOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([
    { id: "owner", name: "My Wardrobe", relationship: "owner" },
    { id: "spouse", name: "Partner", relationship: "spouse" },
    { id: "child1", name: "Emma (12)", relationship: "child", age: 12 },
    { id: "child2", name: "Alex (8)", relationship: "child", age: 8 },
  ])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      profileId: selectedProfile,
      weather: weather,
    },
  })

  // Set default profile on load
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0].id)
    }
  }, [profiles, selectedProfile])

  // Filter locations based on search query
  const filteredLocations = US_LOCATIONS.filter((location) =>
    `${location.city}, ${location.state}`.toLowerCase().includes(searchQuery.toLowerCase()),
  ).slice(0, 50) // Limit results for performance

  const fetchWeather = async (location: string) => {
    setWeatherLoading(true)
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`)
      if (response.ok) {
        const data = await response.json()
        setWeather(data)
      } else {
        console.error("Failed to fetch weather")
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
    setLocationOpen(false)
    setSearchQuery("")
    fetchWeather(location)
  }

  const quickPrompts = [
    "What should I wear today?",
    "I need a work outfit",
    "Suggest a casual weekend look",
    "What's good for a dinner date?",
    "I'm going to a wedding",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Weather Smart</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Profile Selector */}
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id} className="text-white hover:bg-slate-700">
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Selector */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationOpen}
                      className="w-60 justify-between bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                    >
                      {selectedLocation || "Search location..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-0 bg-slate-800 border-slate-600">
                    <Command className="bg-slate-800">
                      <CommandInput
                        placeholder="Search cities..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        className="text-white"
                      />
                      <CommandEmpty className="text-slate-400 p-4">No cities found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList className="max-h-60">
                          {filteredLocations.map((location) => (
                            <CommandItem
                              key={`${location.city}-${location.state}`}
                              value={`${location.city}, ${location.state}`}
                              onSelect={() => handleLocationSelect(`${location.city}, ${location.state}`)}
                              className="text-white hover:bg-slate-700 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === `${location.city}, ${location.state}`
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {location.city}, {location.state}
                                </span>
                                {location.isCapital && (
                                  <Badge variant="secondary" className="ml-2 text-xs bg-blue-600 text-white">
                                    Capital
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shirt className="w-5 h-5" />
                  <span>AI Outfit Assistant</span>
                  {selectedProfile && (
                    <Badge variant="outline" className="ml-2 border-blue-500 text-blue-400">
                      {profiles.find((p) => p.id === selectedProfile)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full pb-4">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shirt className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Welcome to Weather Smart!</h3>
                        <p className="text-slate-400 mb-4">
                          I'm your AI fashion assistant. Ask me about outfit recommendations!
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickPrompts.map((prompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSubmit({ preventDefault: () => {} } as any, { data: { message: prompt } })
                              }
                              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-slate-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about outfit recommendations..."
                    className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Cloud className="w-5 h-5" />
                  <span>Current Weather</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weatherLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-slate-700" />
                    <Skeleton className="h-4 w-3/4 bg-slate-700" />
                    <Skeleton className="h-4 w-1/2 bg-slate-700" />
                  </div>
                ) : weather ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">{weather.temperature}°F</p>
                        <p className="text-slate-400 capitalize">{weather.description}</p>
                      </div>
                      <Thermometer className="w-8 h-8 text-blue-400" />
                    </div>
                    <Separator className="bg-slate-600" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Humidity</p>
                        <p className="text-white font-medium">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Wind</p>
                        <p className="text-white font-medium">{weather.windSpeed} mph</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Cloud className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">Select a location to see weather</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Active Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{profiles.find((p) => p.id === selectedProfile)?.name}</p>
                        <p className="text-slate-400 text-sm capitalize">
                          {profiles.find((p) => p.id === selectedProfile)?.relationship}
                        </p>
                      </div>
                    </div>
                    <Separator className="bg-slate-600" />
                    <Button
                      variant="outline"
                      className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      View Full Wardrobe
                    </Button>
                  </div>
                ) : (
                  <p className="text-slate-400">No profile selected</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => handleSubmit({ preventDefault: () => {} } as any, { data: { message: prompt } })}
                  >
                    {prompt}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
