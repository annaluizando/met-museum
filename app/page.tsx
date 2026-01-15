'use client'

import { SearchBar } from '@/components/features/searchBar'
import { ArtworkGrid } from '@/components/features/artworkGrid'

/**
 * Home page with search and infinite scroll artwork grid
 */
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-200 mb-4">
          Explore The Met Collection
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Discover over 470,000 artworks from The Metropolitan Museum of Art. 
          Search by artwork, artist, culture, or time period.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Artwork Grid with Infinite Scroll */}
      <ArtworkGrid />
    </div>
  )
}
