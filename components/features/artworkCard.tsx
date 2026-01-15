'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { sanitizeImageUrl, truncateText, formatArtworkDate } from '@/lib/utils/formatters'
import { AddToCollection } from './addToCollection'
import type { ArtworkObject } from '@/lib/types/artwork'
import { cn } from '@/lib/utils/cn'

interface ArtworkCardProps {
  artwork: ArtworkObject
  viewMode?: 'grid' | 'list'
}

/**
 * Artwork card component with responsive grid/list layout
 * Implements accessibility with semantic HTML and proper ARIA labels
 */
export function ArtworkCard({ artwork, viewMode = 'grid' }: ArtworkCardProps) {
  const imageUrl = sanitizeImageUrl(artwork.primaryImageSmall || artwork.primaryImage)
  const isListView = viewMode === 'list'
  const [showAddButton, setShowAddButton] = useState(false)

  return (
    <div
      className="relative group h-full"
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      <Link
        href={`/artwork/${artwork.objectID}`}
        className={cn(
          "block h-full transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2 rounded-lg",
          isListView && "hover:scale-100"
        )}
        aria-label={`View details for ${artwork.title} by ${artwork.artistDisplayName || 'Unknown Artist'}`}
      >
        <Card className={cn(
          "overflow-hidden h-full transition-all duration-300 ease-in-out hover:shadow-lg flex flex-col",
          isListView && "flex-row"
        )}>
          {/* Image Section */}
          <div className={cn(
            "relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden transition-all duration-300 ease-in-out",
            isListView ? "w-48 shrink-0" : "aspect-square w-full"
          )}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={artwork.title || 'Untitled artwork'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={isListView ? "192px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            
            {/* Public Domain Badge */}
            {artwork.isPublicDomain && (
              <div className="absolute top-2 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tl-lg font-medium">
                Public Domain
              </div>
            )}
          </div>

        {/* Content Section */}
        <div className={cn("flex flex-col flex-1 transition-all duration-300 ease-in-out", isListView && "flex-1")}>
          <CardContent className={cn("flex-1 flex flex-col justify-between transition-all duration-300 ease-in-out", isListView ? "p-4" : "p-4")}>
            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-200">
              {artwork.title || 'Untitled'}
            </h3>

            {/* Artist */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              {artwork.artistDisplayName || 'Unknown Artist'}
            </p>

            {/* Date */}
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-2">
              {formatArtworkDate(artwork.objectBeginDate, artwork.objectEndDate)}
            </p>

            {/* Additional Info (only in list view) */}
            {isListView && (
              <div className="mt-2 space-y-1">
                {artwork.medium && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Medium:</span> {truncateText(artwork.medium, 100)}
                  </p>
                )}
                {artwork.culture && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Culture:</span> {artwork.culture}
                  </p>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className={cn("px-4 pb-4 pt-0", isListView && "pb-4")}>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
              <span className="truncate">{artwork.department}</span>
            </div>
          </CardFooter>
        </div>
      </Card>
      </Link>
      
      {/* Add to Collection Button - appears on hover */}
      {showAddButton && (
        <div 
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <AddToCollection
            artworkId={artwork.objectID}
            artworkTitle={artwork.title || 'Untitled'}
          />
        </div>
      )}
    </div>
  )
}
