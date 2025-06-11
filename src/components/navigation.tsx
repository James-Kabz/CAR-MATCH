"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, MessageCircle, Heart } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()
  const isProduction =
    typeof window !== "undefined" && (process.env.NODE_ENV === "production" || window.location.hostname !== "localhost")

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CarMatch</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                    {isProduction && <span className="ml-1 text-xs text-blue-600">(Polling)</span>}
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                <Link href="/listings">
                  <Button variant="ghost" size="sm">
                    Browse Cars
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{session.user?.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{session.user?.role}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
