'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen || isCreating) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen, isCreating])

  const handleAddToCollection = (collectionId: string) => {
    addArtworkToCollection(collectionId, artworkId)
    onSuccess?.()
  }

  const handleRemoveFromCollection = (collectionId: string) => {
    removeArtworkFromCollection(collectionId, artworkId)
    onSuccess?.()
  }

  const handleCreateNew = () => {
    setIsCreating(true)
  }

  const handleCollectionCreated = (collectionId: string) => {
    addArtworkToCollection(collectionId, artworkId)
    setIsCreating(false)
    onSuccess?.()
  }

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsCreating(false)
  }

  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpen}
      aria-label={`Add ${artworkTitle || 'artwork'} to collection`}
      className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-zinc-950"
    >
      <Plus className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-90" aria-hidden="true" />
      Add to Collection
    </Button>
  )

  // Render modal via portal to escape parent container constraints
  if (!mounted) {
    return button
  }

  const modalContent = isCreating ? (
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
  ) : isOpen ? (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* Centered Modal */}
      <div 
        className="fixed inset-0 z-30 flex items-center justify-center p-4 pointer-events-none"
      >
        <Card 
          className="bg-white dark:bg-zinc-900 rounded-lg shadow-[0_25px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)] border border-zinc-200 dark:border-zinc-800 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
          <div className="flex-1 min-w-0">
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
              handleClose()
            }}
            aria-label="Close dialog"
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
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
              {collections.map((collection, index) => {
                const isInCollection = collection.artworkIds.includes(artworkId)
                return (
                  <button
                    key={collection.id}
                    style={{
                      animationDelay: `${index * 20}ms`,
                    }}
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
                      animate-in fade-in
                      w-full text-left p-4 rounded-lg border transition-all duration-200 ease-in-out
                      transform hover:scale-[1.02] active:scale-[0.98]
                      ${isInCollection
                        ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 cursor-pointer shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer hover:shadow-sm'
                      }
                    `}
                    aria-label={isInCollection ? `Remove from ${collection.name}` : `Add to ${collection.name}`}
                  >
                    <div className="flex items-center justify-between group">
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
                          <div className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                            <Minus className="w-4 h-4 text-white" aria-hidden="true" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 ml-2 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors">
                          <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Button
            variant="outline"
            className="w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCreateNew()
            }}
          >
            <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" aria-hidden="true" />
            Create New Collection
          </Button>
        </div>
      </Card>
      </div>
    </>
  ) : null

  return (
    <>
      {button}
      {(isOpen || isCreating) && createPortal(modalContent, document.body)}
    </>
  )
}
