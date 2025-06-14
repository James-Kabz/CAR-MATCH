"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Filter, Car, MapPin, Eye } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ViewListingModal } from "@/components/modals/view-listing-modal"
import { Pagination } from "@/components/ui/pagination"
import { ImageSlider } from "@/components/ui/image-slider"

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

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ListingsPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  })

  const [filters, setFilters] = useState({
    search: "",
    brand: "all",
    carType: "all",
    condition: "all",
    minPrice: "",
    maxPrice: "",
    location: "",
  })

  // Debounce filters to avoid too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    fetchListings(1) // Reset to page 1 when filters change
  }, [debouncedFilters])

  useEffect(() => {
    fetchListings(pagination.page)
  }, [pagination.page])

  const fetchListings = async (page = 1) => {
    try {
      setIsLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      // Add filters to query params
      if (debouncedFilters.search) params.append("search", debouncedFilters.search)
      if (debouncedFilters.brand !== "all") params.append("brand", debouncedFilters.brand)
      if (debouncedFilters.carType !== "all") params.append("carType", debouncedFilters.carType)
      if (debouncedFilters.condition !== "all") params.append("condition", debouncedFilters.condition)
      if (debouncedFilters.minPrice) params.append("minPrice", debouncedFilters.minPrice)
      if (debouncedFilters.maxPrice) params.append("maxPrice", debouncedFilters.maxPrice)
      if (debouncedFilters.location) params.append("location", debouncedFilters.location)

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      setListings(data.listings || [])
      setPagination(
        data.pagination || {
          total: data.listings?.length || 0,
          page,
          limit: pagination.limit,
          totalPages: Math.ceil((data.listings?.length || 0) / pagination.limit),
        },
      )
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      brand: "all",
      carType: "all",
      condition: "all",
      minPrice: "",
      maxPrice: "",
      location: "",
    })
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleViewListing = async (listing: Listing) => {
    // Track the view
    try {
      await fetch(`/api/listings/${listing.id}/view`, {
        method: "POST",
      })
      // Update the local listing view count
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, views: l.views + 1 } : l)))
    } catch (error) {
      console.error("Error tracking view:", error)
    }

    setSelectedListing(listing)
  }

  if (isLoading && pagination.page === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg">Loading listings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Cars</h1>
          <p className="text-gray-600">Find your perfect car from our listings</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5" />
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search cars..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <Select value={filters.brand} onValueChange={(value) => setFilters({ ...filters, brand: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="Toyota">Toyota</SelectItem>
                  <SelectItem value="Honda">Honda</SelectItem>
                  <SelectItem value="BMW">BMW</SelectItem>
                  <SelectItem value="Mercedes">Mercedes</SelectItem>
                  <SelectItem value="Audi">Audi</SelectItem>
                  <SelectItem value="Ford">Ford</SelectItem>
                  <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                  <SelectItem value="Nissan">Nissan</SelectItem>
                  <SelectItem value="Mazda">Mazda</SelectItem>
                  <SelectItem value="Subaru">Subaru</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.carType} onValueChange={(value) => setFilters({ ...filters, carType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Car Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SEDAN">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                  <SelectItem value="COUPE">Coupe</SelectItem>
                  <SelectItem value="CONVERTIBLE">Convertible</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="WAGON">Wagon</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.condition} onValueChange={(value) => setFilters({ ...filters, condition: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input
                placeholder="Min Price (KES)"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <Input
                placeholder="Max Price (KES)"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
              <Input
                placeholder="Location (e.g., Nairobi, Mombasa)"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {pagination.total} car{pagination.total !== 1 ? "s" : ""} found
          </p>
          {isLoading && <div className="text-sm text-gray-500">Searching...</div>}
        </div>

        {listings.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {/* Image slider */}
                  <div onClick={() => handleViewListing(listing)}>
                    <ImageSlider images={listing.images} aspectRatio="video" showThumbnails={false} />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold line-clamp-1">{listing.title}</h3>
                      <Badge variant="outline">{listing.condition}</Badge>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {listing.year} {listing.brand} {listing.model}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="text-lg font-semibold text-green-600">
                            KES {listing.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="h-4 w-4 mr-1" />
                          {listing.views}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location}
                      </div>

                      {listing.mileage && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="h-4 w-4 mr-1" />
                          {listing.mileage.toLocaleString()} km
                        </div>
                      )}
                    </div>

                    <Button className="w-full" onClick={() => handleViewListing(listing)}>
                      View Details
                    </Button>
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

      {selectedListing && (
        <ViewListingModal
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          listing={selectedListing}
          showContactButton={session?.user?.id !== selectedListing.seller.id}
        />
      )}
    </div>
  )
}
