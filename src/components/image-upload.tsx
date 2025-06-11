"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { addInAppNotification } from "@/components/in-app-notifications"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      addInAppNotification({
        type: "error",
        title: "Too Many Images",
        message: `You can only upload up to ${maxImages} images`,
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`)
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`)
        }

        // Convert to base64
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result)
          }
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
          reader.readAsDataURL(file)
        })
      })

      const newImages = await Promise.all(uploadPromises)
      onImagesChange([...images, ...newImages])

      addInAppNotification({
        type: "success",
        title: "Images Uploaded",
        message: `Successfully uploaded ${newImages.length} image${newImages.length > 1 ? "s" : ""}`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      addInAppNotification({
        type: "error",
        title: "Upload Failed",
        message: error instanceof Error ? error.message : "Failed to upload images",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)

    addInAppNotification({
      type: "success",
      title: "Image Removed",
      message: "Image has been removed from your listing",
    })
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Images ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {images.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center mb-4">No images uploaded yet</p>
            <p className="text-sm text-gray-500 text-center mb-4">Drag and drop images here or click to browse</p>
            <Button type="button" variant="outline" onClick={triggerFileSelect} disabled={disabled || isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", image.substring(0, 50))
                    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add more button */}
          {images.length < maxImages && (
            <div
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={triggerFileSelect}
            >
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add More</p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Upload up to {maxImages} images. Supported formats: JPG, PNG, GIF. Maximum size: 5MB per image.
      </p>
    </div>
  )
}
