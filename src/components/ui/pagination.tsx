"use client"
import type * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // Handle edge cases
    if (totalPages <= 1) return [1]
    if (totalPages <= 7) {
      // Show all pages if we have 7 or fewer pages
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pagination: (number | string)[] = []
    
    // Always include first page
    pagination.push(1)
    
    // Calculate the range around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
    
    // Determine if we need dots after first page
    const shouldShowLeftDots = leftSiblingIndex > 3
    // Determine if we need dots before last page  
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2
    
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // No left dots, but right dots needed
      const leftRange = Math.max(2, 3 + 2 * siblingCount)
      for (let i = 2; i <= leftRange; i++) {
        pagination.push(i)
      }
      pagination.push("...")
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Left dots needed, but no right dots
      pagination.push("...")
      const rightRange = Math.min(totalPages - 1, totalPages - 2 - 2 * siblingCount)
      for (let i = rightRange; i < totalPages; i++) {
        pagination.push(i)
      }
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Both left and right dots needed
      pagination.push("...")
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pagination.push(i)
      }
      pagination.push("...")
    } else {
      // No dots needed
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== totalPages) {
          pagination.push(i)
        }
      }
    }
    
    // Always include last page
    if (totalPages > 1) {
      pagination.push(totalPages)
    }
    
    // Remove duplicates while preserving order
    const seen = new Set()
    return pagination.filter(item => {
      if (typeof item === 'string') return true // Keep ellipsis
      if (seen.has(item)) return false
      seen.add(item)
      return true
    })
  }

  const pagination = generatePagination()

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)} {...props}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pagination.map((page, index) => {
        if (page === "...") {
          return (
            <Button key={`ellipsis-${index}`} variant="outline" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        const pageNum = page as number
        return (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
            aria-current={pageNum === currentPage ? "page" : undefined}
          >
            {pageNum}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}