"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Cloud,
  CloudRain,
  Snowflake,
  Sun,
  Wind,
  Shirt,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  User,
  Users,
  Camera,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeProfileService } from "@/lib/supabase"
import type { WardrobeProfile } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { weatherEssentialsService, type WeatherEssential } from "@/lib/supabase"

interface WeatherEssential {
  id: string
  name: string
  category: string
  color?: string
  condition: "new" | "excellent" | "good" | "fair" | "poor"
  weatherConditions: string[]
  assignedTo: string[]
  imageUrl?: string
  createdAt: string
}

const weatherCategories = [
  {
    id: "rain",
    name: "Rain Protection",
    icon: CloudRain,
    color: "bg-blue-500",
    items: ["Raincoat", "Umbrella", "Rain Boots", "Waterproof Jacket"],
  },
  {
    id: "winter",
    name: "Winter Protection",
    icon: Snowflake,
    color: "bg-cyan-500",
    items: ["Winter Jacket", "Winter Hat", "Gloves", "Scarf", "Snow Boots"],
  },
  {
    id: "sun",
    name: "Sun Protection",
    icon: Sun,
    color: "bg-yellow-500",
    items: ["Sun Hat", "Sunglasses", "UV Shirt", "Beach Umbrella"],
  },
  {
    id: "wind",
    name: "Wind Protection",
    icon: Wind,
    color: "bg-gray-500",
    items: ["Windbreaker", "Wind-resistant Jacket", "Fleece"],
  },
  {
    id: "accessories",
    name: "Weather Accessories",
    icon: Shirt,
    color: "bg-purple-500",
    items: ["Thermal Underwear", "Weather-resistant Bag", "Hand Warmers", "Neck Gaiter"],
  },
]

const weatherConditions = ["Rain", "Snow", "Sun", "Wind", "Cold", "Hot", "Humid", "Dry"]

const colorOptions = [
  "Black", "White", "Gray", "Navy", "Blue", "Red", "Green", "Yellow", "Orange", 
  "Purple", "Pink", "Brown", "Beige", "Khaki", "Maroon", "Teal", "Olive", "Silver"
]

const sizeOptions = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  footwear: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"],
  accessories: ["One Size", "S", "M", "L", "XL"],
  umbrella: ["Compact", "Standard", "Large", "Golf"],
}

export default function WeatherEssentialsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [essentials, setEssentials] = useState<WeatherEssential[]>([])
  const [familyMembers, setFamilyMembers] = useState<WardrobeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WeatherEssential | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add missing formData state
  const [formData, setFormData] = useState({
    category: "",
    color: "",
    condition: "good" as "new" | "excellent" | "good" | "fair" | "poor",
    weatherConditions: [] as string[],
    assignedTo: [] as string[],
    imageUrl: "",
    imageFile: null as File | null,
  })

  // Get the referrer from URL params or default to home
  // Get the referrer from URL params or default to wardrobe
  const referrer = searchParams.get("from") || "/wardrobe"

  // Load family members and weather essentials data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      try {
        // Load family members
        const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
        if (profiles) {
          setFamilyMembers(profiles)
        }

        // Load weather essentials from database
        const essentialsData = await weatherEssentialsService.getWeatherEssentials(user.id)
        setEssentials(essentialsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [user?.id, authLoading])

  // Handle back navigation
  const handleBack = () => {
    router.push(referrer)
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Create a preview URL for the image (for immediate display)
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
      
      // Store the actual file for later upload
      setFormData((prev) => ({ ...prev, imageFile: file, imageUrl }))

      console.log("Image selected:", file.name)
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage)
    }
    setUploadedImage(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Filter essentials
  const filteredEssentials = essentials.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesAssignee =
      selectedAssignee === "all" ||
      (selectedAssignee === "unassigned" && item.assignedTo.length === 0) ||
      (selectedAssignee === "common" && item.assignedTo.includes("common")) ||
      item.assignedTo.includes(selectedAssignee)

    return matchesSearch && matchesCategory && matchesAssignee
  })

  // Get category stats
  const categoryStats = weatherCategories.map((category) => ({
    ...category,
    count: essentials.filter((item) => item.category === category.id).length,
  }))

  const handleAddItem = async () => {
    if (!formData.category || !user?.id) return

    // Generate name based on category and selected item from quick select
    const categoryData = weatherCategories.find(c => c.id === formData.category)
    const itemName = categoryData?.name || formData.category

    try {
      const essentialData = {
        user_id: user.id,
        name: itemName,
        category: formData.category,
        color: formData.color || undefined,
        condition: formData.condition,
        weather_conditions: formData.weatherConditions,
        assigned_to: formData.assignedTo,
        image_url: undefined, // Will be set after image upload
      }

      let savedItem;
      
      if (editingItem) {
        // Update existing item
        savedItem = await weatherEssentialsService.updateWeatherEssential(editingItem.id, essentialData)
        if (savedItem) {
          setEssentials((prev) => prev.map((item) => (item.id === editingItem.id ? savedItem : item)))
        }
      } else {
        // Add new item
        savedItem = await weatherEssentialsService.addWeatherEssential(essentialData)
        if (savedItem) {
          setEssentials((prev) => [savedItem, ...prev])
        }
      }

      // Upload image if one was selected
      if (formData.imageFile && savedItem) {
        try {
          setIsUploading(true)
          const imageResult = await weatherEssentialsService.uploadEssentialImage(
            formData.imageFile,
            user.id,
            savedItem.id
          )

          // Update the item with the image URL
          const updatedItemWithImage = await weatherEssentialsService.updateWeatherEssential(savedItem.id, {
            image_url: imageResult.url,
            image_path: imageResult.path,
          })

          if (updatedItemWithImage) {
            setEssentials((prev) => 
              prev.map((item) => (item.id === savedItem.id ? updatedItemWithImage : item))
            )
          }
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
          alert("Item saved but image upload failed. You can edit the item to try uploading the image again.")
        } finally {
          setIsUploading(false)
        }
      }

      resetForm()
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Error saving weather essential:", error)
      alert("Failed to save weather essential. Please try again.")
    }
  }

  const handleEditItem = (item: WeatherEssential) => {
    setFormData({
      category: item.category,
      color: item.color || "",
      condition: item.condition,
      weatherConditions: item.weather_conditions,
      assignedTo: item.assigned_to,
      imageUrl: item.image_url || "",
      imageFile: null, // Reset file input for editing
    })
    if (item.image_url) {
      setUploadedImage(item.image_url)
    }
    setEditingItem(item)
    setIsAddModalOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const success = await weatherEssentialsService.deleteWeatherEssential(id)
      if (success) {
        setEssentials((prev) => prev.filter((item) => item.id !== id))
      } else {
        alert("Failed to delete item. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting weather essential:", error)
      alert("Failed to delete item. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      color: "",
      condition: "good",
      weatherConditions: [],
      assignedTo: [],
      imageUrl: "",
      imageFile: null,
    })
    removeImage()
  }

  const getSizeOptions = (category: string, itemName: string) => {
    if (itemName.toLowerCase().includes("boot") || itemName.toLowerCase().includes("shoe")) {
      return sizeOptions.footwear
    }
    if (itemName.toLowerCase().includes("umbrella")) {
      return sizeOptions.umbrella
    }
    if (category === "rain" || category === "winter" || category === "wind") {
      return sizeOptions.clothing
    }
    return sizeOptions.accessories
  }

  // Get back button text based on referrer
  const getBackButtonText = () => {
    switch (referrer) {
      case "/wardrobe":
        return "Back to Wardrobe"
      case "/wardrobes":
        return "Back to Wardrobes"
      case "/chat":
        return "Back to Style Chat"
      default:
        return "Back to Wardrobe"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to access Weather Essentials</h1>
          <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link href="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">Weather Smart</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/chat" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  AI Outfit Picker
                </Link>
                <Link 
                  href="/wardrobes" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Wardrobes
                </Link>
                <Link 
                  href="/weather-essentials" 
                  className="text-white font-medium border-b-2 border-white pb-1"
                >
                  Weather Essentials
                </Link>
              </div>
            </div>

            {/* User Profile and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/auth")}
                className="bg-white text-black hover:bg-gray-100"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-400" />
              Weather Essentials
            </h1>
            <p className="text-gray-400 mt-2">Manage weather protection items for your family</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setEditingItem(null)
                }}
                className="bg-white hover:bg-gray-200 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingItem ? "Edit Weather Essential" : "Add Weather Essential"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Image Upload */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300 text-sm font-semibold">Item Photo</Label>
                      <div className="mt-2">
                        {uploadedImage ? (
                          <div className="relative">
                            <div className="w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
                              <Image
                                src={uploadedImage || "/placeholder.svg"}
                                alt="Weather item"
                                width={300}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={removeImage}
                              className="absolute top-2 right-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-48 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                          >
                            {isUploading ? (
                              <div className="text-center">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-300 text-sm">Uploading...</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-300 text-sm mb-1">Click to upload photo</p>
                                <p className="text-gray-500 text-xs">PNG, JPG up to 5MB</p>
                              </div>
                            )}
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <Label className="text-gray-300">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          {weatherCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white">
                              <div className="flex items-center gap-2">
                                <category.icon className="w-4 h-4" />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Item Selection */}
                    {formData.category && (
                      <div>
                        <Label className="text-gray-300">Select Item Type</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {weatherCategories
                            .find((c) => c.id === formData.category)
                            ?.items.map((item) => (
                              <Button
                                key={item}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // The item name will be automatically generated based on category
                                  // This button is now just for visual selection
                                }}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                {item}
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Form Fields */}
                  <div className="space-y-4">
                    {/* Color and Condition */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Color</Label>
                        <Select
                          value={formData.color}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {colorOptions.map((color) => (
                              <SelectItem key={color} value={color} className="text-white">
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Condition</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value: any) => setFormData((prev) => ({ ...prev, condition: value }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="new" className="text-white">
                              New
                            </SelectItem>
                            <SelectItem value="excellent" className="text-white">
                              Excellent
                            </SelectItem>
                            <SelectItem value="good" className="text-white">
                              Good
                            </SelectItem>
                            <SelectItem value="fair" className="text-white">
                              Fair
                            </SelectItem>
                            <SelectItem value="poor" className="text-white">
                              Poor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Weather Conditions */}
                    <div>
                      <Label className="text-gray-300">Weather Conditions</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {weatherConditions.map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox
                              id={condition}
                              checked={formData.weatherConditions.includes(condition)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    weatherConditions: [...prev.weatherConditions, condition],
                                  }))
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    weatherConditions: prev.weatherConditions.filter((c) => c !== condition),
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={condition} className="text-gray-300 text-sm">
                              {condition}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Family Member Assignment */}
                    <div>
                      <Label className="text-gray-300">Assign to Family Members</Label>
                      <div className="space-y-2 mt-2">
                        {/* Add Common option */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="common"
                            checked={formData.assignedTo.includes("common")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData((prev) => ({ ...prev, assignedTo: [...prev.assignedTo, "common"] }))
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  assignedTo: prev.assignedTo.filter((id) => id !== "common"),
                                }))
                              }
                            }}
                          />
                          <Label htmlFor="common" className="text-gray-300 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Common (Shared by all)
                          </Label>
                        </div>
                        
                        {/* Individual family members */}
                        {familyMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={member.id}
                              checked={formData.assignedTo.includes(member.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData((prev) => ({ ...prev, assignedTo: [...prev.assignedTo, member.id] }))
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    assignedTo: prev.assignedTo.filter((id) => id !== member.id),
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={member.id} className="text-gray-300">
                              {member.name}
                            </Label>
                          </div>
                        ))}
                        {familyMembers.length === 0 && (
                          <p className="text-gray-500 text-sm">
                            No family members found. Add family members in the wardrobes section.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem} disabled={!formData.category}>
                    {editingItem ? "Update Item" : "Add Item"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {categoryStats.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.id} className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-2`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-white font-medium text-sm">{category.name}</h3>
                      <p className="text-2xl font-bold text-white">{category.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-white">
                All Categories
              </SelectItem>
              {weatherCategories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-white">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <User className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-white">
                All Items
              </SelectItem>
              <SelectItem value="unassigned" className="text-white">
                Unassigned
              </SelectItem>
              <SelectItem value="common" className="text-white">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Common (Shared)
                </div>
              </SelectItem>
              {familyMembers.map((member) => (
                <SelectItem key={member.id} value={member.id} className="text-white">
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEssentials.map((item) => {
            const category = weatherCategories.find((c) => c.id === item.category)
            const IconComponent = category?.icon || Cloud
            const assignedMembers = familyMembers.filter((member) => item.assigned_to.includes(member.id))

            return (
              <Card key={item.id} className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader className="pb-3">
                  <div className="w-full h-48 bg-gray-700 rounded-lg overflow-hidden mb-3">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${category?.color || "bg-gray-600"} flex items-center justify-center`}>
                        <IconComponent className="w-16 h-16 text-white opacity-80" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${category?.color || "bg-gray-600"} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{category?.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.size && (
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white ml-2">{item.size}</span>
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <span className="text-gray-400">Color:</span>
                        <span className="text-white ml-2">{item.color}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Condition:</span>
                      <span className="text-white ml-2 capitalize">{item.condition}</span>
                    </div>
                  </div>

                  {item.weather_conditions.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Weather Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.weather_conditions.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Assigned to:</p>
                    {item.assigned_to.includes("common") ? (
                      <Badge variant="outline" className="text-xs border-gray-600">
                        <Users className="w-3 h-3 mr-1" />
                        Common (Shared by all)
                      </Badge>
                    ) : assignedMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assignedMembers.map((member) => (
                          <Badge key={member.id} variant="outline" className="text-xs border-gray-600">
                            <User className="w-3 h-3 mr-1" />
                            {member.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs border-gray-600">
                        <Users className="w-3 h-3 mr-1" />
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredEssentials.length === 0 && (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No weather essentials found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== "all" || selectedAssignee !== "all"
                ? "Try adjusting your filters or search terms"
                : "Start by adding your first weather essential item"}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Weather Essential
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
