"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SellerDashboard } from "@/components/seller-dashboard"
import { GlobalLoading } from "@/components/ui/global-loading"
import ListingsPage from "./listings/page"
import Loading from "../loading"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  if (!session) {
    return null
  }

  return (
    <div className="bg-background text-foreground">
      <div className="text-center mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
          <p className="text-muted-foreground">
            {session.user?.role === "BUYER"
              ? "Find your perfect car match...Here is some analytics data"
              : "Manage your listings and connect with buyers...Here is some analytics data"}
          </p>
        </div>

        {/* {session.user?.role === "SELLER" ?<SellerDashboard /> : <SellerDashboard />} */}
      </div>
    </div>
  )
}
