"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname?.startsWith(href))
  }

  return (
    <nav className="bg-background text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">CarMatch</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-1 text-sm font-medium hover:text-primary",
                  isActive("/") ? "text-primary" : "text-foreground"
                )}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/listings"
                className={cn(
                  "flex items-center gap-1 text-sm font-medium hover:text-primary",
                  isActive("/listings") ? "text-primary" : "text-foreground"
                )}
              >
                <Car className="h-4 w-4" />
                Browse Cars
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link href="/signin" className="text-foreground hover:text-primary">
                Sign In
              </Link>
            </Button>
            <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}