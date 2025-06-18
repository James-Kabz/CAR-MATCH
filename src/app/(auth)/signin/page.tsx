"use client"

import type React from "react"
import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Mail } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendSuccess, setResendSuccess] = useState("")
  const router = useRouter()

  async function handleResend() {
    if (!email) {
      setError("Please enter your email first")
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResendSuccess("Verification email sent successfully!")
        setError("")
      }
    } catch (error) {
      setError("Failed to send verification email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResendSuccess("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        const session = await getSession()
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your CarMatch account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                {error}
                {error.includes("not verified") && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 p-0 ml-2 h-auto"
                    onClick={handleResend}
                    disabled={isLoading}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Resend verification
                  </Button>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="text-sm text-green-600 text-center bg-green-50 p-3 rounded-md">
                {resendSuccess}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}