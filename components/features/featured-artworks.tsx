'use client'

import { useEffect, useState } from 'react'
import { ArtworkCard } from './artwork-card'
import { ArtworkCardSkeleton } from './artwork-card-skeleton'
import { batchGetArtworks } from '@/lib/api/artworks'
import type { ArtworkObject } from '@/lib/types/artwork'
import { useSearchStore } from '@/lib/stores/search-store'
import { cn } from '@/lib/utils/cn'

/**
 * Featured artworks component
 * Shows curated highlights from the Met Museum on landing
 */
export function FeaturedArtworks() {
  const { viewMode } = useSearchStore()
  const [artworks, setArtworks] = useState<ArtworkObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      try {
        setIsLoading(true)
        
        // Curated list of famous artworks from the Met Museum
        // These are well-known pieces with high-quality images
        const featuredIds = [
          436535, // The Great Wave
          459055, // Bridge Over a Pond of Water Lilies (Monet)
          438817, // Self-Portrait with a Straw Hat (Van Gogh)
          436105, // Wheat Field with Cypresses (Van Gogh)
          437133, // Irises (Van Gogh)
          436528, // A Pair of Leather Clogs (Van Gogh)
          437894, // Virgin and Child (Duccio)
          459080, // Water Lilies (Monet)
          436121, // Cypresses (Van Gogh)
          435809, // Bouquet of Flowers (Renoir)
          437311, // Madame Roulin and Her Baby (Van Gogh)
          438754, // Oleanders (Van Gogh)
        ]

        // Shuffle and take 8 random artworks for variety
        const shuffled = featuredIds.sort(() => Math.random() - 0.5)
        const selectedIds = shuffled.slice(0, 8)
        
        const fetchedArtworks = await batchGetArtworks(selectedIds)
        const validArtworks = fetchedArtworks.filter(
          (artwork): artwork is ArtworkObject => artwork !== null
        )
        
        setArtworks(validArtworks)
      } catch (error) {
        console.error('Failed to fetch featured artworks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedArtworks()
  }, [])

  // Handle view mode transition animation
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 500)
    return () => clearTimeout(timer)
  }, [viewMode])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Featured Artworks
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Discover masterpieces from The Met Collection
          </p>
        </div>
        
        <div className={cn(
          "grid gap-6 transition-all duration-500 ease-in-out",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ArtworkCardSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Featured Artworks
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Discover masterpieces from The Met Collection
        </p>
      </div>
      
      <div 
        className={cn(
          "grid gap-6",
          viewMode === 'grid'
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}
        role="list"
        aria-label="Featured artworks"
      >
        {artworks.map((artwork, index) => (
          <article 
            key={artwork.objectID}
            role="listitem"
            className={cn(
              "view-mode-transition",
              isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
            )}
            style={{
              transitionDelay: `${Math.min(index * 10, 200)}ms`,
            }}
          >
            <ArtworkCard artwork={artwork} viewMode={viewMode} />
          </article>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Start searching to explore over 470,000 artworks
        </p>
      </div>
    </div>
  )
}
