"use client"

import { Fragment, Suspense, useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import { Bars3Icon } from "@heroicons/react/24/outline"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, MessageCircle, Heart, Settings, Home, User2, UserRound } from "lucide-react"
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
import Loading from "./loading"
import AnalyticsPage from "./@analytics/page"
import { ModeToggle } from "@/components/theme-toggle"
// import Loading from "@/app/loading"

// Navigation configuration
const NAVIGATION_CONFIG = {
    main: [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: UserRound },
        { name: "Browse Cars", href: "/dashboard/listings", icon: Car },
    ],
    seller: [
        { name: "Manage Listings", href: "/dashboard/manage-listings", icon: Settings },
        { name: "Enquiries", href: "/dashboard/enquiries", icon: MessageCircle },
    ],
    user: [
        { name: "Messages", href: "/dashboard/chat", icon: MessageCircle },
        { name: "Favorites", href: "/dashboard/favorites", icon: Heart },
    ],
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ")
}

type DashboardLayoutProps = {
    children: React.ReactNode
    analytics: React.ReactNode
    engagement: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, analytics, engagement }) => {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isProduction = typeof window !== "undefined" &&
        (process.env.NODE_ENV === "production" || window.location.hostname !== "localhost")

    const isActive = (href: string) => {
        return pathname === href || (href !== "/" && pathname?.startsWith(href))
    }

    const closeMobileMenu = () => setMobileMenuOpen(false)

    const renderNavLink = (item: typeof NAVIGATION_CONFIG.main[0], mobile = false) => {
        const active = isActive(item.href)
        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={mobile ? closeMobileMenu : undefined}
                className={classNames(
                    active ? "bg-background text-foreground"
                        : "bg-background text-foreground hover:text-foreground/80",
                    mobile ? "block px-3 py-2 rounded-md text-base font-medium" : "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                )}
                aria-current={active ? "page" : undefined}
            >
                {item.icon && <item.icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />}
                {item.name}
                {item.name === "Messages" && isProduction && !mobile && (
                    <span className="ml-1 text-xs text-blue-600">(Polling)</span>
                )}
            </Link>
        )
    }

    const renderMobileMenu = () => (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center justify-center rounded-md p-2 bg-background text-foreground hover:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
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
                    <div className="space-y-1 px-2 pb-3 pt-6">
                        {NAVIGATION_CONFIG.main.map(item => (
                            <div key={`mobile-main-${item.name}`}>
                                {renderNavLink(item, true)}
                            </div>
                        ))}
                        {session && (
                            <>
                                {NAVIGATION_CONFIG.user.map(item => (
                                    <div key={`mobile-user-${item.name}`}>
                                        {renderNavLink(item, true)}
                                    </div>
                                ))}
                                {session.user?.role === "SELLER" &&
                                    NAVIGATION_CONFIG.seller.map(item => (
                                        <div key={`mobile-seller-${item.name}`}>
                                            {renderNavLink(item, true)}
                                        </div>
                                    ))}
                            </>
                        )}
                    </div>
                    {renderUserSection(true)}
                </div>
            </SheetContent>
        </Sheet>
    )

    const renderUserSection = (mobile = false) => {
        if (!session) {
            return (
                <div className={`border-t border-gray-200 pb-3 pt-4 ${mobile ? 'px-4 space-y-2 mt-auto' : 'flex items-center space-x-4'}`}>
                    {mobile ? (
                        <>
                            <Button asChild variant="ghost" className="w-full" onClick={closeMobileMenu}>
                                <Link href="/signin">Sign In</Link>
                            </Button>
                            <Button asChild className="w-full" onClick={closeMobileMenu}>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/signin">Sign In</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            )
        }

        if (mobile) {
            return (
                <div className="border-t border-gray-200 pb-3 pt-4 mt-auto">
                    <div className="flex items-center px-5 sm:px-6">
                        <div className="flex-shrink-0">
                            <img
                                className="h-10 w-10 rounded-full"
                                src={session.user?.image || "https://files.softicons.com/download/internet-icons/user-icons-by-2shi/ico/user4.ico"}
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
                                    <AlertDialogAction onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm ">{session.user?.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {session.user?.role}
                    </span>
                </div>

                <Menu as="div" className="relative ml-3">
                    <div>
                        <Menu.Button className="relative flex rounded-full bg-background text-foreground hover:text-foreground/80 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
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
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background text-foreground py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({ active }) => (
                                    <Link
                                        href="/profile"
                                        className={classNames(
                                            active ? "bg-background" : "",
                                            "block px-4 py-2 text-sm  hover:text-foreground/80"
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
                                            active ? "bg-background" : "",
                                            "block px-4 py-2 text-sm  hover:text-foreground/80"
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
                                                    active ? "bg-background" : "",
                                                    "w-full text-left px-4 py-2 text-sm  flex items-center gap-2 hover:text-foreground/80"
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
                                                <AlertDialogAction onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>

                <ModeToggle />
            </div>
        )
    }

    const renderContent = () => (
        <div className="flex flex-col min-h-screen">
            <nav className="bg-background text-foreground hover:text-foreground/80 shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="-ml-2 mr-2 flex items-center md:hidden">
                                {renderMobileMenu()}
                            </div>
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/" className="flex items-center space-x-2">
                                    <Car className="h-8 w-8 text-blue-600" />
                                    <span className="text-xl font-bold ">CarMatch</span>
                                </Link>
                            </div>
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
                                {NAVIGATION_CONFIG.main.map(item => renderNavLink(item))}
                                {session && (
                                    <>
                                        {NAVIGATION_CONFIG.user.map(item => renderNavLink(item))}
                                        {session.user?.role === "SELLER" &&
                                            NAVIGATION_CONFIG.seller.map(item => renderNavLink(item))}
                                    </>
                                )}
                            </div>
                        </div>
                        {renderUserSection()}
                    </div>
                </div>
            </nav>
            <main className={pathname === "/dashboard" ? "flex flex-col gap-4" : "flex flex-col"}>
                <div key="children">
                    {children}
                </div>
                {pathname === "/dashboard" && (
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 max-w-7xl mx-auto">
                        <div key="analytics" className="h-full">
                            {analytics}
                        </div>
                        <div key="engagement" className="h-full">
                            {engagement}
                        </div>
                    </div>
                )}
            </main>



        </div>
    )

    return (
        <Suspense fallback={
            <div className="min-h-screen flex justify-center items-center">
                <Loading
                    message="Please wait..."
                    className=""
                    spinnerClassName="text-blue-600 h-16 w-16"
                    messageClassName="text-xl"
                />
            </div>}>
            {renderContent()}
        </Suspense>
    )
}

export default DashboardLayout