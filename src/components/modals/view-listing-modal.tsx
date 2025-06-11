"use client"

import { useState } from "react"
import { MapPin, Car, Calendar, Eye, Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ContactSellerModal } from "./contact-seller-modal"
import { addInAppNotification } from "@/components/in-app-notifications"

interface Listing {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  condition: string
  carType: string
  mileage?: number
  description?: string
  location: string
  images: string[]
  views: number
  createdAt: string
  seller: {
    id: string
    name: string
    email: string
    phone?: string
    location?: string
  }
}

interface ViewListingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: Listing
  showContactButton?: boolean
}

export function ViewListingModal({ isOpen, onClose, listing, showContactButton = true }: ViewListingModalProps) {
  const [contactModal, setContactModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAddingFavorite, setIsAddingFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleAddToFavorites = async () => {
    setIsAddingFavorite(true)
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listing.id }),
      })

      if (response.ok) {
        setIsFavorited(true)
        addInAppNotification({
          type: "success",
          title: "Added to Favorites",
          message: `${listing.title} has been added to your favorites`,
        })
      } else {
        const data = await response.json()
        addInAppNotification({
          type: "error",
          title: "Failed to Add Favorite",
          message: data.error || "Could not add to favorites",
        })
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
      addInAppNotification({
        type: "error",
        title: "Error",
        message: "An error occurred while adding to favorites",
      })
    } finally {
      setIsAddingFavorite(false)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{listing.title}</DialogTitle>
            <DialogDescription>
              {listing.year} {listing.brand} {listing.model}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image carousel */}
            <div className="relative">
              {listing.images.length > 0 ? (
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={listing.images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                    }}
                  />

                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Image indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {listing.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>

                      {/* Image counter */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                        {currentImageIndex + 1} / {listing.images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Car className="h-16 w-16 text-gray-400" />
                  <span className="ml-2 text-gray-500">No images available</span>
                </div>
              )}

              {/* Thumbnail strip */}
              {listing.images.length > 1 && (
                <div className="flex space-x-2 mt-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentImageIndex ? "border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price and key details */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold text-green-600">${listing.price.toLocaleString()}</div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{listing.condition}</Badge>
                <Badge variant="secondary">{listing.carType}</Badge>
              </div>
            </div>

            <Separator />

            {/* Vehicle details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Brand</div>
                <div className="font-medium">{listing.brand}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Model</div>
                <div className="font-medium">{listing.model}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Year</div>
                <div className="font-medium">{listing.year}</div>
              </div>
              {listing.mileage && (
                <div>
                  <div className="text-sm text-gray-500">Mileage</div>
                  <div className="font-medium">{listing.mileage.toLocaleString()} miles</div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Seller information */}
            <div>
              <h3 className="font-medium mb-2">Seller Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">{listing.seller.name}</div>
                <div className="text-sm text-gray-600">{listing.seller.email}</div>
                {listing.seller.phone && <div className="text-sm text-gray-600">{listing.seller.phone}</div>}
                {listing.seller.location && (
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.seller.location}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {showContactButton && (
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setContactModal(true)} className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" onClick={handleAddToFavorites} disabled={isAddingFavorite || isFavorited}>
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ContactSellerModal
        isOpen={contactModal}
        onClose={() => setContactModal(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        sellerName={listing.seller.name}
      />
    </>
  )
}
