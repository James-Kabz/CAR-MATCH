import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, MessageCircle, Search } from "lucide-react"
import { Navigation } from "../components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Perfect Car Match</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Connect buyers and sellers efficiently with our intelligent matching platform
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link href="/listings">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Browse Cars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How CarMatch Works</h2>
            <p className="text-xl text-gray-600">Simple, efficient, and intelligent car buying and selling</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our algorithm matches buyers with sellers based on preferences, budget, and location
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Car className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Quality Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Detailed car listings with photos, specifications, and seller information
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Direct Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in chat system for seamless communication between buyers and sellers
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Verified Users</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Secure authentication and user verification for trusted transactions</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of satisfied buyers and sellers on CarMatch</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Start Matching Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
