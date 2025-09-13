"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, Heart, Star, Calendar, DollarSign, Shirt } from "lucide-react"
import type { WardrobeItem } from "@/lib/supabase"
import Image from "next/image"

interface ViewItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: WardrobeItem | null
}

export default function ViewItemModal({ isOpen, onClose, item }: ViewItemModalProps) {
  if (!item) return null

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

  const categoryName = getCategoryName(item.category)
  const tagNames = getTagNames(item.tags || [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Item Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View detailed information about this wardrobe item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 bg-gray-700 rounded-lg overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Shirt className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                {/* Favorite indicator */}
                {item.is_favorite && (
                  <div className="absolute top-2 right-2 p-1 bg-red-500 rounded-full">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
                {item.description && (
                  <p className="text-gray-300">{item.description}</p>
                )}
              </div>

              {/* Tags and Category */}
              <div className="flex flex-wrap gap-2">
                {categoryName && categoryName !== "Uncategorized" && (
                  <Badge variant="outline" className="border-purple-600 text-purple-400">
                    {categoryName}
                  </Badge>
                )}
                {item.color && (
                  <Badge variant="outline" className="border-blue-600 text-blue-400">
                    {item.color}
                  </Badge>
                )}
                {item.brand && (
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    {item.brand}
                  </Badge>
                )}
                {tagNames.map((tagName, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                    {tagName}
                  </Badge>
                ))}
              </div>

              {/* Condition Badge */}
              <div>
                <Badge
                  variant="outline"
                  className={`${
                    item.condition === "new"
                      ? "border-green-600 text-green-400"
                      : item.condition === "excellent"
                        ? "border-blue-600 text-blue-400"
                        : item.condition === "good"
                          ? "border-yellow-600 text-yellow-400"
                          : "border-gray-600 text-gray-400"
                  }`}
                >
                  {item.condition?.charAt(0).toUpperCase() + item.condition?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Item Details
              </h3>
              
              {item.brand && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium w-20">Brand:</span>
                  <span className="text-white">{item.brand}</span>
                </div>
              )}

              {item.color && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium w-20">Color:</span>
                  <span className="text-white">{item.color}</span>
                </div>
              )}

              {item.size && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-medium w-20">Size:</span>
                  <span className="text-white">{item.size}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium w-20">Category:</span>
                <span className="text-white">{categoryName}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Usage & Value
              </h3>

              {item.price && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 font-medium">Price:</span>
                  <span className="text-green-400 font-semibold">${item.price}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 font-medium">Worn:</span>
                <span className="text-white">{item.wear_count || 0} times</span>
              </div>

              {item.purchase_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 font-medium">Purchased:</span>
                  <span className="text-white">
                    {new Date(item.purchase_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Heart className={`w-4 h-4 ${item.is_favorite ? "text-red-400 fill-current" : "text-gray-400"}`} />
                <span className="text-gray-400 font-medium">Favorite:</span>
                <span className="text-white">{item.is_favorite ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(item.created_at || item.updated_at) && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold text-white mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                {item.created_at && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-medium w-24">Added:</span>
                    <span className="text-gray-300">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {item.updated_at && item.updated_at !== item.created_at && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-medium w-24">Updated:</span>
                    <span className="text-gray-300">
                      {new Date(item.updated_at).toLocaleDateString()} at{" "}
                      {new Date(item.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
