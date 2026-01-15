'use client'

import { useState, useEffect, useMemo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ArtworkCard } from './artworkCard'
import { ArtworkCardSkeleton } from './artworkCardSkeleton'
import type { ArtworkObject } from '@/lib/types/artwork'
import { cn } from '@/lib/utils/cn'

interface VirtualizedArtworkListProps {
  artworks: ArtworkObject[]
  viewMode: 'grid' | 'list'
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

/**
 * Virtualized artwork list component using react-virtuoso
 * Only renders visible items for better performance with large datasets
 */
export function VirtualizedArtworkList({
  artworks,
  viewMode,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: VirtualizedArtworkListProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  )

  useEffect(() => {
    if (viewMode === 'list') return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  const itemsPerRow = useMemo(() => {
    if (viewMode === 'list') return 1
    
    if (windowWidth >= 1280) return 4
    if (windowWidth >= 1024) return 3
    if (windowWidth >= 640) return 2
    return 1
  }, [viewMode, windowWidth])

  const totalRows = useMemo(() => {
    return Math.ceil(artworks.length / itemsPerRow)
  }, [artworks.length, itemsPerRow])

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore()
    }
  }

  if (viewMode === 'list') {
    return (
      <Virtuoso
        useWindowScroll
        totalCount={artworks.length}
        data={artworks}
        itemContent={(_, artwork) => {
          if (!artwork || !artwork.objectID) return null
          return (
            <div className="mb-6">
              <ArtworkCard artwork={artwork} viewMode="list" />
            </div>
          )
        }}
        endReached={handleEndReached}
        components={{
          Footer: () => {
            if (!isFetchingNextPage) return null
            return (
              <div className="py-4">
                <div className="grid grid-cols-1 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <ArtworkCardSkeleton key={i} viewMode="list" />
                  ))}
                </div>
              </div>
            )
          },
        }}
        role="list"
        aria-label="Artwork results"
      />
    )
  }

  return (
    <Virtuoso
      useWindowScroll
      totalCount={totalRows}
      itemContent={(rowIndex) => {
        const startIndex = rowIndex * itemsPerRow
        const rowItems = artworks.slice(startIndex, startIndex + itemsPerRow)
        
        if (rowItems.length === 0) return null
        
        return (
          <div 
            className={cn(
              "grid gap-6 mb-6",
              itemsPerRow === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              itemsPerRow === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              itemsPerRow === 2 && "grid-cols-1 sm:grid-cols-2",
              itemsPerRow === 1 && "grid-cols-1"
            )}
          >
            {rowItems
              .filter((artwork): artwork is NonNullable<typeof artwork> => artwork != null && artwork.objectID != null)
              .map((artwork) => (
                <article key={artwork.objectID} role="listitem">
                  <ArtworkCard artwork={artwork} viewMode="grid" />
                </article>
              ))}
            {/* Fill empty slots in last row */}
            {rowItems.length < itemsPerRow &&
              Array.from({ length: itemsPerRow - rowItems.length }).map((_, i) => (
                <div key={`empty-${i}`} aria-hidden="true" />
              ))
            }
          </div>
        )
      }}
      endReached={handleEndReached}
      components={{
        Footer: () => {
          if (!isFetchingNextPage) return null
          return (
            <div className="py-4">
              <div className={cn(
                "grid gap-6",
                itemsPerRow === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                itemsPerRow === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                itemsPerRow === 2 && "grid-cols-1 sm:grid-cols-2",
                itemsPerRow === 1 && "grid-cols-1"
              )}>
                {Array.from({ length: itemsPerRow }).map((_, index) => (
                  <ArtworkCardSkeleton key={index} viewMode="grid" />
                ))}
              </div>
            </div>
          )
        },
      }}
      role="list"
      aria-label="Artwork results"
    />
  )
}
