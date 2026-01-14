'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/features/empty-state'
import { ArtworkCard } from '@/components/features/artwork-card'
import { ArtworkCardSkeleton } from '@/components/features/artwork-card-skeleton'
import { CollectionForm } from '@/components/features/collection-form'
import { useCollectionsStore } from '@/lib/stores/collections-store'
import { batchGetArtworks } from '@/lib/api/artworks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'
import { cn } from '@/lib/utils/cn'
import type { ArtworkObject } from '@/lib/types/artwork'

interface CollectionDetailViewProps {
  collectionId: string
}

/**
 * Collection detail view with artwork management
 */
export function CollectionDetailView({ collectionId }: CollectionDetailViewProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { collections, deleteCollection, removeArtworkFromCollection } = useCollectionsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [removeArtworkConfirm, setRemoveArtworkConfirm] = useState<{
    artworkId: number
    artworkTitle: string
  } | null>(null)
  
  const collection = collections.find(c => c.id === collectionId)

  // Fetch artworks for this collection
  const { data: artworks, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.ARTWORKS.COLLECTION(collectionId),
    queryFn: async () => {
      if (!collection || collection.artworkIds.length === 0) {
        return []
      }
      const fetched = await batchGetArtworks(collection.artworkIds)
      return fetched.filter((artwork): artwork is ArtworkObject => artwork !== null)
    },
    enabled: !!collection && collection.artworkIds.length > 0,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: REACT_QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
  })

  if (!collection) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          type="collection"
          title="Collection not found"
          description="The collection you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Back to Collections',
            onClick: () => router.push('/collections'),
          }}
        />
      </div>
    )
  }

  const handleDelete = () => {
    setDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    deleteCollection(collectionId)
    setDeleteConfirm(false)
    router.push('/collections')
  }

  const handleRemoveArtwork = (artworkId: number, artworkTitle: string) => {
    setRemoveArtworkConfirm({ artworkId, artworkTitle })
  }

  const handleConfirmRemoveArtwork = () => {
    if (removeArtworkConfirm) {
      removeArtworkFromCollection(collectionId, removeArtworkConfirm.artworkId)
      // Invalidate query to refetch artworks
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ARTWORKS.COLLECTION(collectionId) })
      setRemoveArtworkConfirm(null)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/collections')}
          className="mb-4"
          aria-label="Back to collections"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Back to Collections
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {collection.name}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
              {collection.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
              <span>
                <span className="font-semibold">{collection.artworkIds.length}</span> artwork{collection.artworkIds.length !== 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
              {collection.updatedAt !== collection.createdAt && (
                <>
                  <span>•</span>
                  <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${collection.name}`}
            >
              <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              aria-label={`Delete ${collection.name}`}
            >
              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {isLoading ? (
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ArtworkCardSkeleton key={index} viewMode="grid" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          type="error"
          title="Failed to load artworks"
          description="There was an error loading the artworks in this collection. Please try again."
        />
      ) : !artworks || artworks.length === 0 ? (
        <EmptyState
          type="collection"
          title="No artworks yet"
          description="Start adding artworks to this collection by browsing the gallery and clicking 'Add to Collection' on any artwork."
          action={{
            label: 'Browse Artworks',
            onClick: () => router.push('/'),
          }}
        />
      ) : (
        <div className={cn(
          "grid gap-6",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}>
          {artworks.map((artwork) => (
            <div key={artwork.objectID} className="relative group">
              <ArtworkCard artwork={artwork} viewMode="grid" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRemoveArtwork(artwork.objectID, artwork.title || 'Untitled')
                }}
                aria-label={`Remove ${artwork.title || 'artwork'} from collection`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <CollectionForm
          collection={collection}
          onClose={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
      />

      {/* Remove Artwork Confirmation Dialog */}
      {removeArtworkConfirm && (
        <ConfirmDialog
          isOpen={!!removeArtworkConfirm}
          title="Remove Artwork"
          message={`Remove "${removeArtworkConfirm.artworkTitle}" from this collection?`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleConfirmRemoveArtwork}
          onCancel={() => setRemoveArtworkConfirm(null)}
        />
      )}
    </div>
  )
}
