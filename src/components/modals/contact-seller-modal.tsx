"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ContactSellerModalProps {
  isOpen: boolean
  onClose: () => void
  sellerId: string
  sellerName: string
  listingId: string
  listingTitle: string
}

export function ContactSellerModal({ isOpen, onClose, listingId, sellerId, listingTitle, sellerName }: ContactSellerModalProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId,
          listingId,
          message: `Inqury about "${listingTitle}": ${message}`,
        }),
      })

      if (!response.ok) {
        
        const data = await response.json()
        toast.error(data.error || "Failed to send inquiry")
      } else {
        toast.success("Inquiry sent successfully", {
          description: "We'll get back to you soon.",
        })
      }

      // Success
      onClose()
      setMessage("")
      router.push("/dashboard")
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
          <DialogTitle>Contact {sellerName}</DialogTitle>
          <DialogDescription>About: {listingTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Textarea
              placeholder="Write your message to the seller..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
