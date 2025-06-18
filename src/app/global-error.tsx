'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html>
      <body className="bg-background min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle>Application Error</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Something went wrong!</p>
              {isDev && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {error.message}
                    {error.digest && (
                      <>
                        <br />
                        <span>Digest: {error.digest}</span>
                      </>
                    )}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => reset()} className="gap-2">
              <ReloadIcon className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go to homepage
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}