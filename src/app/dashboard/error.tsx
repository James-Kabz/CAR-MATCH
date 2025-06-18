'use client'

import { useEffect, useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    console.error("Error boundary caught:", error)
  }, [error])

  const handleTryAgain = () => {
    setOpen(false)
    reset()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Something went wrong</AlertDialogTitle>
          <AlertDialogDescription>
            An unexpected error occurred. You can try again or contact support if the issue persists.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleTryAgain}>
            Try Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
