"use client"

import { Loader2, LoaderPinwheel, LoaderPinwheelIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type LoadingProps = {
  message?: string
  className?: string
  spinnerClassName?: string
  messageClassName?: string
}

type InlineLoadingProps = {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Loading({
  message = "Loading...",
  className = "",
  spinnerClassName = "",
  messageClassName = ""
}: LoadingProps) {
  return (
    <div className={cn(
      "fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <LoaderPinwheelIcon className={cn(
          "animate-spin text-blue-600 h-12 w-12",
          spinnerClassName
        )} />
        <p className={cn(
          "text-lg text-black font-medium",
          messageClassName
        )}>
          {message}
        </p>
      </div>
    </div>
  )
}

export function InlineLoading({
  message = "Loading...",
  size = "sm",
  className,
}: InlineLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoaderPinwheel className={cn("animate-spin text-current", sizeClasses[size])} />
      <span className="text-sm">{message}</span>
    </div>
  )
}