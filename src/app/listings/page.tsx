"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Filter, Car, MapPin, DollarSign, Eye } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ViewListingModal } from "@/components/modals/view-listing-modal"

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
  isActive: boolean
  seller: {
    id: string
    name: string
    email: string
    phone?: string
    location?: string
  }
}

export default function ListingsPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const [filters, setFilters] = useState({
    search: "",
    brand: "all",
    carType: "all",
    condition: "all",
    minPrice: "",
    maxPrice: "",
    location: "",
  })

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [listings, filters])

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/listings")
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = listings.filter((listing) => listing.isActive)

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchLower) ||
          listing.brand.toLowerCase().includes(searchLower) ||
          listing.model.toLowerCase().includes(searchLower),
      )
    }

    if (filters.brand !== "all") {
      filtered = filtered.filter((listing) => listing.brand === filters.brand)
    }

    if (filters.carType !== "all") {
      filtered = filtered.filter((listing) => listing.carType === filters.carType)
    }

    if (filters.condition !== "all") {
      filtered = filtered.filter((listing) => listing.condition === filters.condition)
    }

    if (filters.minPrice) {
      filtered = filtered.filter((listing) => listing.price >= Number.parseInt(filters.minPrice))
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((listing) => listing.price <= Number.parseInt(filters.maxPrice))
    }

    if (filters.location) {
      filtered = filtered.filter((listing) => listing.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    setFilteredListings(filtered)
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

  if (isLoading) {
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
                placeholder="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <Input
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredListings.length} car{filteredListings.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {/* Image placeholder */}
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Car className="h-12 w-12 text-gray-400" />
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
                          <DollarSign className="h-4 w-4 mr-1" />${listing.price.toLocaleString()}
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
                          {listing.mileage.toLocaleString()} miles
                        </div>
                      )}
                    </div>

                    <Button className="w-full" onClick={() => setSelectedListing(listing)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
