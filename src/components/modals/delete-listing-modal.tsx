"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface DeleteListingModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  onDelete?: () => void
}

export function DeleteListingModal({ isOpen, onClose, listingId, listingTitle, onDelete }: DeleteListingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || "Failed to delete listing")
      } else {
        toast.success("Listing deleted successfully")
      }

      // Success
      onClose()
      onDelete?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Listing
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{listingTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Listing"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
