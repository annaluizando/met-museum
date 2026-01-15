'use client'

import { useState } from 'react'
import { Plus, X, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCollectionsStore } from '@/lib/stores/collections-store'
import { CollectionForm } from './collectionForm'

interface AddToCollectionProps {
  artworkId: number
  artworkTitle?: string
  onSuccess?: () => void
}

/**
 * Component for adding artworks to collections
 * Shows a modal with existing collections and option to create new one
 */
export function AddToCollection({ artworkId, artworkTitle, onSuccess }: AddToCollectionProps) {
  const { collections, addArtworkToCollection, removeArtworkFromCollection } = useCollectionsStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleAddToCollection = (collectionId: string) => {
    addArtworkToCollection(collectionId, artworkId)
    onSuccess?.()
    setIsOpen(false)
  }

  const handleRemoveFromCollection = (collectionId: string) => {
    removeArtworkFromCollection(collectionId, artworkId)
    onSuccess?.()
    // Don't close the modal so user can add/remove from multiple collections
  }

  const handleCreateNew = () => {
    setIsCreating(true)
  }

  const handleCollectionCreated = (collectionId: string) => {
    // Automatically add artwork to the newly created collection
    addArtworkToCollection(collectionId, artworkId)
    setIsCreating(false)
    setIsOpen(false)
    onSuccess?.()
  }

  const handleOpen = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsOpen(true)
  }

  if (!isOpen && !isCreating) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        aria-label={`Add ${artworkTitle || 'artwork'} to collection`}
        className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-zinc-950"
      >
        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
        Add to Collection
      </Button>
    )
  }

  if (isCreating) {
    return (
      <CollectionForm
        collection={null}
        onClose={() => {
          setIsCreating(false)
          setIsOpen(false)
        }}
        onSuccess={(collectionId) => {
          if (collectionId) {
            handleCollectionCreated(collectionId)
          }
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
      <Card className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-200">
              Add to Collection
            </h2>
            {artworkTitle && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                {artworkTitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsOpen(false)
            }}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {collections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                You don't have any collections yet.
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Your First Collection
              </Button>
            </div>
          ) : (
            <>
              {collections.map((collection) => {
                const isInCollection = collection.artworkIds.includes(artworkId)
                return (
                  <button
                    key={collection.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (isInCollection) {
                        handleRemoveFromCollection(collection.id)
                      } else {
                        handleAddToCollection(collection.id)
                      }
                    }}
                    className={`
                      w-full text-left p-4 rounded-lg border transition-colors
                      ${isInCollection
                        ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 cursor-pointer'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer'
                      }
                    `}
                    aria-label={isInCollection ? `Remove from ${collection.name}` : `Add to ${collection.name}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-200 truncate">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
                          {collection.description}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {collection.artworkIds.length} artwork{collection.artworkIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isInCollection ? (
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Minus className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                      ) : (
                        <Plus className="w-5 h-5 text-zinc-600 dark:text-zinc-400 shrink-0 ml-2" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCreateNew()
            }}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Create New Collection
          </Button>
        </div>
      </Card>
    </div>
  )
}
