import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navigation } from "@/components/navigation"
import { Toaster } from "sonner"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CarMatch - Connect Car Buyers and Sellers",
  description: "A platform to connect car buyers and sellers efficiently",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Providers session={session}>
            {/* Only show navigation if user is not logged in */}
            {!session && <Navigation />}
            <main className="bg-background text-foreground">
              {children}
            </main>

            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}