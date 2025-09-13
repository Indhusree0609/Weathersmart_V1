"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeProfileService, wardrobeService } from "@/lib/supabase"
import {
  Plus,
  Users,
  Sparkles,
  User,
  Baby,
  Heart,
  UserCheck,
  CloudRain,
  Snowflake,
  Shield,
  Wind,
  Sun,
  Upload,
  X,
  Edit,
  LogOut,
  Camera,
  Trash2,
  AlertCircle,
} from "lucide-react"

interface WardrobeProfile {
  id: string
  name: string
  relation: string
  age?: number
  dateOfBirth?: string
  gender?: string
  profile_picture_url?: string
  profilePictureUrl?: string
  itemCount: number
  totalValue: number
  lastUpdated: string
  isOwner?: boolean
  avatar: string
  color: string
}

interface NewProfile {
  name: string
  relation: string
  age: string
  dateOfBirth: string
  gender: string
  profilePicture: File | null
  goesToSchool: boolean
  educationType: string
  institutionName: string
  courseMajor: string
  yearGrade: string
  hasUniform: boolean
  dressCodeNotes: string
  weatherEssentials: string[]
}

interface EditProfile {
  id: string
  name: string
  relation: string
  age: string
  dateOfBirth: string
  gender: string
  profilePicture: File | null
  goesToSchool: boolean
  educationType: string
  institutionName: string
  courseMajor: string
  yearGrade: string
  hasUniform: boolean
  dressCodeNotes: string
  weatherEssentials: string[]
}

const RELATIONSHIPS = [
  "self",
  "spouse",
  "partner",
  "child",
  "parent",
  "sibling",
  "grandparent",
  "grandchild",
  "friend",
  "other",
]

const EDUCATION_TYPES = ["school", "university", "other"]

const WEATHER_ESSENTIALS = [
  { id: "raincoat", label: "Raincoat & Umbrella", icon: CloudRain },
  { id: "winter_jacket", label: "Winter Jacket", icon: Snowflake },
  { id: "gloves", label: "Gloves", icon: Shield },
  { id: "winter_hat", label: "Winter Hat", icon: Snowflake },
  { id: "scarf", label: "Scarf", icon: Wind },
  { id: "rain_boots", label: "Rain/Snow Boots", icon: Shield },
  { id: "sun_hat", label: "Sun Hat", icon: Sun },
  { id: "sunglasses", label: "Sunglasses", icon: Sun },
]

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Helper function to get age display with days/months for babies
const getAgeDisplay = (dateOfBirth: string): string => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  const ageInYears = calculateAge(dateOfBirth)

  if (ageInYears < 1) {
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    if (ageInMonths < 1) {
      const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${ageInDays} day${ageInDays !== 1 ? "s" : ""} old`
    }
    return `${ageInMonths} month${ageInMonths !== 1 ? "s" : ""} old`
  } else if (ageInYears < 2) {
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return `${ageInYears} year, ${ageInMonths - ageInYears * 12} month${(ageInMonths - ageInYears * 12) !== 1 ? "s" : ""} old`
  }

  return `${ageInYears} year${ageInYears !== 1 ? "s" : ""} old`
}

export default function WardrobesPage() {
  const { user, signOut, loading: authLoading, error: authError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [wardrobes, setWardrobes] = useState<WardrobeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<WardrobeProfile | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dobColumnExists, setDobColumnExists] = useState(false)
  const [profileColumnExists, setProfileColumnExists] = useState(false)
  const [currentStep, setCurrentStep] = useState<"profile" | "family" | "wardrobes">("profile")

  // Form state for adding new profile
  const [newProfile, setNewProfile] = useState<NewProfile>({
    name: "",
    relation: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    profilePicture: null,
    goesToSchool: false,
    educationType: "school",
    institutionName: "",
    courseMajor: "",
    yearGrade: "",
    hasUniform: false,
    dressCodeNotes: "",
    weatherEssentials: [],
  })

  // Form state for editing existing profile
  const [editProfile, setEditProfile] = useState<EditProfile>({
    id: "",
    name: "",
    relation: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    profilePicture: null,
    goesToSchool: false,
    educationType: "school",
    institutionName: "",
    courseMajor: "",
    yearGrade: "",
    hasUniform: false,
    dressCodeNotes: "",
    weatherEssentials: [],
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [hasWardrobeItems, setHasWardrobeItems] = useState(false)
  const [showProfilePictureDialog, setShowProfilePictureDialog] = useState(false)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)

  // Check if user has completed each step
  const hasOwnProfile = wardrobes.some((w) => w.relation === "self" || w.isOwner)
  const hasFamilyMembers = wardrobes.length > 1

  // Determine current step based on completion
  useEffect(() => {
    if (!hasOwnProfile) {
      setCurrentStep("profile")
    } else if (!hasFamilyMembers) {
      setCurrentStep("family")
    } else {
      setCurrentStep("wardrobes")
    }
  }, [hasOwnProfile, hasFamilyMembers])

  // Handle authentication errors and redirect to login
  useEffect(() => {
    if (authError && authError.includes("Invalid Refresh Token")) {
      console.log("Invalid refresh token detected, redirecting to login...")
      router.push("/auth")
      return
    }

    if (!authLoading && !user && !authError) {
      console.log("No user found, redirecting to login...")
      router.push("/auth")
      return
    }
  }, [authError, authLoading, user, router])

  useEffect(() => {
    if (user) {
      checkDatabaseColumns()
      loadWardrobeProfiles()
      checkWardrobeItems()
    }
  }, [user])

  // Check if database columns exist
  const checkDatabaseColumns = async () => {
    try {
      setDobColumnExists(true)
      setProfileColumnExists(true)
    } catch (error) {
      console.error("Error checking database columns:", error)
    }
  }

  // Check if user has any wardrobe items
  const checkWardrobeItems = async () => {
    if (!user) return

    try {
      const { wardrobeService } = await import("@/lib/supabase")
      const items = await wardrobeService.getWardrobeItems(user.id)
      setHasWardrobeItems(items && items.length > 0)
    } catch (error) {
      console.error("Error checking wardrobe items:", error)
      setHasWardrobeItems(false)
    }
  }

  // Load wardrobe profiles
  const loadWardrobeProfiles = async () => {
    if (!user) return

    setLoading(true)
    try {
      const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)

      if (!profiles) {
        console.log("No profiles found or error occurred")
        setWardrobes([])
        return
      }

      // Get item counts for each profile
      const formattedProfiles = await Promise.all(
        profiles.map(async (profile: any, index: number) => {
          let itemCount = 0
          try {
            // Get items for this specific profile
            const items = await wardrobeService.getWardrobeItems(user.id, profile.id)
            itemCount = items?.length || 0
          } catch (error) {
            console.error(`Error getting item count for profile ${profile.id}:`, error)
            itemCount = 0
          }

          return {
            id: profile.id,
            name: profile.name,
            relation: profile.relation || "other",
            age: profile.age,
            dateOfBirth: profile.date_of_birth,
            gender: profile.gender,
            profilePictureUrl: profile.profile_picture_url,
            itemCount: itemCount,
            totalValue: 0,
            lastUpdated: "recently",
            isOwner: profile.is_owner || profile.relation === "self",
            avatar: profile.name?.charAt(0)?.toUpperCase() || "U",
            color: `from-${["blue", "purple", "pink", "green", "yellow", "red"][index % 6]}-500 to-${["purple", "pink", "red", "blue", "green", "orange"][index % 6]}-600`,
          }
        }),
      )

      // Also get the main wardrobe item count for the primary user
      const mainWardrobeItems = await wardrobeService.getWardrobeItems(user.id, null)
      const mainWardrobeCount = mainWardrobeItems?.length || 0

      // Add main wardrobe count to the primary user's profile
      const updatedProfiles = formattedProfiles.map((profile) => {
        if (profile.isOwner || profile.relation === "self") {
          return {
            ...profile,
            itemCount: profile.itemCount + mainWardrobeCount,
          }
        }
        return profile
      })

      setWardrobes(updatedProfiles)
    } catch (error) {
      console.error("Error loading wardrobe profiles:", error)
      setWardrobes([])
    } finally {
      setLoading(false)
    }
  }

  const getRelationIcon = (relation?: string) => {
    switch (relation) {
      case "self":
        return <UserCheck className="w-4 h-4 text-blue-400" />
      case "spouse":
      case "partner":
        return <Heart className="w-4 h-4 text-pink-400" />
      case "child":
        return <Baby className="w-4 h-4 text-blue-400" />
      case "parent":
        return <User className="w-4 h-4 text-green-400" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getRelationshipDisplayName = (relation?: string) => {
    switch (relation) {
      case "self":
        return "You"
      case "spouse":
        return "Spouse"
      case "partner":
        return "Partner"
      case "child":
        return "Child"
      case "parent":
        return "Parent"
      case "sibling":
        return "Sibling"
      case "grandparent":
        return "Grandparent"
      case "grandchild":
        return "Grandchild"
      case "friend":
        return "Friend"
      case "other":
        return "Family Member"
      default:
        return "Family Member"
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewProfile({ ...newProfile, profilePicture: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditProfile({ ...editProfile, profilePicture: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = (formData: NewProfile) => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"

    // For primary user (self), profile picture is required
    if (formData.relation === "self" && !formData.profilePicture) {
      newErrors.profilePicture = "Profile picture is required"
    }

    // Relationship is required for family members, but not for self
    if (formData.relation !== "self" && !formData.relation) {
      newErrors.relation = "Relationship is required"
    }

    if (dobColumnExists) {
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required"
      } else {
        const birthDate = new Date(formData.dateOfBirth)
        const today = new Date()
        if (birthDate > today) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future"
        }
        if (birthDate < new Date("1900-01-01")) {
          newErrors.dateOfBirth = "Please enter a valid date of birth"
        }
      }
    } else {
      if (!formData.age || Number.parseInt(formData.age) < 0 || Number.parseInt(formData.age) > 120) {
        newErrors.age = "Please enter a valid age (0-120)"
      }
    }

    if (!formData.gender) newErrors.gender = "Gender is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddOwnProfile = () => {
    setNewProfile({
      ...newProfile,
      relation: "self",
    })
    setShowAddDialog(true)
  }

  const handleAddFamilyMember = () => {
    setNewProfile({
      ...newProfile,
      relation: "",
    })
    setShowAddDialog(true)
  }

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm(newProfile)) return

    setIsSubmitting(true)
    try {
      const age = newProfile.dateOfBirth ? calculateAge(newProfile.dateOfBirth) : Number.parseInt(newProfile.age) || 0

      const profileData = {
        user_id: user.id,
        name: newProfile.name.trim(),
        relation: newProfile.relation.trim(),
        age: age,
        date_of_birth: newProfile.dateOfBirth || null,
        gender: newProfile.gender || null,
        is_owner: newProfile.relation === "self",
        profile_picture_url: null,
        profile_picture_path: null,
      }

      const createdProfile = await wardrobeProfileService.addWardrobeProfile(profileData)

      if (!createdProfile) {
        throw new Error("Failed to create profile")
      }

      if (newProfile.profilePicture) {
        try {
          const imageResult = await wardrobeProfileService.uploadProfilePicture(
            newProfile.profilePicture,
            user.id,
            createdProfile.id,
          )

          await wardrobeProfileService.updateWardrobeProfile(createdProfile.id, {
            profile_picture_url: imageResult.url,
            profile_picture_path: imageResult.path,
          })
        } catch (imageError) {
          console.error("Error uploading profile picture:", imageError)
        }
      }

      setNewProfile({
        name: "",
        relation: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        profilePicture: null,
        goesToSchool: false,
        educationType: "school",
        institutionName: "",
        courseMajor: "",
        yearGrade: "",
        hasUniform: false,
        dressCodeNotes: "",
        weatherEssentials: [],
      })
      setImagePreview(null)
      setErrors({})
      setShowAddDialog(false)

      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error adding profile:", error)
      alert("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingProfile) return

    setIsSubmitting(true)
    try {
      const age = editProfile.dateOfBirth
        ? calculateAge(editProfile.dateOfBirth)
        : Number.parseInt(editProfile.age) || 0

      const updateData = {
        name: editProfile.name.trim(),
        relation: editProfile.relation.trim(),
        age: age,
        date_of_birth: editProfile.dateOfBirth || null,
        gender: editProfile.gender || null,
      }

      const updatedProfile = await wardrobeProfileService.updateWardrobeProfile(editingProfile.id, updateData)

      if (!updatedProfile) {
        throw new Error("Failed to update profile")
      }

      if (editProfile.profilePicture) {
        try {
          const imageResult = await wardrobeProfileService.uploadProfilePicture(
            editProfile.profilePicture,
            user.id,
            editingProfile.id,
          )

          await wardrobeProfileService.updateWardrobeProfile(editingProfile.id, {
            profile_picture_url: imageResult.url,
            profile_picture_path: imageResult.path,
          })
        } catch (imageError) {
          console.error("Error uploading profile picture:", imageError)
        }
      }

      setShowEditDialog(false)
      setEditingProfile(null)

      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error editing profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile || !user) return

    try {
      setIsSubmitting(true)
      // Here you would upload the profile picture to your storage service
      // For now, we'll just close the dialog
      setShowProfilePictureDialog(false)
      setProfilePicturePreview(null)
      setProfilePictureFile(null)
      // You would also update the user's profile picture URL in the database
    } catch (error) {
      console.error("Error uploading profile picture:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!user) return

    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      return
    }

    try {
      await wardrobeProfileService.deleteWardrobeProfile(profileId)
      await loadWardrobeProfiles()
    } catch (error) {
      console.error("Error deleting profile:", error)
      alert("Failed to delete profile. Please try again.")
    }
  }

  const openEditDialog = (wardrobe: WardrobeProfile) => {
    setEditingProfile(wardrobe)
    setEditProfile({
      id: wardrobe.id,
      name: wardrobe.name,
      relation: wardrobe.relation,
      age: wardrobe.age?.toString() || "",
      dateOfBirth: wardrobe.dateOfBirth || "",
      gender: wardrobe.gender || "",
      profilePicture: null,
      goesToSchool: false,
      educationType: "school",
      institutionName: "",
      courseMajor: "",
      yearGrade: "",
      hasUniform: false,
      dressCodeNotes: "",
      weatherEssentials: [],
    })
    setEditImagePreview(wardrobe.profilePictureUrl || null)
    setShowEditDialog(true)
  }

  // Handle navigation to wardrobe
  const handleViewWardrobe = () => {
    const ownProfile = wardrobes.find((w) => w.relation === "self" || w.isOwner)
    if (ownProfile) {
      router.push(`/wardrobe?profile=${ownProfile.id}`)
    } else {
      // If no profile exists, go to main wardrobe
      router.push("/wardrobe")
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state for auth errors
  if (authError && !authError.includes("Invalid Refresh Token")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-300 mb-4">{authError}</p>
          <Button onClick={() => router.push("/auth")} className="bg-blue-500 hover:bg-blue-600 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">Weather Smart</span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                AI Outfit Picker
              </Link>
              <Link href="/wardrobes" className="text-white font-medium">
                Wardrobes
              </Link>
              <Link href="/weather-essentials" className="text-gray-300 hover:text-white transition-colors">
                Weather Essentials
              </Link>
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-white">{user.email?.split("@")[0]}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut()
                    router.push("/auth")
                  }}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-12 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Primary User Section */}
          <div className="text-center mb-16">
            {hasOwnProfile ? (
              // Show existing profile
              <div>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  {wardrobes.find((w) => w.relation === "self" || w.isOwner)?.profilePictureUrl ? (
                    <img
                      src={wardrobes.find((w) => w.relation === "self" || w.isOwner)?.profilePictureUrl}
                      alt="My Profile"
                      className="w-full h-full object-cover rounded-2xl border-2 border-blue-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                      {wardrobes
                        .find((w) => w.relation === "self" || w.isOwner)
                        ?.name?.charAt(0)
                        .toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const ownProfile = wardrobes.find((w) => w.relation === "self" || w.isOwner)
                      if (ownProfile) {
                        setEditingProfile(ownProfile)
                        setEditProfile({
                          id: ownProfile.id,
                          name: ownProfile.name,
                          relation: ownProfile.relation,
                          dateOfBirth: ownProfile.dateOfBirth || "",
                          age: ownProfile.age?.toString() || "",
                          gender: ownProfile.gender || "",
                          profilePicture: null,
                          goesToSchool: false,
                          educationType: "school",
                          institutionName: "",
                          courseMajor: "",
                          yearGrade: "",
                          hasUniform: false,
                          dressCodeNotes: "",
                          weatherEssentials: [],
                        })
                        setShowEditDialog(true)
                      }
                    }}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
                    title="Edit profile"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {wardrobes.find((w) => w.relation === "self" || w.isOwner)?.name || "My Profile"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {wardrobes.find((w) => w.relation === "self" || w.isOwner)?.itemCount || 0} items
                </p>
              </div>
            ) : (
              // Show create profile prompt
              <div>
                <div className="w-32 h-32 bg-gray-700 border-2 border-dashed border-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-4">Create Your Profile</h2>
                <p className="text-gray-300 mb-6 text-lg">Set up your profile with your name, photo, and details</p>
                <Button
                  onClick={() => {
                    setNewProfile({
                      ...newProfile,
                      relation: "self",
                      name: user?.email?.split("@")[0] || "",
                    })
                    setShowAddDialog(true)
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg rounded-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create My Profile
                </Button>
              </div>
            )}
          </div>

          {/* My Family Wardrobe Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Choose your profile</h2>

            <div className="flex items-center justify-center gap-12 flex-wrap max-w-4xl mx-auto">
              {/* Add Family Member Button */}
              <div className="text-center">
                <button
                  onClick={handleAddFamilyMember}
                  className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-2xl flex items-center justify-center hover:border-gray-300 transition-all duration-200 hover:scale-105 mb-4 bg-gray-800/50"
                >
                  <Plus className="w-12 h-12 text-gray-400" />
                </button>
                <p className="text-gray-300 text-sm font-medium">Add Family Member</p>
              </div>

              {/* Family Members */}
              {loading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="w-32 h-32 bg-gray-700 rounded-2xl animate-pulse mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                    </div>
                  ))}
                </>
              ) : (
                wardrobes
                  .filter((wardrobe) => wardrobe.relation !== "self")
                  .map((wardrobe, index) => (
                    <div key={wardrobe.id} className="flex flex-col items-center text-center">
                      <div className="relative group">
                        <button
                          onClick={() => router.push(`/wardrobe?profile=${wardrobe.id}`)}
                          className="w-32 h-32 rounded-2xl flex items-center justify-center text-white font-semibold text-2xl mb-4 hover:scale-105 transition-all duration-200 shadow-lg overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${
                              ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"][index % 6]
                            }, ${["#8B5CF6", "#EC4899", "#EF4444", "#3B82F6", "#10B981", "#F97316"][index % 6]})`,
                          }}
                        >
                          {wardrobe.profilePictureUrl ? (
                            <img
                              src={wardrobe.profilePictureUrl || "/placeholder.svg"}
                              alt={wardrobe.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            wardrobe.avatar || wardrobe.name?.charAt(0).toUpperCase()
                          )}
                        </button>
                        {/* Edit button */}
                        <button
                          onClick={() => openEditDialog(wardrobe)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-xl flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                          title="Edit profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Delete button - only show for family members, not for self */}
                        {wardrobe.relation !== "self" && !wardrobe.isOwner && (
                          <button
                            onClick={() => handleDeleteProfile(wardrobe.id)}
                            className="absolute -top-2 -left-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col items-center space-y-1 w-full max-w-[140px]">
                        <p className="text-white font-medium text-lg truncate w-full text-center">{wardrobe.name}</p>
                        <p className="text-gray-400 text-sm text-center leading-tight whitespace-nowrap">
                          {getRelationshipDisplayName(wardrobe.relation)}
                          {wardrobe.dateOfBirth && (
                            <>
                              <br />
                              <span className="text-xs">{getAgeDisplay(wardrobe.dateOfBirth)}</span>
                            </>
                          )}
                          {!wardrobe.dateOfBirth && wardrobe.age && (
                            <>
                              <br />
                              <span className="text-xs">{wardrobe.age} years old</span>
                            </>
                          )}
                        </p>
                        <p className="text-gray-500 text-xs">{wardrobe.itemCount || 0} items</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Family Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {newProfile.relation === "self" ? "Create Your Profile" : "Add Family Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProfile} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <Label className="text-sm font-semibold text-gray-300">
                Profile Picture {newProfile.relation === "self" && <span className="text-red-400">*</span>}
              </Label>
              <div className="mt-3">
                {imagePreview ? (
                  <div className="relative w-24 h-24 mx-auto">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                      onClick={() => {
                        setImagePreview(null)
                        setNewProfile({ ...newProfile, profilePicture: null })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {newProfile.relation === "self" ? "Upload your profile picture" : "Upload profile picture"}
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-picture"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-picture")?.click()}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
              {errors.profilePicture && <p className="text-red-400 text-sm mt-1">{errors.profilePicture}</p>}
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-300">
                {newProfile.relation === "self" ? "Display Name" : "Name"} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                placeholder={newProfile.relation === "self" ? "Enter your display name" : "Enter name"}
                required
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Relationship */}
            {newProfile.relation !== "self" && (
              <div>
                <Label htmlFor="relation" className="text-sm font-semibold text-gray-300">
                  Relationship <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={newProfile.relation}
                  onValueChange={(value) => setNewProfile({ ...newProfile, relation: value })}
                >
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    {RELATIONSHIPS.filter((rel) => rel !== "self").map((relation) => (
                      <SelectItem key={relation} value={relation}>
                        <div className="flex items-center gap-2">
                          {getRelationIcon(relation)}
                          {getRelationshipDisplayName(relation)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relation && <p className="text-red-400 text-sm mt-1">{errors.relation}</p>}
              </div>
            )}

            {/* Age or Date of Birth */}
            {dobColumnExists ? (
              <div>
                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-300">
                  Date of Birth <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newProfile.dateOfBirth}
                  onChange={(e) => setNewProfile({ ...newProfile, dateOfBirth: e.target.value })}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
                {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="age" className="text-sm font-semibold text-gray-300">
                  Age <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={newProfile.age}
                  onChange={(e) => setNewProfile({ ...newProfile, age: e.target.value })}
                  placeholder="Enter age"
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
                {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
              </div>
            )}

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-sm font-semibold text-gray-300">
                Gender <span className="text-red-400">*</span>
              </Label>
              <Select
                value={newProfile.gender}
                onValueChange={(value) => setNewProfile({ ...newProfile, gender: value })}
              >
                <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {newProfile.relation === "self" ? "Creating Profile..." : "Adding Member..."}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {newProfile.relation === "self" ? "Create My Profile" : "Add Family Member"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <Label className="text-sm font-semibold text-gray-300">Profile Picture</Label>
              <div className="mt-3">
                {editImagePreview ? (
                  <div className="relative w-24 h-24 mx-auto">
                    <img
                      src={editImagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                      onClick={() => {
                        setEditImagePreview(null)
                        setEditProfile({ ...editProfile, profilePicture: null })
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Upload profile picture</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                      id="edit-profile-picture"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("edit-profile-picture")?.click()}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-300">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editProfile.name}
                onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                placeholder="Enter name"
                required
                className="mt-2 bg-gray-700 border-gray-600 text-white"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Relationship */}
            <div>
              <Label htmlFor="edit-relation" className="text-sm font-semibold text-gray-300">
                Relationship <span className="text-red-400">*</span>
              </Label>
              <Select
                value={editProfile.relation}
                onValueChange={(value) => setEditProfile({ ...editProfile, relation: value })}
              >
                <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {RELATIONSHIPS.map((relation) => (
                    <SelectItem key={relation} value={relation}>
                      <div className="flex items-center gap-2">
                        {getRelationIcon(relation)}
                        {getRelationshipDisplayName(relation)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relation && <p className="text-red-400 text-sm mt-1">{errors.relation}</p>}
            </div>

            {/* Age or Date of Birth */}
            {dobColumnExists ? (
              <div>
                <Label htmlFor="edit-dateOfBirth" className="text-sm font-semibold text-gray-300">
                  Date of Birth <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={editProfile.dateOfBirth}
                  onChange={(e) => setEditProfile({ ...editProfile, dateOfBirth: e.target.value })}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
                {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="edit-age" className="text-sm font-semibold text-gray-300">
                  Age <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-age"
                  type="number"
                  min="0"
                  max="120"
                  value={editProfile.age}
                  onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })}
                  placeholder="Enter age"
                  required
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
                {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
              </div>
            )}

            {/* Gender */}
            <div>
              <Label htmlFor="edit-gender" className="text-sm font-semibold text-gray-300">
                Gender <span className="text-red-400">*</span>
              </Label>
              <Select
                value={editProfile.gender}
                onValueChange={(value) => setEditProfile({ ...editProfile, gender: value })}
              >
                <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={showProfilePictureDialog} onOpenChange={setShowProfilePictureDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Update Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <Label className="text-sm font-semibold text-gray-300">Profile Picture</Label>
              <div className="mt-3">
                {profilePicturePreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={profilePicturePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 rounded-full w-6 h-6 p-0"
                      onClick={() => {
                        setProfilePicturePreview(null)
                        setProfilePictureFile(null)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 mb-2">Upload your profile picture</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="main-profile-picture"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("main-profile-picture")?.click()}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
                    >
                      Choose Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleProfilePictureUpload}
                disabled={isSubmitting || !profilePictureFile}
                className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Picture
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowProfilePictureDialog(false)
                  setProfilePicturePreview(null)
                  setProfilePictureFile(null)
                }}
                className="border-gray-600 hover:bg-gray-700 bg-transparent text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
