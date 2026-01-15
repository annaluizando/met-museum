'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirmDialog'
import { CollectionForm } from './collectionForm'
import { EmptyState } from './emptyState'
import { Toast } from '@/components/ui/toast'
import { useCollectionsStore, type CollectionItem } from '@/lib/stores/collections-store'
import { batchGetArtworks } from '@/lib/api/artworks'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants/query-keys'
import { REACT_QUERY_CONFIG } from '@/lib/constants/config'
import { sanitizeImageUrl } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import type { ArtworkObject } from '@/lib/types/artwork'

/**
 * Collection list component with CRUD operations
 * Data persists via Zustand with localStorage
 */
export function CollectionList() {
  const router = useRouter()
  const { collections, deleteCollection } = useCollectionsStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const isMounted = typeof window !== 'undefined'
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleEdit = (collection: CollectionItem) => {
    setEditingCollection(collection)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteCollection(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCollection(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-500 ease-out",
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-200">My Collections</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Create and manage your personal art collections
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div
          className={cn(
            "transition-all duration-500 ease-out delay-100",
            isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <EmptyState
            type="collection"
            title="No collections yet"
            description="Start building your personal art collection by creating your first collection."
            action={{
              label: 'Create Collection',
              onClick: () => setIsFormOpen(true),
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <Card 
              key={collection.id} 
              className={cn(
                "flex flex-col hover:shadow-lg transition-all duration-300 ease-out",
                isMounted 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-6"
              )}
              style={{
                transitionDelay: `${Math.min(index * 50, 500)}ms`,
              }}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1 text-zinc-900 dark:text-zinc-200">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {collection.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                {/* Artwork Preview */}
                <CollectionPreview collectionId={collection.id} artworkIds={collection.artworkIds} />
                
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">{collection.artworkIds.length}</span> artwork{collection.artworkIds.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  Created {new Date(collection.createdAt).toLocaleDateString()}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/collections/${collection.id}`)}
                  className="flex-1"
                  aria-label={`View ${collection.name}`}
                >
                  <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(collection)}
                  className="flex-1"
                  aria-label={`Edit ${collection.name}`}
                >
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(collection.id, collection.name)}
                  className="flex-1"
                  aria-label={`Delete ${collection.name}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Collection Form Modal */}
      {isFormOpen && (
        <CollectionForm
          collection={editingCollection}
          onClose={handleCloseForm}
          onSuccess={(collectionId) => {
            if (collectionId) {
              const { collections: updatedCollections } = useCollectionsStore.getState()
              const created = updatedCollections.find(c => c.id === collectionId)
              if (created) {
                setToastMessage(`Collection "${created.name}" was created`)
              } else {
                setToastMessage('New collection was created')
              }
            } else if (editingCollection) {
              setToastMessage(`Collection "${editingCollection.name}" was updated`)
            }
            handleCloseForm()
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          title="Delete Collection"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      {toastMessage &&
        createPortal(
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />,
          document.body
        )}
    </div>
  )
}

/**
 * Collection preview component showing artwork thumbnails
 */
function CollectionPreview({ collectionId, artworkIds }: { collectionId: string; artworkIds: number[] }) {
  // Fetch first 4 artworks for preview (show all 4, even if some don't have images)
  const previewIds = artworkIds.slice(0, 4)
  
  const { data: artworks, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.ARTWORKS.COLLECTION(collectionId), 'preview'],
    queryFn: async () => {
      if (previewIds.length === 0) {
        return []
      }
      const fetched = await batchGetArtworks(previewIds)
      return fetched.filter((artwork): artwork is ArtworkObject => artwork !== null)
    },
    enabled: previewIds.length > 0,
    staleTime: REACT_QUERY_CONFIG.STALE_TIME,
    retry: REACT_QUERY_CONFIG.RETRY,
    refetchOnWindowFocus: false,
  })

  if (artworkIds.length === 0) {
    return (
      <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">No artworks yet</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg grid grid-cols-2 gap-1 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">Loading previews...</p>
      </div>
    )
  }

  // Show up to 4 artworks (including those without images, with placeholders)
  const previewArtworks = artworks.slice(0, 4)
  const gridCols = previewArtworks.length === 1 ? 'grid-cols-1' : 'grid-cols-2'

  return (
    <div className={cn("w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg grid gap-1 p-1", gridCols)}>
      {previewArtworks.map((artwork, index) => {
        const imageUrl = sanitizeImageUrl(artwork.primaryImageSmall || artwork.primaryImage)
        return (
          <div
            key={artwork.objectID}
            className="relative overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={artwork.title || 'Artwork preview'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-zinc-400 dark:text-zinc-600"
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
            {/* Overlay for additional artworks count */}
            {index === 3 && artworkIds.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">+{artworkIds.length - 4}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
