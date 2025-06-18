import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
  fullScreen?: boolean
}

export function GlobalLoading({
  message = "Loading...",
  size = "md",
  className,
  fullScreen = false,
}: GlobalLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
          <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
        <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>{message}</p>
      </div>
    </div>
  )
}

// Inline loading for buttons and small components
export function InlineLoading({
  message = "Loading...",
  size = "sm",
  className,
}: Omit<GlobalLoadingProps, "fullScreen">) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-current", sizeClasses[size])} />
      <span className="text-sm">{message}</span>
    </div>
  )
}

// Card loading skeleton
export function CardLoading({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
