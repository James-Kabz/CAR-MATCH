
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Car, DollarSign, MessageCircle, ChevronDown } from "lucide-react"
import { ContactSellerModal } from "@/components/modals/contact-seller-modal"
import { NotificationPermission } from "@/components/notification-permission"
import { GlobalLoading, InlineLoading } from "@/components/ui/global-loading"
import { toast } from "sonner"

interface BuyerRequest {
  id: string
  minBudget: number
  maxBudget: number
  brand?: string
  model?: string
  carType?: string
  createdAt: string
}

interface Match {
  id: string
  score: number
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
      phone?: string
    }
  }
}

interface CarData {
  brands: string[]
  modelsByBrand: Record<string, string[]>
  carTypes: string[]
}

const BUDGET_RANGES = [
  { label: "0 - 500K", min: 0, max: 500000 },
  { label: "500K - 1M", min: 500000, max: 1000000 },
  { label: "1M - 2M", min: 1000000, max: 2000000 },
  { label: "2M - 3M", min: 2000000, max: 3000000 },
  { label: "3M - 5M", min: 3000000, max: 5000000 },
  { label: "5M - 10M", min: 5000000, max: 10000000 },
  { label: "Above 10M", min: 10000000, max: Infinity }
]

export function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("search")
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [isLoadingMatches, setIsLoadingMatches] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [carData, setCarData] = useState<CarData>({
    brands: [],
    modelsByBrand: {},
    carTypes: []
  })
  const [selectedBrand, setSelectedBrand] = useState("")

  const [searchForm, setSearchForm] = useState({
    budgetRange: "",
    brand: "",
    model: "",
    carType: "",
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
    fetchCarData()
    fetchRequests()
    fetchMatches()
  }, [])

  const fetchCarData = async () => {
    try {
      const response = await fetch("/api/car-data")
      const data = await response.json()
      setCarData(data)
    } catch (error) {
      console.error("Error fetching car data:", error)
      toast.error("Failed to load car data")
    }
  }

  const fetchRequests = async () => {
    try {
      setIsLoadingRequests(true)
      const response = await fetch("/api/buyer-requests")
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load search history")
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const fetchMatches = async () => {
    try {
      setIsLoadingMatches(true)
      const response = await fetch("/api/matches")
      const data = await response.json()
      setMatches(data.matches || [])
      if (data.matches?.length > 0) {
        toast.success(`Found ${data.matches.length} car matches`)
      }
    } catch (error) {
      toast.error("Failed to load car matches")
    } finally {
      setIsLoadingMatches(false)
    }
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    setSearchForm({
      ...searchForm,
      brand,
      model: "" // Reset model when brand changes
    })
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    try {
      toast.info("Searching for cars...", {
        description: "We're finding the best matches for you",
      })

      const selectedRange = BUDGET_RANGES.find(range => range.label === searchForm.budgetRange)
      if (!selectedRange) {
        toast.error("Please select a valid budget range")
        return
      }

      // Create buyer request
      const requestResponse = await fetch("/api/buyer-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchForm,
          minBudget: selectedRange.min,
          maxBudget: selectedRange.max
        }),
      })

      if (requestResponse.ok) {
        const { buyerRequest } = await requestResponse.json()

        // Find matches
        const matchResponse = await fetch("/api/matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId: buyerRequest.id }),
        })

        if (matchResponse.ok) {
          await fetchRequests()
          await fetchMatches()
          setActiveTab("matches")
          toast.success("Search completed!", {
            description: "Check your matches tab for results",
          })
        }
      }
    } catch (error) {
      toast.error("Search failed", {
        description: "Please try again or contact support",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefreshMatches = async (requestId: string) => {
    try {
      setIsLoading(true)
      toast.info("Refreshing matches...", {
        description: "Looking for new cars that match your criteria",
      })

      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        await fetchMatches()
        toast.success("Matches refreshed successfully")
      }
    } catch (error) {
      toast.error("Failed to refresh matches")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <NotificationPermission />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "search"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            New Search
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "matches"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Car className="h-4 w-4 inline mr-2" />
            Found Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Searches ({requests.length})
          </button>
        </nav>
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <Card>
          <CardHeader>
            <CardTitle>Find Your Perfect Car</CardTitle>
            <CardDescription>Tell us what you're looking for and we'll match you with the best options</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div>
                <Label>Budget Range (KES)</Label>
                <Select 
                  onValueChange={(value) => setSearchForm({ ...searchForm, budgetRange: value })}
                  value={searchForm.budgetRange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Brand</Label>
                  <Select onValueChange={handleBrandChange} value={searchForm.brand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {carData.brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Model</Label>
                  <Select
                    onValueChange={(value) => setSearchForm({ ...searchForm, model: value })}
                    value={searchForm.model}
                    disabled={!selectedBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBrand ? "Select model" : "Select brand first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBrand && carData.modelsByBrand[selectedBrand] ? (
                        carData.modelsByBrand[selectedBrand].map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 px-3 py-2">No models available</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Car Type</Label>
                <Select onValueChange={(value) => setSearchForm({ ...searchForm, carType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {carData.carTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isSearching}>
                {isSearching ? <InlineLoading message="Searching for cars..." /> : "Find Matches"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {isLoadingMatches ? (
            <GlobalLoading message="Loading your car matches..." size="lg" />
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600">Create a search to find matching cars</p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-4">
                      {/* Image preview */}
                      {match.listing.images.length > 0 ? (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={match.listing.images[0] || "/placeholder.svg"}
                            alt={match.listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="h-8 w-8 text-gray-400" />
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold">{match.listing.title}</h3>
                        <p className="text-gray-600">
                          {match.listing.year} {match.listing.brand} {match.listing.model}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{Math.round(match.score * 100)}% match</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      KES {match.listing.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Car className="h-4 w-4 mr-1" />
                      {match.listing.condition}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Seller: {match.listing.seller.name}</div>
                    <Button
                      size="sm"
                      onClick={() =>
                        setContactModal({
                          isOpen: true,
                          listingId: match.listing.id,
                          listingTitle: match.listing.title,
                          sellerName: match.listing.seller.name,
                          sellerId: match.listing.seller.id,
                        })
                      }
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Seller
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {isLoadingRequests ? (
            <GlobalLoading message="Loading your search history..." size="lg" />
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
                <p className="text-gray-600">Create your first search to get started</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        KES {request.minBudget.toLocaleString()} - KES {request.maxBudget.toLocaleString()}
                      </h3>
                      <p className="text-gray-600">
                        {request.brand && `${request.brand} `}
                        {request.model && `${request.model} `}
                        {request.carType && `(${request.carType})`}
                      </p>
                    </div>
                    <Badge variant="outline">{new Date(request.createdAt).toLocaleDateString()}</Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefreshMatches(request.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? <InlineLoading message="Refreshing..." size="sm" /> : "Refresh Matches"}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
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