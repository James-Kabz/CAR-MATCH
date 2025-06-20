"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageCircle, Car, Calendar, Phone, Mail, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { RespondInquiryModal } from "@/components/modals/respond-inquiry-modal"
import { GlobalLoading } from "@/components/ui/global-loading"
import { toast } from "sonner"
import Loading from "../loading"

interface Enquiry {
  id: string
  message: string
  status: string
  createdAt: string
  buyer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  listing: {
    id: string
    title: string
    brand: string
    model: string
    year: number
    price: number
    images: string[]
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function EnquiriesPage() {
  const { data: session } = useSession()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  useEffect(() => {
    if (session?.user) {
      fetchEnquiries(pagination.page)
    }
  }, [session, pagination.page])

  const fetchEnquiries = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/enquiries?page=${page}&limit=${pagination.limit}`)
      const data = await response.json()
      setEnquiries(data.enquiries || [])
      setPagination(
        data.pagination || {
          total: 0,
          page,
          limit: pagination.limit,
          totalPages: 1,
        },
      )
    } catch (error) {
      console.error("Error fetching enquiries:", error)
      toast.error("Failed to load enquiries")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "RESPONDED":
        return "bg-blue-100 text-blue-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading && pagination.page === 1) {
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
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Enquiries</h1>
          <p className="text-gray-600">Manage enquiries from potential buyers</p>
        </div>

        {enquiries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries yet</h3>
              <p className="text-gray-600">When buyers contact you about your listings, they'll appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      {/* Car image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {enquiry.listing.images.length > 0 ? (
                          <img
                            src={enquiry.listing.images[0] || "/placeholder.svg"}
                            alt={enquiry.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div>
                        <CardTitle className="text-lg">{enquiry.listing.title}</CardTitle>
                        <p className="text-gray-600">
                          {enquiry.listing.year} {enquiry.listing.brand} {enquiry.listing.model}
                        </p>
                        <p className="text-lg font-semibold text-green-600 mt-1">
                          KES {enquiry.listing.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(enquiry.status)}>{enquiry.status}</Badge>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Buyer information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Buyer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1 text-gray-400" />
                          {enquiry.buyer.name}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {enquiry.buyer.email}
                        </div>
                        {enquiry.buyer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {enquiry.buyer.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="font-medium mb-2">Message</h4>
                      <p className="text-gray-700 bg-white p-3 rounded border">{enquiry.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button onClick={() => setSelectedEnquiry(enquiry)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {enquiry.status === "PENDING" ? "Respond" : "View Response"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

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
        )}
      </div>

      {selectedEnquiry && (
        <RespondInquiryModal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          inquiryId={selectedEnquiry.id}
          buyerName={selectedEnquiry.buyer.name}
          inquiryMessage={selectedEnquiry.message}
          onRespond={() => {
            setSelectedEnquiry(null)
            fetchEnquiries(pagination.page)
          }}
        />
      )}
    </div>
  )
}
