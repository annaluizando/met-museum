'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, MapPin, Palette, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/features/error-state'
import { ImageViewer } from '@/components/features/image-viewer'
import { useArtworkDetail } from '@/lib/hooks/use-artwork-detail'
import { sanitizeImageUrl, formatArtworkDate } from '@/lib/utils/formatters'

interface ArtworkDetailViewProps {
  artworkId: number
}

/**
 * Client component for artwork detail view
 */
export function ArtworkDetailView({ artworkId }: ArtworkDetailViewProps) {
  const router = useRouter()
  const { data: artwork, isLoading, isError, error, refetch } = useArtworkDetail(artworkId)

  if (isLoading) {
    return <ArtworkDetailSkeleton />
  }

  if (isError || !artwork) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          message={error?.message || 'Failed to load artwork details'}
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
        <div className="relative aspect-square bg-zinc-100 rounded-lg overflow-hidden">
          {imageUrl ? (
            <>
              <ImageViewer
                src={imageUrl}
                alt={artwork.title || 'Artwork image'}
                title={`${artwork.title || 'Untitled'} ${artwork.artistDisplayName ? `by ${artwork.artistDisplayName}` : ''}`}
              />
              {artwork.isPublicDomain && (
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded font-medium text-sm z-10 pointer-events-none">
                  Public Domain
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              <svg
                className="w-24 h-24"
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
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-2">
              {artwork.title || 'Untitled'}
            </h1>
            {artwork.artistDisplayName && (
              <p className="text-xl text-zinc-600">
                {artwork.artistDisplayName}
                {artwork.artistDisplayBio && (
                  <span className="text-sm ml-2">({artwork.artistDisplayBio})</span>
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
                <DetailItem icon={MapPin} label="Culture" value={artwork.culture} />
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
                <DetailItem icon={Building} label="Department" value={artwork.department} />
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
              <h3 className="font-semibold text-zinc-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {artwork.tags.slice(0, 10).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full"
                  >
                    {tag.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          {artwork.objectURL && (
            <Link
              href={artwork.objectURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-900 hover:underline font-medium"
            >
              View on Met Museum website
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
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
      {Icon && <Icon className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" aria-hidden="true" />}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-zinc-500">{label}</dt>
        <dd className="text-base text-zinc-900 mt-0.5">{value}</dd>
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
