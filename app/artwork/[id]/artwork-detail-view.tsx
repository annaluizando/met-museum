'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Palette, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/features/errorState'
import { ImageViewer } from '@/components/features/imageViewer'
import { AddToCollection } from '@/components/features/addToCollection'
import { useArtworkDetail } from '@/lib/hooks/useArtworkDetail'
import { sanitizeImageUrl, formatArtworkDate } from '@/lib/utils/formatters'
import { ERROR_MESSAGES } from '@/lib/constants/config'

interface ArtworkDetailViewProps {
  artworkId: number
}

/**
 * Client component for artwork detail view
 */
export function ArtworkDetailView({ artworkId }: ArtworkDetailViewProps) {
  const router = useRouter()
  const { data: artwork, isLoading, isError, refetch } = useArtworkDetail(artworkId)

  if (isLoading) {
    return <ArtworkDetailSkeleton />
  }

  if (isError || !artwork) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          message={ERROR_MESSAGES.GENERIC}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const imageUrl = sanitizeImageUrl(artwork.primaryImage || artwork.primaryImageSmall)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Back
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section with Fullscreen & Zoom */}
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          {imageUrl ? (
            <>
              <ImageViewer
                src={imageUrl}
                alt={artwork.title || 'Artwork image'}
                title={`${artwork.title || 'Untitled'} ${artwork.artistDisplayName ? `by ${artwork.artistDisplayName}` : ''}`}
              />
              {artwork.isPublicDomain && (
                <div className="absolute top-4 right-0 bg-green-600 text-white px-3 py-1.5 rounded-bl-lg rounded-tl-lg font-medium text-sm z-10 pointer-events-none">
                  Public Domain
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
              <svg
                className="w-24 h-24 mb-3"
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
              <p className="text-sm">No image available</p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {artwork.title || 'Untitled'}
            </h1>
            {artwork.artistDisplayName && (
              <p className="text-xl text-zinc-600 dark:text-zinc-400">
                <Link 
                  href={`/?q=${encodeURIComponent(artwork.artistDisplayName)}`}
                  className="hover:underline hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1 group/artist"
                  title={`View all artworks by ${artwork.artistDisplayName}`}
                >
                  {artwork.artistDisplayName}
                  <svg 
                    className="w-4 h-4 opacity-0 group-hover/artist:opacity-100 transition-opacity" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
                {artwork.artistDisplayBio && (
                  <span className="text-sm ml-2 text-zinc-500 dark:text-zinc-500">({artwork.artistDisplayBio})</span>
                )}
              </p>
            )}
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Date */}
              {(artwork.objectDate || artwork.objectBeginDate) && (
                <DetailItem
                  icon={Calendar}
                  label="Date"
                  value={artwork.objectDate || formatArtworkDate(artwork.objectBeginDate, artwork.objectEndDate)}
                />
              )}

              {/* Culture */}
              {artwork.culture && (
                <DetailItemClickable 
                  icon={MapPin} 
                  label="Culture" 
                  value={artwork.culture}
                  searchQuery={artwork.culture}
                />
              )}

              {/* Medium */}
              {artwork.medium && (
                <DetailItem icon={Palette} label="Medium" value={artwork.medium} />
              )}

              {/* Dimensions */}
              {artwork.dimensions && (
                <DetailItem icon={Building} label="Dimensions" value={artwork.dimensions} />
              )}

              {/* Classification */}
              {artwork.classification && (
                <DetailItem icon={Building} label="Classification" value={artwork.classification} />
              )}

              {/* Department */}
              {artwork.department && (
                <DetailItemClickable 
                  icon={Building} 
                  label="Department" 
                  value={artwork.department}
                  searchQuery={artwork.department}
                />
              )}

              {/* Accession Number */}
              {artwork.accessionNumber && (
                <DetailItem label="Accession Number" value={artwork.accessionNumber} />
              )}

              {/* Credit Line */}
              {artwork.creditLine && (
                <DetailItem label="Credit" value={artwork.creditLine} />
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {artwork.tags && artwork.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {artwork.tags.slice(0, 10).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm rounded-full"
                  >
                    {tag.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <AddToCollection
              artworkId={artwork.objectID}
              artworkTitle={artwork.title || 'Untitled'}
            />
            {artwork.objectURL && (
              <Link
                href={artwork.objectURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-zinc-900 dark:text-zinc-100 hover:underline font-medium border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                View on Met Museum website
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon?: typeof Calendar
  label: string
  value: string 
}) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" aria-hidden="true" />}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-500">{label}</dt>
        <dd className="text-base text-zinc-900 dark:text-zinc-100 mt-0.5">{value}</dd>
      </div>
    </div>
  )
}

function DetailItemClickable({ 
  icon: Icon, 
  label, 
  value,
  searchQuery 
}: { 
  icon?: typeof Calendar
  label: string
  value: string
  searchQuery: string
}) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" aria-hidden="true" />}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-500">{label}</dt>
        <dd className="text-base mt-0.5">
          <Link 
            href={`/?q=${encodeURIComponent(searchQuery)}`}
            className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors inline-flex items-center gap-1 group/link"
            title={`Search for ${value}`}
          >
            {value}
            <svg 
              className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </dd>
      </div>
    </div>
  )
}

function ArtworkDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-10 w-20 mb-6" />
      
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-lg" />
        
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-5 h-5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
