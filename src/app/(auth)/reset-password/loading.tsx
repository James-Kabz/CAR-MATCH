"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
          
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}