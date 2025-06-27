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
    <div className="min-h-screen bg-background text-foreground mx-auto">
      <div className="mx-auto py-4 px-4 sm:py-10 sm:px-6 lg:px-20">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Enquiries</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage enquiries from potential buyers</p>
        </div>

        {enquiries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No enquiries yet</h3>
              <p className="text-sm sm:text-base text-gray-600">
                When buyers contact you about your listings, they'll appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id} className="w-full">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex space-x-3 sm:space-x-4">
                      {/* Car image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background rounded-lg overflow-hidden flex-shrink-0">
                        {enquiry.listing.images.length > 0 ? (
                          <img
                            src={enquiry.listing.images[0] || "/placeholder.svg"}
                            alt={enquiry.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate text-wrap">
                          {enquiry.listing.title}
                        </CardTitle>
                        <p className="text-sm sm:text-base text-gray-600 truncate col-auto">
                          {enquiry.listing.year} {enquiry.listing.brand} {enquiry.listing.model}
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-green-600 mt-1">
                          KES {enquiry.listing.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-start sm:items-center gap-2 sm:gap-2">
                      <Badge className={`text-xs sm:text-sm ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </Badge>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Buyer information */}
                    <div className="bg-secondary p-3 sm:p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center text-sm sm:text-base">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Buyer Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm">
                        <div className="flex items-center truncate">
                          <User className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{enquiry.buyer.name}</span>
                        </div>
                        <div className="flex items-center truncate">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{enquiry.buyer.email}</span>
                        </div>
                        {enquiry.buyer.phone && (
                          <div className="flex items-center truncate">
                            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{enquiry.buyer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Message</h4>
                      <p className="bg-secondary p-2 sm:p-3 rounded border text-sm sm:text-base">
                        {enquiry.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button
                        variant={"default"}
                        onClick={() => setSelectedEnquiry(enquiry)}
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {enquiry.status === "PENDING" ? "Respond" : "View Response"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 sm:mt-8 col-span-full">
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