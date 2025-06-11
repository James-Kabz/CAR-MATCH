"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Car, MapPin, DollarSign, MessageCircle } from "lucide-react"
import { ContactSellerModal } from "@/components/modals/contact-seller-modal"

interface BuyerRequest {
  id: string
  minBudget: number
  maxBudget: number
  brand?: string
  model?: string
  carType?: string
  location: string
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
      name: string
      phone?: string
    }
  }
}

export function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("search")
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [searchForm, setSearchForm] = useState({
    minBudget: "",
    maxBudget: "",
    brand: "",
    model: "",
    carType: "",
    location: "",
  })

  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    listingId: string
    listingTitle: string
    sellerName: string
  }>({
    isOpen: false,
    listingId: "",
    listingTitle: "",
    sellerName: "",
  })

  useEffect(() => {
    fetchRequests()
    fetchMatches()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/buyer-requests")
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create buyer request
      const requestResponse = await fetch("/api/buyer-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchForm),
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
        }
      }
    } catch (error) {
      console.error("Error creating search:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
            Matches ({matches.length})
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minBudget">Minimum Budget</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    placeholder="10000"
                    value={searchForm.minBudget}
                    onChange={(e) => setSearchForm({ ...searchForm, minBudget: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxBudget">Maximum Budget</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    placeholder="50000"
                    value={searchForm.maxBudget}
                    onChange={(e) => setSearchForm({ ...searchForm, maxBudget: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="brand">Preferred Brand</Label>
                  <Input
                    id="brand"
                    placeholder="Toyota, Honda, etc."
                    value={searchForm.brand}
                    onChange={(e) => setSearchForm({ ...searchForm, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Preferred Model</Label>
                  <Input
                    id="model"
                    placeholder="Camry, Civic, etc."
                    value={searchForm.model}
                    onChange={(e) => setSearchForm({ ...searchForm, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="carType">Car Type</Label>
                  <Select onValueChange={(value) => setSearchForm({ ...searchForm, carType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={searchForm.location}
                  onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Searching..." : "Find Matches"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
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
                    <div>
                      <h3 className="text-lg font-semibold">{match.listing.title}</h3>
                      <p className="text-gray-600">
                        {match.listing.year} {match.listing.brand} {match.listing.model}
                      </p>
                    </div>
                    <Badge variant="secondary">{Math.round(match.score * 100)}% match</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />${match.listing.price.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {match.listing.location}
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
          {requests.length === 0 ? (
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
                        ${request.minBudget.toLocaleString()} - ${request.maxBudget.toLocaleString()}
                      </h3>
                      <p className="text-gray-600">
                        {request.brand && `${request.brand} `}
                        {request.model && `${request.model} `}
                        {request.carType && `(${request.carType})`}
                      </p>
                    </div>
                    <Badge variant="outline">{new Date(request.createdAt).toLocaleDateString()}</Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {request.location}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Trigger new match search for this request
                      fetch("/api/matches", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ requestId: request.id }),
                      }).then(() => fetchMatches())
                    }}
                  >
                    Refresh Matches
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
      />
    </div>
  )
}
