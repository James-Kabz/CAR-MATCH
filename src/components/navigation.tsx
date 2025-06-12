"use client"

import { Fragment } from "react"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, MessageCircle, Heart } from "lucide-react"
import { InAppNotifications } from "@/components/in-app-notifications"

const navigation = [{ name: "Home", href: "/", current: true }]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ")
}

export function Navigation() {
  const { data: session } = useSession()
  const isProduction =
    typeof window !== "undefined" && (process.env.NODE_ENV === "production" || window.location.hostname !== "localhost")

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="-ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <Car className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-900">CarMatch</span>
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                        "px-3 py-2 rounded-md text-sm font-medium",
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {session && (
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
                      {session.user?.role === "SELLER" && (
                        <Link href="/enquiries">
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Enquiries
                          </Button>
                        </Link>
                      )}
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
                    
                    <InAppNotifications />

                    <Button variant="ghost" size="sm" onClick={() => signOut()} className="hidden md:flex">
                      <LogOut className="h-4 w-4" />
                    </Button>

                    {/* Mobile menu profile dropdown */}
                    <Menu as="div" className="relative ml-3 md:hidden">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={session.user?.image || "https://images.unsplash.com/photo-1472099173936-5203891eb81f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
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
                              <a
                                href="#"
                                className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}
                              >
                                Your Profile
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}
                              >
                                Settings
                              </a>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                onClick={() => signOut()}
                                className={classNames(active ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" size="sm" className="hidden md:flex">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="hidden md:flex">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    "block px-3 py-2 rounded-md text-base font-medium",
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {session && (
                <>
                  <Disclosure.Button
                    as={Link}
                    href="/dashboard"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/chat"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Messages
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/favorites"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Favorites
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/listings"
                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Browse Cars
                  </Disclosure.Button>
                  {session.user?.role === "SELLER" && (
                    <Disclosure.Button
                      as={Link}
                      href="/enquiries"
                      className="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                    >
                      Enquiries
                    </Disclosure.Button>
                  )}
                </>
              )}
            </div>
            {session ? (
              <div className="border-t border-gray-200 pb-3 pt-4">
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
                  <button
                    type="button"
                    className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1 px-2 sm:px-3">
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Settings
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    onClick={() => signOut()}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pb-3 pt-4 px-4 space-y-2">
                <Disclosure.Button
                  as={Link}
                  href="/signin"
                  className="w-full block text-center rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Sign In
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  href="/signup"
                  className="w-full block text-center rounded-md px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign Up
                </Disclosure.Button>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}