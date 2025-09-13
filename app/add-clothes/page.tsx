"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sparkles,
  Upload,
  X,
  ArrowLeft,
  Star,
  DollarSign,
  Calendar,
  Shirt,
  Sun,
  Cloud,
  Snowflake,
  CloudRain,
  Wind,
  GraduationCap,
  Briefcase,
  Baby,
  User,
  Shield,
  Heart,
  Zap,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeService, wardrobeProfileService, type WardrobeProfile, type Category } from "@/lib/supabase"

interface FormData {
  name: string
  description: string
  brand: string
  color: string
  size: string
  price: string
  purchaseDate: string
  category: string
  condition: string
  image: File | null
  tags: string[]
  timesWorn: string
  // Age-specific fields
  weatherSuitability: string[]
  seasonalUse: string[]
  occasions: string[]
  schoolCompliant: boolean
  workAppropriate: boolean
  hasGrowthRoom: boolean
  safetyFeatures: string[]
  careInstructions: string
  // Enhanced kids-specific fields
  growthTracking: string
  favoriteItem: boolean
  easyToClean: boolean
  comfortRating: number
}

const CONDITIONS = [
  { value: "new", label: "New with tags" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
]

const COLORS = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "gray", label: "Gray" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "purple", label: "Purple" },
  { value: "brown", label: "Brown" },
  { value: "orange", label: "Orange" },
  { value: "navy", label: "Navy" },
  { value: "beige", label: "Beige" },
  { value: "cream", label: "Cream" },
  { value: "maroon", label: "Maroon" },
]

const WEATHER_CONDITIONS = [
  { value: "hot", label: "Hot weather", icon: Sun },
  { value: "cold", label: "Cold weather", icon: Snowflake },
  { value: "rainy", label: "Rainy weather", icon: CloudRain },
  { value: "windy", label: "Windy weather", icon: Wind },
  { value: "mild", label: "Mild weather", icon: Cloud },
]

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall/Autumn" },
  { value: "winter", label: "Winter" },
]

const ENHANCED_SAFETY_FEATURES = [
  { value: "reflective", label: "🔆 Reflective strips" },
  { value: "bright_colors", label: "🌈 Bright/visible colors" },
  { value: "non_slip", label: "👟 Non-slip soles" },
  { value: "soft_materials", label: "🧸 Soft materials" },
  { value: "no_small_parts", label: "🔒 No small parts" },
  { value: "flame_resistant", label: "🔥 Flame resistant" },
  { value: "easy_fasteners", label: "✨ Easy fasteners (velcro, snaps)" },
  { value: "machine_washable", label: "🧺 Machine washable" },
  { value: "hypoallergenic", label: "🌿 Hypoallergenic materials" },
  { value: "uv_protection", label: "☀️ UV protection" },
  { value: "breathable_fabric", label: "💨 Breathable fabric" },
  { value: "reinforced_knees", label: "💪 Reinforced knees/elbows" },
  { value: "rounded_edges", label: "🔄 Rounded edges/no sharp parts" },
  { value: "secure_buttons", label: "🔘 Secure buttons/no choking hazards" },
  { value: "tag_free", label: "🏷️ Tag-free or soft tags" },
  { value: "lead_free", label: "✅ Lead-free materials" },
]


// Age-specific categories and occasions
const getKidsSizeOptions = (age?: number) => {
  if (!age || age >= 13) return []
  
  if (age <= 2) {
    return [
      { value: "0-3M", label: "0-3 Months" },
      { value: "3-6M", label: "3-6 Months" },
      { value: "6-9M", label: "6-9 Months" },
      { value: "9-12M", label: "9-12 Months" },
      { value: "12-18M", label: "12-18 Months" },
      { value: "18-24M", label: "18-24 Months" },
      { value: "2T", label: "2T" },
    ]
  } else if (age <= 5) {
    return [
      { value: "2T", label: "2T" },
      { value: "3T", label: "3T" },
      { value: "4T", label: "4T" },
      { value: "5T", label: "5T" },
      { value: "XS", label: "XS (4-5)" },
    ]
  } else {
    return [
      { value: "XS", label: "XS (4-5)" },
      { value: "S", label: "S (6-7)" },
      { value: "M", label: "M (8-10)" },
      { value: "L", label: "L (10-12)" },
      { value: "XL", label: "XL (14-16)" },
      { value: "6", label: "Size 6" },
      { value: "7", label: "Size 7" },
      { value: "8", label: "Size 8" },
      { value: "10", label: "Size 10" },
      { value: "12", label: "Size 12" },
      { value: "14", label: "Size 14" },
    ]
  }
}
const GROWTH_TRACKING_OPTIONS = [
  { value: "too_small", label: "Too Small" },
  { value: "perfect_fit", label: "Perfect Fit" },
  { value: "room_to_grow", label: "Room to Grow" },
  { value: "too_big", label: "Too Big" },
]

const KIDS_CARE_TEMPLATES = [
  { value: "easy_care", label: "🧺 Easy Care (Machine wash cold, tumble dry low)" },
  { value: "stain_resistant", label: "🛡️ Stain Resistant (Pre-treat stains, machine wash)" },
  { value: "delicate", label: "🌸 Delicate (Hand wash or gentle cycle)" },
  { value: "play_clothes", label: "🎮 Play Clothes (Machine wash warm, can handle rough play)" },
  { value: "school_uniform", label: "🎒 School Uniform (Follow school care guidelines)" },
]

const getAgeSpecificData = (age?: number) => {
  const isChild = age !== undefined && age < 13
  const isTeen = age !== undefined && age >= 13 && age < 18
  const isAdult = age === undefined || age >= 18

  const categories = [
    { value: "tops", label: "Tops & Shirts" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outerwear" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
    { value: "underwear", label: "Underwear" },
    { value: "sleepwear", label: "Sleepwear" },
    { value: "activewear", label: "Activewear" },
    { value: "uniform", label: "Uniform" }, // Added uniform for all ages
  ]

  if (isChild) {
    categories.push(
      { value: "school_uniform", label: "School Uniform" },
      { value: "play_clothes", label: "Play Clothes" },
      { value: "party_wear", label: "Party Wear" },
      { value: "costumes", label: "Costumes & Dress-up" },
      { value: "rain_gear", label: "Rain Gear" },
      { value: "swimwear", label: "Swimwear" },
      { value: "special_occasion", label: "Special Occasion" },
      { value: "art_smock", label: "Art Smock/Apron" },
      { value: "bibs", label: "Bibs" },
    )
  }

  if (isTeen) {
    categories.push({ value: "trendy_casual", label: "Trendy Casual" })
  }

  if (isAdult) {
    categories.push(
      { value: "work_wear", label: "Work Wear" },
      { value: "business_casual", label: "Business Casual" },
      { value: "evening_wear", label: "Evening Wear" },
      { value: "formal_wear", label: "Formal Wear" },
    )
  }

  const occasions = []
  if (isChild) {
    occasions.push(
      { value: "school", label: "School" },
      { value: "playground", label: "Playground" },
      { value: "party", label: "Birthday Party" },
      { value: "sleep", label: "Sleep/Bedtime" },
      { value: "sports", label: "Sports/PE" },
      { value: "family_event", label: "Family Event" },
      { value: "playdates", label: "Playdates" },
      { value: "outdoor_activities", label: "Outdoor Activities" },
      { value: "art_crafts", label: "Art & Crafts" },
      { value: "swimming", label: "Swimming" },
      { value: "messy_play", label: "Messy Play" },
      { value: "field_trips", label: "Field Trips" },
    )
  } else if (isTeen) {
    occasions.push(
      { value: "school", label: "School" },
      { value: "casual", label: "Casual Hangout" },
      { value: "sports", label: "Sports/Activities" },
      { value: "party", label: "Party/Social Event" },
      { value: "date", label: "Date" },
      { value: "family_event", label: "Family Event" },
    )
  } else {
    occasions.push(
      { value: "work", label: "Work/Professional" },
      { value: "casual", label: "Casual" },
      { value: "formal", label: "Formal Event" },
      { value: "date_night", label: "Date Night" },
      { value: "travel", label: "Travel" },
      { value: "exercise", label: "Exercise/Gym" },
      { value: "home", label: "Home/Lounging" },
    )
  }

  return { categories, occasions, isChild, isTeen, isAdult }
}

export default function AddClothesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get("profile")
  const isEditing = searchParams.get("edit") === "true"
  const editItemId = searchParams.get("itemId")
  const { user } = useAuth()

  const [currentProfile, setCurrentProfile] = useState<WardrobeProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<string>("")
    const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    purchaseDate: "",
    category: "",
    condition: "good",
    image: null,
    tags: [],
    timesWorn: "0",
    weatherSuitability: [],
    seasonalUse: [],
    occasions: [],
    schoolCompliant: false,
    workAppropriate: false,
    hasGrowthRoom: false,
    safetyFeatures: [],
    careInstructions: "",
    // Enhanced kids-specific fields
    growthTracking: "perfect_fit",
    favoriteItem: false,
    easyToClean: false,
    comfortRating: 5,
  })

  // Load profile data and categories
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load categories from database
          const categoriesData = await wardrobeService.getCategories()
          let availableCategories = categoriesData || []
          
          // If we have a profile, add age-specific categories
          if (profileId) {
            const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
            const profile = profiles?.find((p) => p.id === profileId)
            setCurrentProfile(profile || null)
            
            if (profile?.age) {
              const ageSpecificData = getAgeSpecificData(profile.age)
              // Convert age-specific categories to the same format as database categories
              const ageSpecificCategories = ageSpecificData.categories.map(cat => ({
                id: cat.value,
                name: cat.label,
                created_at: new Date().toISOString(),
                user_id: user.id
              }))
              
              // Merge with existing categories, avoiding duplicates
              const existingCategoryValues = availableCategories.map(cat => cat.name.toLowerCase())
              const newCategories = ageSpecificCategories.filter(cat => 
                !existingCategoryValues.includes(cat.name.toLowerCase())
              )
              
              availableCategories = [...availableCategories, ...newCategories]
            }
          }
          
          setCategories(availableCategories)
        } catch (error) {
          console.error("Error loading data:", error)
          setCategories([])
        }
      }
    }
    loadData()
  }, [profileId, user])

  // Handle edit mode - populate form with existing item data
  useEffect(() => {
    if (isEditing && searchParams) {
      setFormData({
        name: searchParams.get("name") || "",
        description: searchParams.get("description") || "",
        brand: searchParams.get("brand") || "",
        color: searchParams.get("color") || "",
        size: searchParams.get("size") || "",
        price: searchParams.get("price") || "",
        purchaseDate: "",
        category: searchParams.get("category") || "",
        condition: searchParams.get("condition") || "good",
        image: null,
        tags: [],
        timesWorn: searchParams.get("wearCount") || "0",
        weatherSuitability: [],
        seasonalUse: [],
        occasions: [],
        schoolCompliant: false,
        workAppropriate: false,
        hasGrowthRoom: false,
        safetyFeatures: [],
        careInstructions: "",
      })
    }
  }, [isEditing, searchParams])

  const ageSpecificData = getAgeSpecificData(currentProfile?.age)

  // Helper function to determine if this is a child's wardrobe based on relationship
  const isChildProfile = () => {
    console.log("🔍 isChildProfile Debug:")
    console.log("- currentProfile:", currentProfile)
    console.log("- currentProfile.relation:", currentProfile?.relation)
    console.log("- profileId:", profileId)
    
    if (!currentProfile?.relation) {
      console.log("- No relation found, returning false")
      return false
    }
    const relation = currentProfile.relation.toLowerCase().trim()
    console.log("- Normalized relation:", relation)
    const childRelations = ['child', 'son', 'daughter', 'grandchild']
    const isChild = childRelations.includes(relation)
    console.log("- Is child profile:", isChild)
    return isChild
  }

  // Helper function to determine if this is an adult profile
  const isAdultProfile = () => {
    console.log("🔍 isAdultProfile Debug:")
    const isAdult = !isChildProfile()
    console.log("- Is adult profile:", isAdult)
    return isAdult
  }

  const getAgeIcon = () => {
    if (isChildProfile()) return <Baby className="w-5 h-5" />
    if (!currentProfile?.age) return <User className="w-5 h-5" />
    if (currentProfile.age < 5) return <Baby className="w-5 h-5" />
    if (currentProfile.age < 18) return <GraduationCap className="w-5 h-5" />
    return <Briefcase className="w-5 h-5" />
  }

  const getAgeCategory = () => {
    if (isChildProfile()) return "Child"
    if (!currentProfile?.age) return "Adult"
    if (currentProfile.age < 5) return "Toddler"
    if (currentProfile.age < 13) return "Child"
    if (currentProfile.age < 18) return "Teen"
    return "Adult"
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
  }

  const handleArrayFieldChange = (field: keyof FormData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter((item) => item !== value),
      })
    }
  }

  const generateEnhancedDescription = () => {
    // Add basic description
    let description = formData.description || ""
    
    // Add weather and seasonal info to description
    if (formData.weatherSuitability.length > 0) {
      description += `\nWeather: ${formData.weatherSuitability.join(", ")}`
    }
    if (formData.seasonalUse.length > 0) {
      description += `\nSeasons: ${formData.seasonalUse.join(", ")}`
    }
    if (formData.occasions.length > 0) {
      description += `\nOccasions: ${formData.occasions.join(", ")}`
    }

    // Add age-specific context
    if (currentProfile?.age) {
      description += `\n\nAge-appropriate for: ${getAgeCategory()} (${currentProfile.age} years old)`
    }

    // Add weather suitability
    if (formData.weatherSuitability.length > 0) {
      description += `\nWeather: Suitable for ${formData.weatherSuitability.join(", ")} weather`
    }

    // Add seasonal use
    if (formData.seasonalUse.length > 0) {
      description += `\nSeasons: Best for ${formData.seasonalUse.join(", ")}`
    }

    // Add occasions
    if (formData.occasions.length > 0) {
      description += `\nOccasions: Perfect for ${formData.occasions.join(", ")}`
    }

    // Add compliance info
    if (formData.schoolCompliant) {
      description += `\nSchool dress code compliant`
    }
    if (formData.workAppropriate) {
      description += `\nWork appropriate`
    }

    // Add child-specific features
    if (ageSpecificData.isChild) {
      if (formData.hasGrowthRoom) {
        description += `\nHas room for growth`
      }
      if (formData.safetyFeatures.length > 0) {
        description += `\nSafety features: ${formData.safetyFeatures.join(", ")}`
      }
    }

    // Add care instructions
    if (formData.careInstructions) {
      description += `\nCare: ${formData.careInstructions}`
    }

    return description.trim()
  }

  // Function to reset form data while preserving profile context
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      brand: "",
      color: "",
      size: "",
      price: "",
      purchaseDate: "",
      category: "",
      condition: "good",
      image: null,
      tags: [],
      timesWorn: "0",
      weatherSuitability: [],
      seasonalUse: [],
      occasions: [],
      schoolCompliant: false,
      workAppropriate: false,
      hasGrowthRoom: false,
      safetyFeatures: [],
      careInstructions: "",
      growthTracking: "perfect_fit",
      favoriteItem: false,
      easyToClean: false,
      comfortRating: 5,
    })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      if (!formData.name.trim()) {
        alert("Please enter an item name.")
        return
      }

      if (!formData.category) {
        alert("Please select a category.")
        return
      }

      const itemData = {
        user_id: user.id,
        name: formData.name,
        description: generateEnhancedDescription(),
        brand: formData.brand || undefined,
        color: formData.color || undefined,
        size: formData.size || undefined,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
        purchase_date: formData.purchaseDate || undefined,
        category_id: formData.category, // Use the selected category UUID directly
        condition: formData.condition,
        wear_count: Number.parseInt(formData.timesWorn) || 0,
        wardrobe_profile_id: profileId || undefined,
      }

      const savedItem = await wardrobeService.addWardrobeItem(itemData)

      // Upload image if provided
      if (formData.image) {
        try {
          const imageResult = await wardrobeService.uploadImage(formData.image, user.id, savedItem.id)
          await wardrobeService.updateWardrobeItem(savedItem.id, {
            image_url: imageResult.url,
            image_path: imageResult.path,
          })
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
        }
      }

      // Show success message and reset form instead of redirecting
      setLastAddedItem(formData.name)
      setShowSuccessMessage(true)
      resetForm()
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)

    } catch (error) {
      console.error("Error saving item:", error)
      // Better error reporting
      let errorMessage = "Failed to add item"
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`
      }
      alert(isEditing ? `Failed to update item: ${errorMessage}` : errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <p className="text-gray-400">Please log in to add clothes</p>
          <Link href="/auth">
            <Button className="mt-4 bg-white hover:bg-gray-200 text-black">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={profileId ? "/wardrobes" : "/wardrobe"}>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {profileId ? "Back to Wardrobes" : "Back to Wardrobe"}
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">Add New Item</h1>
              </div>
            </div>
            {currentProfile && (
              <div className="flex items-center space-x-3 bg-gray-700/50 px-4 py-2 rounded-lg">
                {getAgeIcon()}
                <div>
                  <p className="text-white font-medium">{currentProfile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {getAgeCategory()} • {currentProfile.age} years old
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="container mx-auto px-6 pt-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-green-400 font-medium">Item Added Successfully!</p>
                    <p className="text-green-300 text-sm">"{lastAddedItem}" has been added to {currentProfile ? `${currentProfile.name}'s` : "your"} wardrobe.</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => router.push(profileId ? `/wardrobe?profile=${profileId}` : "/wardrobe")}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    View Wardrobe
                  </Button>
                  <Button
                    onClick={() => setShowSuccessMessage(false)}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-green-500/20"
                  >
                    Add Another Item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Item Image */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5" />
                    Item Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
                      />
                      <Button
                        type="button"
                        onClick={removeImage}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-300 mb-2">Upload an image of your clothing item</p>
                      <p className="text-gray-500 text-sm mb-4">Drag and drop or click to browse</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        className="bg-white hover:bg-gray-200 text-black"
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Details */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300 font-medium">
                      Item Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={
                        isChildProfile()
                          ? "e.g., School uniform shirt, Play dress"
                          : "e.g., Business blazer, Casual t-shirt"
                      }
                      required
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-300 font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={
                        isChildProfile()
                          ? "Describe the item, any special features for kids..."
                          : "Describe the item, style, fit, special features..."
                      }
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand" className="text-gray-300 font-medium">
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g., Nike, Zara, H&M"
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color" className="text-gray-300 font-medium">
                        Color
                      </Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => setFormData({ ...formData, color: value })}
                      >
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {COLORS.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-400"
                                  style={{ backgroundColor: color.value === "gray" ? "#6B7280" : color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="size" className="text-gray-300 font-medium">
                        Size
                      </Label>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        placeholder={isChildProfile() ? "e.g., 8Y, 10-12Y" : "e.g., M, L, 32, 8.5"}
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition" className="text-gray-300 font-medium">
                        Condition
                      </Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                      >
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {CONDITIONS.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-gray-300 font-medium">
                        Price
                      </Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate" className="text-gray-300 font-medium">
                        Purchase Date
                      </Label>
                      <div className="relative mt-2">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timesWorn" className="text-gray-300 font-medium">
                        No. of Times Worn
                      </Label>
                      <Input
                        id="timesWorn"
                        type="number"
                        min="0"
                        value={formData.timesWorn}
                        onChange={(e) => setFormData({ ...formData, timesWorn: e.target.value })}
                        placeholder="0"
                        className="mt-2 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-gray-300 font-medium">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder={
                            categories.length === 0 
                              ? "No categories available - please refresh the page" 
                              : "Select category"
                          } />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {categories.length === 0 ? (
                            <div className="p-2 text-gray-400 text-sm">
                              No categories available. Please refresh the page.
                            </div>
                          ) : (
                            // Only show database categories with proper UUIDs
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Age-Specific Features */}
            <div className="space-y-6">
              {/* Weather & Season Suitability */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sun className="w-5 h-5" />
                    Weather & Season
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">Weather Suitability</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {WEATHER_CONDITIONS.map((weather) => (
                        <div key={weather.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`weather-${weather.value}`}
                            checked={formData.weatherSuitability.includes(weather.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("weatherSuitability", weather.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label
                            htmlFor={`weather-${weather.value}`}
                            className="text-gray-300 text-sm flex items-center gap-1"
                          >
                            <weather.icon className="w-3 h-3" />
                            {weather.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">Seasonal Use</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEASONS.map((season) => (
                        <div key={season.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`season-${season.value}`}
                            checked={formData.seasonalUse.includes(season.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("seasonalUse", season.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label htmlFor={`season-${season.value}`} className="text-gray-300 text-sm">
                            {season.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Child-specific Safety Features - Only show for children */}
              {isChildProfile() && (
                <Card className="bg-gray-800/80 backdrop-blur-xl border-green-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-green-400" />
                      Safety Features
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full ml-2">
                        Kids Safety
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="bg-transparent">
                    <div>
                      <Label className="text-gray-300 font-medium mb-3 block">
                        Important safety features for kids' clothing
                      </Label>
                      <div className="grid grid-cols-1 gap-2">
                        {ENHANCED_SAFETY_FEATURES.map((feature) => (
                          <div key={feature.value} className="flex items-center space-x-2 p-1">
                            <Checkbox
                              id={`safety-${feature.value}`}
                              checked={formData.safetyFeatures.includes(feature.value)}
                              onCheckedChange={(checked) =>
                                handleArrayFieldChange("safetyFeatures", feature.value, checked as boolean)
                              }
                              className="border-gray-600 bg-gray-800 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <Label 
                              htmlFor={`safety-${feature.value}`} 
                              className="text-gray-300 text-sm cursor-pointer flex-1"
                            >
                              {feature.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Occasions */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5" />
                    {ageSpecificData.isChild ? "Activities & Occasions" : "Occasions & Use"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 font-medium mb-3 block">
                      {ageSpecificData.isChild ? "Perfect for these activities" : "Perfect for"}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ageSpecificData.occasions.map((occasion) => (
                        <div key={occasion.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`occasion-${occasion.value}`}
                            checked={formData.occasions.includes(occasion.value)}
                            onCheckedChange={(checked) =>
                              handleArrayFieldChange("occasions", occasion.value, checked as boolean)
                            }
                            className="border-gray-600"
                          />
                          <Label htmlFor={`occasion-${occasion.value}`} className="text-gray-300 text-sm">
                            {occasion.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age-specific compliance checks */}
                  <div className="space-y-3">
                    {isChildProfile() && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="schoolCompliant"
                          checked={formData.schoolCompliant}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, schoolCompliant: checked as boolean })
                          }
                          className="border-gray-600"
                        />
                        <Label htmlFor="schoolCompliant" className="text-gray-300 text-sm flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          School dress code compliant
                        </Label>
                      </div>
                    )}

                    {isAdultProfile() && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="workAppropriate"
                          checked={formData.workAppropriate}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, workAppropriate: checked as boolean })
                          }
                          className="border-gray-600"
                        />
                        <Label htmlFor="workAppropriate" className="text-gray-300 text-sm flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Work appropriate
                        </Label>
                      </div>
                    )}

                    {ageSpecificData.isChild && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasGrowthRoom"
                          checked={formData.hasGrowthRoom}
                          onCheckedChange={(checked) => setFormData({ ...formData, hasGrowthRoom: checked as boolean })}
                          className="border-gray-600"
                        />
                        <Label htmlFor="hasGrowthRoom" className="text-gray-300 text-sm flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Has room for growth
                        </Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Care Instructions - Show for all but with different text */}
              <Card className="bg-gray-800/80 backdrop-blur-xl border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5" />
                    Care Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="careInstructions" className="text-gray-300 font-medium">
                      {isChildProfile() ? "Special care needed for this item" : "Care instructions"}
                    </Label>
                    <Textarea
                      id="careInstructions"
                      value={formData.careInstructions}
                      onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                      placeholder={
                        isChildProfile() 
                          ? "e.g., Hand wash only, Air dry, No bleach, Gentle cycle..."
                          : "e.g., Dry clean only, Machine wash cold, Hang dry..."
                      }
                      className="mt-2 bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link href={profileId ? `/wardrobe?profile=${profileId}` : "/wardrobe"}>
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!formData.name || !formData.category || loading}
              className="bg-white hover:bg-gray-200 text-black min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
