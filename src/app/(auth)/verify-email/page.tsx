"use client"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link";

export default function VerifyEmailPage() {
    const [ status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [ message, setMessage ] = useState("")
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams?.get("token")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("Verification token is required")
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`)
                const data = await response.json()

                if (response.ok) {
                    setStatus("success")
                    setMessage(data.message)
                } else {
                    setStatus("error")
                    setMessage(data.error || "Verification failed")
                }
            } catch (error) {
                setStatus("error")
                setMessage("An error occured during verification")
            }
        }

        verifyEmail()
    }, [token])


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Your email has been verified!"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <p className="text-gray-600">{message}</p>
              <div className="space-y-2">
                <Link href="/signin">
                  <Button className="w-full">Sign In to Your Account</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <p className="text-gray-600">{message}</p>
              <div className="space-y-2">
                <Link href="/signup">
                  <Button className="w-full">Sign Up Again</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    )
}