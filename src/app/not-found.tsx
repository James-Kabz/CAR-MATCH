import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="flex w-full max-w-md flex-col items-center space-y-6">
        <Alert variant="destructive" className="w-full">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Page Not Found</AlertTitle>
          <AlertDescription>
            The requested resource could not be found. It may have been moved or deleted.
          </AlertDescription>
        </Alert>

        <Button asChild variant="outline">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  )
}