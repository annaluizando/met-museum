'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ArtworkImageProps {
  imageUrl: string
  alt: string
  isListView: boolean
}

export function ArtworkImage({ 
  imageUrl, 
  alt, 
  isListView 
}: ArtworkImageProps) {
  const [isImageLoading, setIsImageLoading] = useState(true)

  return (
    <>
      {/* Loading skeleton */}
      {isImageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 z-10">
          <Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading image...</span>
        </div>
      )}
      <Image
        key={imageUrl}
        src={imageUrl}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-300 group-hover:scale-105",
          isImageLoading ? "opacity-0" : "opacity-100"
        )}
        sizes={isListView ? "192px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        loading="lazy"
        onLoad={() => setIsImageLoading(false)}
        onError={() => setIsImageLoading(false)}
      />
    </>
  )
}
