"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, Edit } from "lucide-react"
import { wardrobeService } from "@/lib/supabase"
import type { WardrobeItem } from "@/lib/supabase"

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: WardrobeItem) => void
  item: WardrobeItem | null
  userId: string
}

export default function EditItemModal({ isOpen, onClose, onSave, item, userId }: EditItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    color: "",
    size: "",
    price: "",
    condition: "excellent",
    is_favorite: false,
    imageFile: null as File | null,
    imagePreview: null as string | null,
  })

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        brand: item.brand || "",
        color: item.color || "",
        size: item.size || "",
        price: item.price?.toString() || "",
        condition: item.condition || "excellent",
        is_favorite: item.is_favorite || false,
        imageFile: null,
        imagePreview: item.image_url || null,
      })
    }
  }, [item, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
      }))

      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imagePreview: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }))
  }

  const handleSave = async () => {
    if (!item) return

    setLoading(true)
    try {
      let imageUrl = item.image_url
      let imagePath = item.image_path

      // Upload new image if provided
      if (formData.imageFile) {
        try {
          const imageResult = await wardrobeService.uploadImage(formData.imageFile, userId, item.id)
          imageUrl = imageResult.url
          imagePath = imageResult.path
        } catch (imageError) {
          console.error("Error uploading image:", imageError)
          // Continue with update even if image upload fails
        }
      }

      // Update the item
      const updatedItem = await wardrobeService.updateWardrobeItem(item.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        color: formData.color.trim(),
        size: formData.size.trim(),
        price: formData.price ? parseFloat(formData.price) : undefined,
        condition: formData.condition as any,
        is_favorite: formData.is_favorite,
        image_url: imageUrl,
        image_path: imagePath,
      })

      if (updatedItem) {
        onSave(updatedItem)
        onClose()
      }
    } catch (error) {
      console.error("Error updating item:", error)
      alert("There was an error updating the item. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Wardrobe Item
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update the details and image for this wardrobe item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div>
            <Label className="text-gray-300 font-medium">Item Image</Label>
            <div className="mt-2">
              {formData.imagePreview ? (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-600"
                  />
                  <Button
                    type="button"
                    onClick={removeImage}
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="item-image"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById("item-image")?.click()}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Choose Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Upload a new image to replace the current one</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 font-medium">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Brand</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Brand name"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Color</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Color"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Size</Label>
              <Input
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                placeholder="Size"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Price</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 font-medium">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="new" className="text-white">New</SelectItem>
                  <SelectItem value="excellent" className="text-white">Excellent</SelectItem>
                  <SelectItem value="good" className="text-white">Good</SelectItem>
                  <SelectItem value="fair" className="text-white">Fair</SelectItem>
                  <SelectItem value="poor" className="text-white">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-gray-300 font-medium">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the item..."
              className="mt-1 bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={formData.is_favorite}
              onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
              className="rounded border-gray-600"
            />
            <Label htmlFor="favorite" className="text-gray-300">
              Mark as favorite
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
