"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Car } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageSliderProps {
  images: string[]
  aspectRatio?: "square" | "video" | "auto"
  showThumbnails?: boolean
  showCounter?: boolean
  className?: string
}

export function ImageSlider({
  images,
  aspectRatio = "video",
  showThumbnails = true,
  className = "",
  showCounter = true,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${
          aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "h-48"
        } ${className}`}
      >
        <Car className="h-12 w-12 text-gray-400" />
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div
        className={`relative overflow-hidden rounded-lg ${
          aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "h-48"
        }`}
      >
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 mt-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                index === currentIndex ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image counter */}
         {showCounter && images.length > 1 && (
           <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
             {currentIndex + 1} / {images.length}
           </div>
        )}
    </div>
  )
}


// "use client"

// import * as React from "react"
// import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"

// interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
//   images: string[]
//   aspectRatio?: "square" | "video" | "auto"
//   showThumbnails?: boolean
//   showCounter?: boolean
//   className?: string
// }

// export function ImageSlider({
//   images,
//   aspectRatio = "video",
//   showThumbnails = true,
//   showCounter = true,
//   className,
//   ...props
// }: ImageSliderProps) {
//   const [currentIndex, setCurrentIndex] = React.useState(0)

//   const goToNext = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
//   }

//   const goToPrevious = () => {
//     setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
//   }

//   const goToIndex = (index: number) => {
//     setCurrentIndex(index)
//   }

//   // Get aspect ratio class
//   const getAspectRatioClass = () => {
//     switch (aspectRatio) {
//       case "square":
//         return "aspect-square"
//       case "video":
//         return "aspect-video"
//       case "auto":
//         return ""
//       default:
//         return "aspect-video"
//     }
//   }

//   // If no images, show placeholder
//   if (!images || images.length === 0) {
//     return (
//       <div
//         className={cn(
//           "relative bg-gray-100 rounded-lg flex items-center justify-center",
//           getAspectRatioClass(),
//           className,
//         )}
//         {...props}
//       >
//         <ImageIcon className="h-12 w-12 text-gray-400" />
//       </div>
//     )
//   }

//   return (
//     <div className={cn("space-y-2", className)} {...props}>
//       {/* Main image */}
//       <div className={cn("relative rounded-lg overflow-hidden", getAspectRatioClass())}>
//         <img
//           src={images[currentIndex] || "/placeholder.svg"}
//           alt={`Image ${currentIndex + 1}`}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             e.currentTarget.src = "/placeholder.svg?height=400&width=600"
//           }}
//         />

//         {/* Navigation arrows */}
//         {images.length > 1 && (
//           <>
//             <Button
//               variant="secondary"
//               size="icon"
//               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 goToPrevious()
//               }}
//               aria-label="Previous image"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="secondary"
//               size="icon"
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 goToNext()
//               }}
//               aria-label="Next image"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </>
//         )}

//         {/* Image counter */}
//         {showCounter && images.length > 1 && (
//           <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//             {currentIndex + 1} / {images.length}
//           </div>
//         )}
//       </div>

//       {/* Thumbnails */}
//       {showThumbnails && images.length > 1 && (
//         <div className="flex space-x-2 overflow-x-auto">
//           {images.map((image, index) => (
//             <button
//               key={index}
//               className={cn(
//                 "flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden",
//                 index === currentIndex ? "border-blue-500" : "border-gray-300",
//               )}
//               onClick={() => goToIndex(index)}
//               aria-label={`View image ${index + 1}`}
//             >
//               <img
//                 src={image || "/placeholder.svg"}
//                 alt={`Thumbnail ${index + 1}`}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = "/placeholder.svg?height=64&width=64"
//                 }}
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
