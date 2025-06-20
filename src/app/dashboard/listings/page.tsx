"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Filter, Car, MapPin, Eye, SearchCodeIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ViewListingModal } from "@/components/modals/view-listing-modal"
import { Pagination } from "@/components/ui/pagination"
import { ImageSlider } from "@/components/ui/image-slider"
import { toast } from "sonner"
import Loading from "../loading"

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

const BUDGET_RANGES = [
  { label: "0 - 500K", min: 0, max: 500000 },
  { label: "500K - 1M", min: 500000, max: 1000000 },
  { label: "1M - 2M", min: 1000000, max: 2000000 },
  { label: "2M - 3M", min: 2000000, max: 3000000 },
  { label: "3M - 5M", min: 3000000, max: 5000000 },
  { label: "5M - 10M", min: 5000000, max: 10000000 },
  { label: "Above 10M", min: 10000000, max: Infinity },
]

const YEAR_RANGES = [
  { label: "2010 - 2015", min: 2010, max: 2015 },
  { label: "2016 - 2020", min: 2016, max: 2020 },
  { label: "2021 - 2025", min: 2021, max: 2025 },
  { label: "2026 - 2030", min: 2026, max: 2030 },
  // { label: "2031 - 2035", min: 2031, max: 2035 },
  // { label: "2036 - 2040", min: 2036, max: 2040 },
  // { label: "2041 - 2045", min: 2041, max: 2045 },
  // { label: "2046 - 2050", min: 2046, max: 2050 },
]

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
    budgetRangeIndex: "all",
    yearRangeIndex: "all",
    location: "",
  })

  // Debounce filters to avoid too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(prev => ({
        ...prev,
        brand: filters.brand,
        carType: filters.carType,
        condition: filters.condition,
        budgetRangeIndex: filters.budgetRangeIndex,
        yearRangeIndex: filters.yearRangeIndex,
        location: filters.location,
      }))
    }, 500)

    return () => clearTimeout(timer)
  }, [
    filters.brand,
    filters.carType,
    filters.condition,
    filters.budgetRangeIndex,
    filters.yearRangeIndex,
    filters.location,
  ])


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
      if (debouncedFilters.budgetRangeIndex !== "all") {
        const range = BUDGET_RANGES[Number(debouncedFilters.budgetRangeIndex)]
        if (range.min !== undefined) params.append("minPrice", range.min.toString())
        if (range.max !== Infinity) params.append("maxPrice", range.max.toString())
      }
      if (debouncedFilters.yearRangeIndex !== "all") {
        const yearRange = YEAR_RANGES[Number(debouncedFilters.yearRangeIndex)]
        if (yearRange.min !== undefined) params.append("minYear", yearRange.min.toString())
        if (yearRange.max !== undefined) params.append("maxYear", yearRange.max.toString())
      }
      if (debouncedFilters.location && debouncedFilters.location !== "all") {
        params.append("location", debouncedFilters.location)
      }

      const response = await fetch(`/api/listings?${params.toString()}`)
      const data = await response.json()

      setListings(data.listings || [])
      setUniqueLocations(data.uniqueLocations || [])
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
      toast.error("Failed to load listings")
    } finally {
      setIsLoading(false)
    }
  }


  const handleSearchClick = () => {
    setDebouncedFilters(prev => ({
      ...prev,
      search: filters.search.toLowerCase(),
    }))
    fetchListings(1) // reset to page 1 on new search
  }


  const clearFilters = () => {
    setFilters({
      search: "",
      brand: "all",
      carType: "all",
      condition: "all",
      budgetRangeIndex: "all",
      yearRangeIndex: "all",
      location: "all",
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
      toast.error("Failed to track view")
    }

    setSelectedListing(listing)
  }

  if (isLoading) {
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

  return (
    <div className="bg-background text-foreground">

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Cars</h1>
          <p>Find your perfect car from our listings</p>
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
              <div className="flex gap-2">
                <Input
                  placeholder="Search cars..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchClick()} // Optional: support Enter key
                />
                <Button onClick={handleSearchClick}>
                  <SearchCodeIcon />
                </Button>
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
              <Select
                value={filters.budgetRangeIndex}
                onValueChange={(value) => setFilters({ ...filters, budgetRangeIndex: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  {BUDGET_RANGES.map((range, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* year filter */}
              <Select
                value={filters.yearRangeIndex}
                onValueChange={(value) => setFilters({ ...filters, yearRangeIndex: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year Range">
                    {YEAR_RANGES[Number(filters.yearRangeIndex)]?.label ?? "Select Year Range"}
                  </SelectValue>

                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {YEAR_RANGES.map((range, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.location}
                onValueChange={(value) => setFilters({ ...filters, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location, index) => (
                    <SelectItem key={index} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p>
            {pagination.total} car{pagination.total !== 1 ? "s" : ""} found
          </p>
          {isLoading && <div className="text-sm">Searching...</div>}
        </div>

        {listings.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium ">No cars found</h3>
              <p >Try adjusting your filters to see more results</p>
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

                    <p className=" mb-3">
                      {listing.year} {listing.brand} {listing.model}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm ">
                          <span className="text-lg font-semibold text-green-600">
                            KES {listing.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm ">
                          <Eye className="h-4 w-4 mr-1" />
                          {listing.views}
                        </div>
                      </div>

                      <div className="flex items-center text-sm ">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location}
                      </div>

                      {listing.mileage && (
                        <div className="flex items-center text-sm ">
                          <Car className="h-4 w-4 mr-1" />
                          {listing.mileage.toLocaleString()} km
                        </div>
                      )}
                    </div>

                    <Button variant="default" className="w-full" onClick={() => handleViewListing(listing)}>
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
