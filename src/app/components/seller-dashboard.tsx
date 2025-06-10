"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Car, DollarSign, MapPin, Calendar, MessageCircle } from "lucide-react"

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
  isActive: boolean
  createdAt: string
}

export function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("listings")
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const [listingForm, setListingForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    price: "",
    condition: "",
    carType: "",
    mileage: "",
    description: "",
    location: "",
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/listings")
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error("Error fetching listings:", error)
    }
  }

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingForm),
      })

      if (response.ok) {
        await fetchListings()
        setShowAddForm(false)
        setListingForm({
          title: "",
          brand: "",
          model: "",
          year: "",
          price: "",
          condition: "",
          carType: "",
          mileage: "",
          description: "",
          location: "",
        })
      }
    } catch (error) {
      console.error("Error creating listing:", error)
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
            onClick={() => setActiveTab("listings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "listings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Car className="h-4 w-4 inline mr-2" />
            My Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "inquiries"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Buyer Inquiries
          </button>
        </nav>
      </div>

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Listings</h2>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </div>

          {/* Add Listing Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Listing</CardTitle>
                <CardDescription>Add details about your car to attract potential buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleListingSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Listing Title</Label>
                    <Input
                      id="title"
                      placeholder="2020 Toyota Camry - Excellent Condition"
                      value={listingForm.title}
                      onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="Toyota"
                        value={listingForm.brand}
                        onChange={(e) => setListingForm({ ...listingForm, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        placeholder="Camry"
                        value={listingForm.model}
                        onChange={(e) => setListingForm({ ...listingForm, model: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2020"
                        value={listingForm.year}
                        onChange={(e) => setListingForm({ ...listingForm, year: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="25000"
                        value={listingForm.price}
                        onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage</Label>
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="50000"
                        value={listingForm.mileage}
                        onChange={(e) => setListingForm({ ...listingForm, mileage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select onValueChange={(value) => setListingForm({ ...listingForm, condition: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="EXCELLENT">Excellent</SelectItem>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="FAIR">Fair</SelectItem>
                          <SelectItem value="POOR">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carType">Car Type</Label>
                      <Select onValueChange={(value) => setListingForm({ ...listingForm, carType: value })}>
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
                      value={listingForm.location}
                      onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your car's features, maintenance history, etc."
                      value={listingForm.description}
                      onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Listing"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Listings Grid */}
          <div className="space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                  <p className="text-gray-600">Create your first listing to start selling</p>
                </CardContent>
              </Card>
            ) : (
              listings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{listing.title}</h3>
                        <p className="text-gray-600">
                          {listing.year} {listing.brand} {listing.model}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={listing.isActive ? "default" : "secondary"}>
                          {listing.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{listing.condition}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />${listing.price.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="h-4 w-4 mr-1" />
                        {listing.carType}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {listing.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {listing.mileage && `${listing.mileage.toLocaleString()} miles`}
                      </div>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View Inquiries
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Buyer Inquiries</h2>
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
              <p className="text-gray-600">When buyers are interested in your cars, their messages will appear here</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
