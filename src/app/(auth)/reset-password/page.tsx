"use client"

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [isValidToken, setIsValidToken] = useState(true)

    const searchParams = useSearchParams()
    const token = searchParams?.get("token")
    const router = useRouter()

    useEffect(() => {
        if (!token) {
            setIsValidToken(false)
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setMessage("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        setMessage("")

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSuccess(true)
                setMessage(data.message)
            } else {
                setMessage(data.error || "Password reset failed")
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
                        <CardDescription>This password reset link is invalid or has expired.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/forgot-password">
                            <Button className="w-full">Request New Reset Link</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
                        <CardDescription>Your password has been successfully reset.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Link href="/signin">
                            <Button className="w-full">Sign In with New Password</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">Enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                            />
                        </div>

                        {message && (
                            <div className={`text-sm text-center ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="text-center">
                            <Link href="/signin" className="text-sm text-blue-600 hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}