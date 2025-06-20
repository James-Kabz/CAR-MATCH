"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Heart, MapPin, DollarSign, Car, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContactSellerModal } from "@/components/modals/contact-seller-modal"
import { Pagination } from "@/components/ui/pagination"
import { ImageSlider } from "@/components/ui/image-slider"
import { GlobalLoading } from "@/components/ui/global-loading"
import { toast } from "sonner"
import Loading from "../loading"

interface Favorite {
  id: string
  listing: {
    id: string
    title: string
    brand: string
    model: string
    year: number
    price: number
    condition: string
    carType: string
    location: string
    images: string[]
    seller: {
      id: string
      name: string
    }
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    listingId: string
    listingTitle: string
    sellerName: string
    sellerId: string
  }>({
    isOpen: false,
    listingId: "",
    listingTitle: "",
    sellerName: "",
    sellerId: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchFavorites(pagination.page)
    }
  }, [session, pagination.page])

  const fetchFavorites = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/favorites?page=${page}&limit=${pagination.limit}`)
      const data = await response.json()
      setFavorites(data.favorites || [])
      setPagination(
        data.pagination || {
          total: data.favorites?.length || 0,
          page,
          limit: pagination.limit,
          totalPages: Math.ceil((data.favorites?.length || 0) / pagination.limit),
        },
      )
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.id !== favoriteId))
        // Update pagination if needed
        if (favorites.length === 1 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
        } else {
          toast.success("Favorite removed successfully")
          fetchFavorites(pagination.page)
        }
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove favorite")
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loading
          message="Please wait..."
          className="bg-gray/50"
          spinnerClassName="text-blue-600 h-16 w-16"
          messageClassName="text-xl"
        />
      </div>
    )

  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold ">My Favorites</h1>
          <p className="text-muted-foreground">Cars you've saved for later</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">Start browsing cars and save your favorites here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Image slider */}
                  <div className="p-4 pb-0">
                    <ImageSlider images={favorite.listing.images} aspectRatio="video" showThumbnails={false} />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{favorite.listing.title}</h3>
                        <p className="text-muted-foreground">
                          {favorite.listing.year} {favorite.listing.brand} {favorite.listing.model}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFavorite(favorite.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />${favorite.listing.price.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {favorite.listing.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Car className="h-4 w-4 mr-1" />
                        {favorite.listing.carType}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{favorite.listing.condition}</Badge>
                      <Button
                        size="sm"
                        onClick={() =>
                          setContactModal({
                            isOpen: true,
                            listingId: favorite.listing.id,
                            listingTitle: favorite.listing.title,
                            sellerName: favorite.listing.seller.name,
                            sellerId: favorite.listing.seller.id,
                          })
                        }
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <ContactSellerModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ ...contactModal, isOpen: false })}
        listingId={contactModal.listingId}
        listingTitle={contactModal.listingTitle}
        sellerName={contactModal.sellerName}
        sellerId={contactModal.sellerId}
      />
    </div>
  )
}
