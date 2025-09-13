"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Shirt, Plus, Users, Sparkles, Cloud, User, LogOut, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }

    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/landing")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Function to create navigation URL with referrer
  const createNavUrl = (path: string) => {
    return `${path}?from=/home`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userName = user.email?.split("@")[0] || "User"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Weather Smart</span>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href={createNavUrl("/chat")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  AI Outfit Picker
                </Link>
                <Link
                  href={createNavUrl("/wardrobes")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Wardrobes
                </Link>
                <Link
                  href={createNavUrl("/weather-essentials")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Weather Essentials
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center relative">
              <User className="w-8 h-8 text-blue-600" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {greeting}, {userName}!
              </h1>
              <p className="text-slate-600">
                Ready to discover your perfect style? Let's explore your wardrobe and get personalized recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Style Chat */}
          <Link href={createNavUrl("/chat")}>
            <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Style Chat</h3>
                <p className="text-slate-600 text-sm">Get AI-powered outfit recommendations</p>
              </CardContent>
            </Card>
          </Link>

          {/* Add Clothes */}
          <Link href={createNavUrl("/add-clothes")}>
            <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Add Clothes</h3>
                <p className="text-slate-600 text-sm">Upload new items to your wardrobe</p>
              </CardContent>
            </Card>
          </Link>

          {/* Wardrobes */}
          <Link href={createNavUrl("/wardrobes")}>
            <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Wardrobes</h3>
                <p className="text-slate-600 text-sm">Manage wardrobes for everyone</p>
              </CardContent>
            </Card>
          </Link>

          {/* Weather Essentials */}
          <Link href={createNavUrl("/weather-essentials")}>
            <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Cloud className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Weather Essentials</h3>
                <p className="text-slate-600 text-sm">Manage family weather protection items</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Tips Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Quick Tips</h2>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shirt className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Organize by Season</h3>
                <p className="text-slate-600 text-sm">
                  Keep your wardrobe organized by separating seasonal items for easier outfit planning.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Weather Ready</h3>
                <p className="text-slate-600 text-sm">
                  Use Weather Essentials to track rain gear, winter coats, and sun protection for your family.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Styling</h3>
                <p className="text-slate-600 text-sm">
                  Chat with our AI stylist to get personalized outfit recommendations based on weather and occasion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
