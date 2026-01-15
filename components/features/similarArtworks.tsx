'use client'

import { ArtworkCard } from './artworkCard'
import { ArtworkCardSkeleton } from './artworkCardSkeleton'
import { Carousel } from '@/components/ui/carousel'
import { useSimilarArtworks } from '@/lib/hooks/useSimilarArtworks'
import type { ArtworkObject } from '@/lib/types/artwork'
import { cn } from '@/lib/utils/cn'

interface SimilarArtworksProps {
  artwork: ArtworkObject
}

/**
 * Component to display similar artworks recommendations
 */
export function SimilarArtworks({ artwork }: SimilarArtworksProps) {
  const { data: similarArtworks, isLoading, isError } = useSimilarArtworks(artwork)

  if (isError || (!isLoading && (!similarArtworks || similarArtworks.length === 0))) {
    return null
  }

  return (
    <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Similar Artworks
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Discover more artworks you might enjoy
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {Array.from({ length: 4 }).map((_, index) => (
            <ArtworkCardSkeleton key={index} viewMode="grid" />
          ))}
        </div>
      ) : (
        <Carousel
          className="py-2"
          itemClassName="w-[280px] sm:w-[320px]"
          showControls={true}
        >
          {similarArtworks?.map((similarArtwork) => (
            <ArtworkCard key={similarArtwork.objectID} artwork={similarArtwork} viewMode="grid" />
          ))}
        </Carousel>
      )}
    </div>
  )
}
