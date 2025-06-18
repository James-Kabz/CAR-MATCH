"use client"

import { Fragment, useEffect, useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, MessageCircle, Heart, Settings, Home } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const mainNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Browse Cars", href: "/listings", icon: Car },
]

const userNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Messages", href: "/chat", icon: MessageCircle },
  { name: "Favorites", href: "/favorites", icon: Heart },
]

const sellerNavigation = [
  { name: "Enquiries", href: "/enquiries", icon: MessageCircle },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isProduction =
    typeof window !== "undefined" && (process.env.NODE_ENV === "production" || window.location.hostname !== "localhost")

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname?.startsWith(href))
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="-ml-2 mr-2 flex items-center md:hidden">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col h-full">
                    {/* Mobile menu content */}
                    <div className="space-y-1 px-2 pb-3 pt-6">
                      {mainNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={classNames(
                            isActive(item.href) ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                            "block px-3 py-2 rounded-md text-base font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-5 w-5" />}
                            {item.name}
                          </div>
                        </Link>
                      ))}
                      {session && (
                        <>
                          {userNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={closeMobileMenu}
                              className={classNames(
                                isActive(item.href) ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                                "block px-3 py-2 rounded-md text-base font-medium"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {item.icon && <item.icon className="h-5 w-5" />}
                                {item.name}
                                {item.name === "Messages" && isProduction && (
                                  <span className="ml-1 text-xs text-blue-600">(Polling)</span>
                                )}
                              </div>
                            </Link>
                          ))}
                          {session.user?.role === "SELLER" &&
                            sellerNavigation.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={classNames(
                                  isActive(item.href) ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                                  "block px-3 py-2 rounded-md text-base font-medium"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {item.icon && <item.icon className="h-5 w-5" />}
                                  {item.name}
                                </div>
                              </Link>
                            ))}
                        </>
                      )}
                    </div>

                    {/* Mobile user section */}
                    {session ? (
                      <div className="border-t border-gray-200 pb-3 pt-4 mt-auto">
                        <div className="flex items-center px-5 sm:px-6">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={session.user?.image || "https://images.unsplash.com/photo-1472099173936-5203891eb81f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                              alt=""
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">{session.user?.name}</div>
                            <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 px-2 sm:px-3">
                          <Link
                            href="/profile"
                            onClick={closeMobileMenu}
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Your Profile
                            </div>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={closeMobileMenu}
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <Settings className="h-5 w-5" />
                              Settings
                            </div>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <div className="flex items-center gap-2">
                                  <LogOut className="h-5 w-5" />
                                  Sign out
                                </div>
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll need to sign in again to access your account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => signOut()}>Sign Out</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-gray-200 pb-3 pt-4 px-4 space-y-2 mt-auto">
                        <Button asChild variant="ghost" className="w-full" onClick={closeMobileMenu}>
                          <Link href="/signin">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full" onClick={closeMobileMenu}>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">CarMatch</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    isActive(item.href)
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              ))}
              {session && (
                <>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isActive(item.href)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                        "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                      {item.name === "Messages" && isProduction && (
                        <span className="ml-1 text-xs text-blue-600">(Polling)</span>
                      )}
                    </Link>
                  ))}
                  {session.user?.role === "SELLER" &&
                    sellerNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive(item.href)
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                          "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.name}
                      </Link>
                    ))}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{session.user?.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {session.user?.role}
                  </span>
                </div>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user?.image || "https://files.softicons.com/download/internet-icons/user-icons-by-2shi/ico/user4.ico"}
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Your Profile
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Settings
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100"
                                )}
                              >
                                <LogOut className="h-4 w-4" />
                                Sign out
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll need to sign in again to access your account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => signOut()}>Sign Out</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="hidden md:flex">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}