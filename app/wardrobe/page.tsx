"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeService, wardrobeProfileService, type WardrobeItem, type WardrobeProfile } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Star,
  Plus,
  Shirt,
  Sparkles,
  User,
  LogOut,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  MessageCircle,
  Grid3X3,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import EditItemModal from "@/components/edit-item-modal"
import ViewItemModal from "@/components/view-item-modal"

// Mock data for preview mode
const mockWardrobeItems: WardrobeItem[] = [
  {
    id: "1",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    category_id: "1",
    name: "Floral Midi Dress",
    description: "Beautiful blue floral midi dress perfect for spring and summer",
    brand: "Zara",
    color: "Blue",
    size: "M",
    price: 89.99,
    purchase_date: "2024-03-15",
    image_url: "/images/blue-long-lehenga.png",
    is_favorite: true,
    condition: "excellent" as const,
    wear_count: 5,
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
    category: { id: "1", name: "Dresses", created_at: "2024-01-01T00:00:00Z" },
    tags: [
      {
        tag_id: "1",
        wardrobe_item_id: "1",
        tag: { id: "1", name: "Casual", color: "blue", created_at: "2024-01-01T00:00:00Z" },
      },
      {
        tag_id: "2",
        wardrobe_item_id: "1",
        tag: { id: "2", name: "Summer", color: "green", created_at: "2024-01-01T00:00:00Z" },
      },
    ],
  },
  {
    id: "2",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    category_id: "2",
    name: "Black Evening Gown",
    description: "Elegant black evening gown for formal occasions",
    brand: "H&M",
    color: "Black",
    size: "M",
    price: 159.99,
    purchase_date: "2024-02-20",
    image_url: "/images/black-evening-gown.png",
    is_favorite: false,
    condition: "new" as const,
    wear_count: 2,
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2024-02-20T10:00:00Z",
    category: { id: "2", name: "Formal", created_at: "2024-01-01T00:00:00Z" },
    tags: [
      {
        tag_id: "3",
        wardrobe_item_id: "2",
        tag: { id: "3", name: "Formal", color: "purple", created_at: "2024-01-01T00:00:00Z" },
      },
      {
        tag_id: "4",
        wardrobe_item_id: "2",
        tag: { id: "4", name: "Evening", color: "gold", created_at: "2024-01-01T00:00:00Z" },
      },
    ],
  },
  {
    id: "3",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    category_id: "3",
    name: "White Summer Top",
    description: "Light and airy white summer top",
    brand: "Uniqlo",
    color: "White",
    size: "S",
    price: 29.99,
    purchase_date: "2024-04-10",
    image_url: "/images/white-summer-top.png",
    is_favorite: true,
    condition: "good" as const,
    wear_count: 12,
    created_at: "2024-04-10T10:00:00Z",
    updated_at: "2024-04-10T10:00:00Z",
    category: { id: "3", name: "Tops", created_at: "2024-01-01T00:00:00Z" },
    tags: [
      {
        tag_id: "2",
        wardrobe_item_id: "3",
        tag: { id: "2", name: "Summer", color: "green", created_at: "2024-01-01T00:00:00Z" },
      },
      {
        tag_id: "1",
        wardrobe_item_id: "3",
        tag: { id: "1", name: "Casual", color: "blue", created_at: "2024-01-01T00:00:00Z" },
      },
    ],
  },
  {
    id: "4",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    category_id: "4",
    name: "Blue Denim Shorts",
    description: "Classic blue denim shorts for casual wear",
    brand: "Levi's",
    color: "Blue",
    size: "M",
    price: 49.99,
    purchase_date: "2024-05-01",
    image_url: "/images/blue-denim-shorts.png",
    is_favorite: false,
    condition: "excellent" as const,
    wear_count: 8,
    created_at: "2024-05-01T10:00:00Z",
    updated_at: "2024-05-01T10:00:00Z",
    category: { id: "4", name: "Bottoms", created_at: "2024-01-01T00:00:00Z" },
    tags: [
      {
        tag_id: "1",
        wardrobe_item_id: "4",
        tag: { id: "1", name: "Casual", color: "blue", created_at: "2024-01-01T00:00:00Z" },
      },
      {
        tag_id: "2",
        wardrobe_item_id: "4",
        tag: { id: "2", name: "Summer", color: "green", created_at: "2024-01-01T00:00:00Z" },
      },
    ],
  },
  {
    id: "5",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    category_id: "5",
    name: "Pink Heels",
    description: "Stylish pink heels perfect for special occasions",
    brand: "Steve Madden",
    color: "Pink",
    size: "7",
    price: 79.99,
    purchase_date: "2024-03-25",
    image_url: "/images/pink-heels.png",
    is_favorite: true,
    condition: "new" as const,
    wear_count: 3,
    created_at: "2024-03-25T10:00:00Z",
    updated_at: "2024-03-25T10:00:00Z",
    category: { id: "5", name: "Shoes", created_at: "2024-01-01T00:00:00Z" },
    tags: [
      {
        tag_id: "3",
        wardrobe_item_id: "5",
        tag: { id: "3", name: "Formal", color: "purple", created_at: "2024-01-01T00:00:00Z" },
      },
      {
        tag_id: "4",
        wardrobe_item_id: "5",
        tag: { id: "4", name: "Evening", color: "gold", created_at: "2024-01-01T00:00:00Z" },
      },
    ],
  },
]

const mockProfiles: WardrobeProfile[] = [
  {
    id: "profile-1",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Emma's Wardrobe",
    relation: "daughter",
    age: 16,
    is_owner: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "profile-2",
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Work Wardrobe",
    relation: "professional",
    is_owner: true,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
  },
]

export default function WardrobePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get URL parameters
  const profileParam = searchParams.get("profile")
  const itemParam = searchParams.get("item")
  const fromChat = searchParams.get("from") === "chat"

  const [items, setItems] = useState<WardrobeItem[]>([])
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<WardrobeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSeason, setSelectedSeason] = useState("all")
  const [selectedOccasion, setSelectedOccasion] = useState("all")
  const [selectedColor, setSelectedColor] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<WardrobeItem | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Ref for scrolling to highlighted item
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Handle URL parameters
  useEffect(() => {
    if (itemParam) {
      setHighlightedItemId(itemParam)
    }
  }, [itemParam])

  // Load profiles and determine which profile to show
  useEffect(() => {
    const loadProfiles = async () => {
      if (user) {
        try {
          // Check if user ID is a valid UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

          let profilesData: WardrobeProfile[] = []

          if (!uuidRegex.test(user.id)) {
            console.log("Using mock data for preview mode")
            profilesData = mockProfiles
          } else {
            const fetchedProfiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
            profilesData = fetchedProfiles || []
          }

          setProfiles(profilesData)

          // Determine which profile to show
          if (profileParam) {
            // Show specific profile from URL
            const targetProfile = profilesData.find((p) => p.id === profileParam)
            if (targetProfile) {
              setSelectedProfile(targetProfile)
            } else {
              // Profile not found, redirect to wardrobes page
              router.push("/wardrobes")
              return
            }
          } else {
            // No profile specified, redirect to wardrobes page to choose
            router.push("/wardrobes")
            return
          }
        } catch (error) {
          console.error("Error loading profiles:", error)
          // Fallback to mock data
          setProfiles(mockProfiles)
          if (profileParam) {
            const targetProfile = mockProfiles.find((p) => p.id === profileParam)
            setSelectedProfile(targetProfile || null)
          }
        }
      }
    }

    loadProfiles()
  }, [user, profileParam, router])

  // Load wardrobe items for selected profile
  useEffect(() => {
    const loadItems = async () => {
      if (!user || !selectedProfile) return

      setIsLoading(true)
      try {
        let wardrobeItems: WardrobeItem[] = []

        // Check if user ID is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

        if (!uuidRegex.test(user.id)) {
          console.log("Using mock wardrobe data for preview mode")
          wardrobeItems = mockWardrobeItems
        } else {
          wardrobeItems = await wardrobeService.getWardrobeItems(user.id, selectedProfile.id)
        }

        setItems(wardrobeItems || [])
      } catch (error) {
        console.error("Error loading wardrobe items:", error)
        // Fallback to mock data
        setItems(mockWardrobeItems)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [user, selectedProfile])

  // Handle item highlighting and search
  useEffect(() => {
    if (highlightedItemId && items.length > 0) {
      const targetItem = items.find((item) => item.id === highlightedItemId)
      if (targetItem) {
        // Set search term to the item name to filter it
        setSearchTerm(targetItem.name)

        // Scroll to the item after a short delay to ensure rendering
        setTimeout(() => {
          const itemElement = itemRefs.current[highlightedItemId]
          if (itemElement) {
            itemElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })

            // Add highlight effect
            itemElement.style.boxShadow = "0 0 0 3px rgb(59 130 246 / 0.5)"
            itemElement.style.borderRadius = "0.5rem"

            // Remove highlight after 3 seconds
            setTimeout(() => {
              itemElement.style.boxShadow = ""
            }, 3000)
          }
        }, 100)
      }
    }
  }, [highlightedItemId, items])

  // Helper function to get category name
  const getCategoryName = (category: any): string => {
    if (typeof category === "string") return category
    if (category && typeof category === "object" && category.name) return category.name
    return "Uncategorized"
  }

  // Helper function to get tag names
  const getTagNames = (tags: any[]): string[] => {
    if (!Array.isArray(tags)) return []
    return tags
      .map((tagItem) => {
        if (typeof tagItem === "string") return tagItem
        if (tagItem && tagItem.tag && tagItem.tag.name) return tagItem.tag.name
        if (tagItem && tagItem.name) return tagItem.name
        return ""
      })
      .filter(Boolean)
  }

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter((item) => {
      const categoryName = getCategoryName(item.category)
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || categoryName === selectedCategory
      const matchesColor = selectedColor === "all" || item.color === selectedColor
      const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition
      const matchesFavorites = !showFavoritesOnly || item.is_favorite
      const matchesNew = !showNewOnly || item.condition === "new"

      return matchesSearch && matchesCategory && matchesColor && matchesCondition && matchesFavorites && matchesNew
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "category":
          return getCategoryName(a.category).localeCompare(getCategoryName(b.category))
        case "wear_count":
          return (b.wear_count || 0) - (a.wear_count || 0)
        case "price_high":
          return (b.price || 0) - (a.price || 0)
        case "price_low":
          return (a.price || 0) - (b.price || 0)
        default:
          return 0
      }
    })

  // Get unique values for filters
  const categories = [...new Set(items.map((item) => getCategoryName(item.category)).filter(Boolean))]
  const colors = [...new Set(items.map((item) => item.color).filter(Boolean))]
  const conditions = [...new Set(items.map((item) => item.condition).filter(Boolean))]

  // Calculate total value
  const totalValue = filteredAndSortedItems.reduce((sum, item) => sum + (item.price || 0), 0)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleFavorite = async (itemId: string, currentFavorite: boolean) => {
    try {
      // For preview mode, just update local state
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (!uuidRegex.test(user?.id || "")) {
        setItems(items.map((item) => (item.id === itemId ? { ...item, is_favorite: !currentFavorite } : item)))
        return
      }

      const updatedItem = await wardrobeService.updateWardrobeItem(itemId, {
        is_favorite: !currentFavorite,
      })

      if (updatedItem) {
        setItems(items.map((item) => (item.id === itemId ? { ...item, is_favorite: !currentFavorite } : item)))
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      // For preview mode, just update local state
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (!uuidRegex.test(user?.id || "")) {
        setItems(items.filter((item) => item.id !== itemId))
        return
      }

      await wardrobeService.deleteWardrobeItem(itemId)
      setItems(items.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleEditItem = (item: WardrobeItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleSaveEditedItem = (updatedItem: WardrobeItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setEditingItem(null)
    setIsEditModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setEditingItem(null)
    setIsEditModalOpen(false)
  }

  const handleViewItem = (item: WardrobeItem) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewingItem(null)
    setIsViewModalOpen(false)
  }

  const handleBackToChat = () => {
    router.push("/chat")
  }

  const handleViewFullWardrobe = () => {
    // Clear search and filters to show full wardrobe
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedColor("all")
    setSelectedCondition("all")
    setShowFavoritesOnly(false)
    setShowNewOnly(false)
    setHighlightedItemId(null)
  }

  const getBackUrl = () => {
    if (fromChat) {
      return "/chat"
    }
    return "/wardrobes"
  }

  const getBackText = () => {
    if (fromChat) {
      return "Back to AI Outfit Picker"
    }
    return "Back to Wardrobes"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !selectedProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <Link href={getBackUrl()} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                <span>{getBackText()}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">{selectedProfile.name}</span>
              </div>
            </div>

            {/* Right side - Navigation and user */}
            <div className="flex items-center space-x-6">
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                AI Outfit Picker
              </Link>
              <Link href="/wardrobes" className="text-gray-300 hover:text-white transition-colors">
                Wardrobes
              </Link>
              <Link href="/weather-essentials" className="text-gray-300 hover:text-white transition-colors">
                Weather Essentials
              </Link>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-300">{user?.email}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{selectedProfile.name}</h1>
            <p className="text-gray-400">
              {selectedProfile.relation === "self" || selectedProfile.is_owner
                ? "Your personal clothing collection"
                : `${selectedProfile.name}'s clothing collection`}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            {fromChat && (
              <Button
                onClick={handleBackToChat}
                variant="outline"
                className="bg-transparent border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Back to AI Chat
              </Button>
            )}
            <Link href={`/add-clothes?profile=${selectedProfile.id}`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Show "View Full Wardrobe" button when search is active */}
        {(searchTerm ||
          selectedCategory !== "all" ||
          selectedColor !== "all" ||
          selectedCondition !== "all" ||
          showFavoritesOnly ||
          showNewOnly) && (
          <div className="mb-6">
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Filtered View Active</h3>
                  <p className="text-blue-200 text-sm">
                    {highlightedItemId ? "Showing recommended item" : "Some filters are applied"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleViewFullWardrobe}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  View Full Wardrobe
                </Button>
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Sorting */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Filters & Sorting</h2>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Categories
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-white">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Colors
                    </SelectItem>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color} className="text-white">
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Conditions
                    </SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition} className="text-white">
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="newest" className="text-white">
                      Newest First
                    </SelectItem>
                    <SelectItem value="oldest" className="text-white">
                      Oldest First
                    </SelectItem>
                    <SelectItem value="name" className="text-white">
                      Name A-Z
                    </SelectItem>
                    <SelectItem value="category" className="text-white">
                      Category
                    </SelectItem>
                    <SelectItem value="wear_count" className="text-white">
                      Most Worn
                    </SelectItem>
                    <SelectItem value="price_high" className="text-white">
                      Price High-Low
                    </SelectItem>
                    <SelectItem value="price_low" className="text-white">
                      Price Low-High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites"
                  checked={showFavoritesOnly}
                  onCheckedChange={setShowFavoritesOnly}
                  className="border-gray-600"
                />
                <label htmlFor="favorites" className="text-sm text-gray-300">
                  Favorites Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="new" checked={showNewOnly} onCheckedChange={setShowNewOnly} className="border-gray-600" />
                <label htmlFor="new" className="text-sm text-gray-300">
                  New Items Only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            Showing {filteredAndSortedItems.length} of {items.length} items
          </div>
          <div className="text-gray-300">
            Total Value: <span className="text-green-400 font-semibold">${totalValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-400">Loading wardrobe items...</div>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No items found</h3>
            <p className="text-gray-400 mb-6">
              {items.length === 0
                ? `${selectedProfile.name} is empty. Add some items to get started!`
                : "No items match your current filters. Try adjusting your search criteria."}
            </p>
            <div className="flex gap-3 justify-center">
              {items.length > 0 && (
                <Button
                  onClick={handleViewFullWardrobe}
                  variant="outline"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  View Full Wardrobe
                </Button>
              )}
              <Link href={`/add-clothes?profile=${selectedProfile.id}`}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedItems.map((item) => {
              const categoryName = getCategoryName(item.category)
              const tagNames = getTagNames(item.tags || [])

              return (
                <Card
                  key={item.id}
                  ref={(el) => (itemRefs.current[item.id] = el)}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 group"
                >
                  <CardContent className="p-4">
                    {/* Item Image */}
                    <div className="relative aspect-square mb-3 bg-gray-700 rounded-lg overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-12 h-12 text-gray-500" />
                        </div>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={() => toggleFavorite(item.id, item.is_favorite)}
                        className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                          item.is_favorite ? "bg-red-500 text-white" : "bg-gray-800/80 text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${item.is_favorite ? "fill-current" : ""}`} />
                      </button>

                      {/* More options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute top-2 left-2 p-1 bg-gray-800/80 rounded-full text-gray-400 hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem 
                            onClick={() => handleViewItem(item)}
                            className="text-white hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditItem(item)}
                            className="text-white hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-400 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white truncate">{item.name}</h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {categoryName && categoryName !== "Uncategorized" && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {categoryName}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {item.color}
                          </Badge>
                        )}
                        {item.brand && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {item.brand}
                          </Badge>
                        )}
                        {tagNames.slice(0, 2).map((tagName, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {tagName}
                          </Badge>
                        ))}
                      </div>

                      {/* Description */}
                      {item.description && <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>Worn {item.wear_count || 0} times</span>
                        </div>
                        {item.price && <span className="text-green-400 font-medium">${item.price}</span>}
                      </div>

                      {/* Condition */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.condition === "new"
                              ? "border-green-600 text-green-400"
                              : item.condition === "excellent"
                                ? "border-blue-600 text-blue-400"
                                : "border-gray-600 text-gray-400"
                          }`}
                        >
                          {item.condition}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEditedItem}
        item={editingItem}
        userId={user?.id || ""}
      />

      {/* View Item Modal */}
      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        item={viewingItem}
      />
    </div>
  )
}
