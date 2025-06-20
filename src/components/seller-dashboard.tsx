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
import { EditListingModal } from "@/components/modals/edit-listing-modal"
import { RespondInquiryModal } from "@/components/modals/respond-inquiry-modal"
import { DeleteListingModal } from "@/components/modals/delete-listing-modal"
import { ImageUpload } from "@/components/image-upload"
import { Pagination } from "@/components/ui/pagination"
import { ImageSlider } from "@/components/ui/image-slider"
// import { GlobalLoading, InlineLoading } from "@/components/ui/global-loading"
import { toast } from "sonner"
import { notificationService } from "@/lib/notifications"
import Loading from "@/app/loading"
import { InlineLoading } from "./ui/global-loading"

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

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("listings")
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isCreatingListing, setIsCreatingListing] = useState(false)

  const [listingsPagination, setListingsPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  })
  const [inquiriesPagination, setInquiriesPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  })

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
    images: [] as string[],
  })

  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    listing: Listing | null
  }>({
    isOpen: false,
    listing: null,
  })

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    listingId: string
    listingTitle: string
  }>({
    isOpen: false,
    listingId: "",
    listingTitle: "",
  })

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean
    inquiryId: string
    buyerName: string
    inquiryMessage: string
  }>({
    isOpen: false,
    inquiryId: "",
    buyerName: "",
    inquiryMessage: "",
  })

  const [inquiries, setInquiries] = useState<any[]>([])
  const [lastInquiryCount, setLastInquiryCount] = useState(0)

  useEffect(() => {
    fetchListings(listingsPagination.page)
    fetchInquiries(inquiriesPagination.page)
  }, [listingsPagination.page, inquiriesPagination.page])

  // Check for new inquiries and show notifications
  useEffect(() => {
    if (inquiries.length > lastInquiryCount && lastInquiryCount > 0) {
      const newInquiries = inquiries.slice(0, inquiries.length - lastInquiryCount)
      newInquiries.forEach((inquiry) => {
        notificationService.showInquiryNotification(inquiry.buyer.name, inquiry.listing.title, () => {
          setActiveTab("inquiries")
          window.focus()
        })
      })
    }
    setLastInquiryCount(inquiries.length)
  }, [inquiries.length, lastInquiryCount])

  const fetchListings = async (page = 1) => {
    try {
      setIsLoadingListings(true)
      const response = await fetch(`/api/listings?sellerId=current&page=${page}&limit=${listingsPagination.limit}`)
      const data = await response.json()
      setListings(data.listings || [])
      setListingsPagination(
        data.pagination || {
          total: data.listings?.length || 0,
          page,
          limit: listingsPagination.limit,
          totalPages: Math.ceil((data.listings?.length || 0) / listingsPagination.limit),
        },
      )
      // toast.success("Listings loaded successfully")
    } catch (error) {
      console.error("Error fetching listings:", error)
      toast.error("Failed to load listings")
    } finally {
      setIsLoadingListings(false)
    }
  }

  const fetchInquiries = async (page = 1) => {
    try {
      setIsLoadingInquiries(true)
      const response = await fetch(`/api/inquiries?page=${page}&limit=${inquiriesPagination.limit}`)
      const data = await response.json()
      const newInquiries = data.inquiries || []
      setInquiries(newInquiries)
      setInquiriesPagination(
        data.pagination || {
          total: data.inquiries?.length || 0,
          page,
          limit: inquiriesPagination.limit,
          totalPages: Math.ceil((data.inquiries?.length || 0) / inquiriesPagination.limit),
        },
      )

      // Check for new inquiries and show in-app notifications
      if (inquiries.length > 0 && newInquiries.length > inquiries.length) {
        const newInquiryCount = newInquiries.length - inquiries.length
        toast.success(`${newInquiryCount} new inquiry${newInquiryCount > 1 ? "ies" : ""} received!`)
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
      toast.error("Failed to load inquiries")
    } finally {
      setIsLoadingInquiries(false)
    }
  }

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingListing(true)

    try {
      toast.info("Creating your listing...", {
        description: "Please wait while we process your car details",
      })

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(listingForm),
      })

      if (response.ok) {
        await fetchListings(1) // Reset to first page after adding
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
          images: [],
        })

        toast.success("Listing created successfully!", {
          description: "Your car is now visible to potential buyers",
        })

      } else {
        toast.error("Failed to create listing", {
          description: "Please check your details and try again",
        })
      }
    } catch (error) {
      console.error("Error creating listing:", error)
      toast.error("Something went wrong", {
        description: "Please try again or contact support",
      })
    } finally {
      setIsCreatingListing(false)
    }
  }

  const handleListingsPageChange = (page: number) => {
    setListingsPagination((prev) => ({ ...prev, page }))
    toast.info(`Loading page ${page}...`)
  }

  const handleInquiriesPageChange = (page: number) => {
    setInquiriesPagination((prev) => ({ ...prev, page }))
    toast.info(`Loading inquiries page ${page}...`)
  }

  return (
    <div className="space-y-6">

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("listings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "listings"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <Car className="h-4 w-4 inline mr-2" />
            My Listings ({listingsPagination.total})
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
                      placeholder="2020 Toyota Vitz - Excellent Condition"
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
                        placeholder="Vitz"
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
                      <Label htmlFor="price">Price (KES)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="1200000"
                        value={listingForm.price}
                        onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage (KM)</Label>
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="80000"
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
                      placeholder="Nairobi, Mombasa, Kisumu, etc."
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

                  <ImageUpload
                    images={listingForm.images}
                    onImagesChange={(images) => setListingForm({ ...listingForm, images })}
                    disabled={isCreatingListing}
                  />

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isCreatingListing}>
                      {isCreatingListing ? <InlineLoading
                        message="Creating listing..."
                        size="md"
                        className="text-blue-600"
                      /> : "Create Listing"}
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
            {isLoadingListings ? (
              <Loading
                message="Please wait..."
                className="bg-black/50" // semi-transparent black background
                spinnerClassName="text-blue-500 h-16 w-16" // purple spinner, larger size
                messageClassName="text-white text-xl" // white text, larger font
              />
            ) : listings.length === 0 ? (
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
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image slider */}
                      <div className="w-full md:w-1/3">
                        <ImageSlider images={listing.images} aspectRatio="square" showThumbnails={false} />
                      </div>

                      <div className="w-full md:w-2/3">
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
                            <DollarSign className="h-4 w-4 mr-1" />
                            KES {listing.price.toLocaleString()}
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
                            {listing.mileage && `${listing.mileage.toLocaleString()} km`}
                          </div>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setEditModal({
                                  isOpen: true,
                                  listing,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  listingId: listing.id,
                                  listingTitle: listing.title,
                                })
                              }
                            >
                              Delete
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View Inquiries ({inquiries.filter((inq) => inq.listing.id === listing.id).length})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Pagination for listings */}
            {listingsPagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={listingsPagination.page}
                  totalPages={listingsPagination.totalPages}
                  onPageChange={handleListingsPageChange}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inquiries Tab */}
      {/* {activeTab === "inquiries" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Buyer Inquiries</h2>
          {isLoadingInquiries ? (
            <GlobalLoading message="Loading buyer inquiries..." size="lg" />
          ) : inquiries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600">
                  When buyers are interested in your cars, their messages will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{inquiry.listing.title}</h3>
                        <p className="text-gray-600">From: {inquiry.buyer.name}</p>
                      </div>
                      <Badge variant={inquiry.status === "PENDING" ? "destructive" : "default"}>{inquiry.status}</Badge>
                    </div>

                    <p className="text-gray-700 mb-4">{inquiry.message}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                      {inquiry.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setRespondModal({
                              isOpen: true,
                              inquiryId: inquiry.id,
                              buyerName: inquiry.buyer.name,
                              inquiryMessage: inquiry.message,
                            })
                          }
                        >
                          Respond
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination for inquiries */}
      {/* {inquiriesPagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={inquiriesPagination.page}
                    totalPages={inquiriesPagination.totalPages}
                    onPageChange={handleInquiriesPageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}  */}

      <EditListingModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, listing: null })}
        listing={editModal.listing!}
        onUpdate={() => fetchListings(listingsPagination.page)}
      />

      <RespondInquiryModal
        isOpen={respondModal.isOpen}
        onClose={() => setRespondModal({ ...respondModal, isOpen: false })}
        inquiryId={respondModal.inquiryId}
        buyerName={respondModal.buyerName}
        inquiryMessage={respondModal.inquiryMessage}
      />

      <DeleteListingModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, listingId: "", listingTitle: "" })}
        listingId={deleteModal.listingId}
        listingTitle={deleteModal.listingTitle}
        onDelete={() => fetchListings()}
      />
    </div>
  )
}
