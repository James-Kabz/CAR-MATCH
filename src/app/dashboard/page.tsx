"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navigation } from "../../components/navigation"
import { BuyerDashboard } from "../../components/buyer-dashboard"
import { SellerDashboard } from "../../components/seller-dashboard"
``

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name}!</h1>
          <p className="text-gray-600">
            {session.user?.role === "BUYER"
              ? "Find your perfect car match"
              : "Manage your listings and connect with buyers"}
          </p>
        </div>

        {session.user?.role === "BUYER" ? <BuyerDashboard /> : <SellerDashboard />}
      </div>
    </div>
  )
}
