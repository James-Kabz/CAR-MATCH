"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RespondInquiryModalProps {
  isOpen: boolean
  onClose: () => void
  inquiryId: string
  buyerName: string
  inquiryMessage: string
}

export function RespondInquiryModal({
  isOpen,
  onClose,
  inquiryId,
  buyerName,
  inquiryMessage,
}: RespondInquiryModalProps) {
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!response.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const apiResponse = await fetch(`/api/inquiries/${inquiryId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response,
        }),
      })

      if (!apiResponse.ok) {
        const data = await apiResponse.json()
        throw new Error(data.error || "Failed to send response")
      }

      const { chatRoomId } = await apiResponse.json()

      // Success
      onClose()
      setResponse("")
      router.push(`/chat?roomId=${chatRoomId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Respond to {buyerName}</DialogTitle>
          <DialogDescription>Your response will start a chat conversation</DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <p className="font-medium mb-1">Original inquiry:</p>
          <p className="text-gray-700">{inquiryMessage}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Textarea
              placeholder="Write your response..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !response.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Response"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
