"use client"

import { useState } from "react"
import { MapPin, Calendar, Eye, Heart, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ContactSellerModal } from "./contact-seller-modal"
import { ImageSlider } from "@/components/ui/image-slider"
import { toast } from "sonner"

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
        toast.success("Added to favorites successfully")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add to favorites")
      }
    } catch (error) {
      console.error("Error adding to favorites:", error)
      toast.error("Failed to add to favorites")
    } finally {
      setIsAddingFavorite(false)
    }
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
            {/* Image slider */}
            <ImageSlider images={listing.images} aspectRatio="video" showThumbnails={true} showCounter={true} />

            {/* Price and key details */}
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold text-green-600">KES {listing.price.toLocaleString()}</div>
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
                  <div className="font-medium">{listing.mileage.toLocaleString()} km</div>
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
        sellerId={listing.seller.id}
      />
    </>
  )
}
