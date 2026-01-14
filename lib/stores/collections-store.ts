import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Collection item that users can create and manage
 */
export interface CollectionItem {
  id: string
  name: string
  description: string
  artworkIds: number[]
  createdAt: string
  updatedAt: string
}

interface CollectionsState {
  collections: CollectionItem[]
  addCollection: (collection: Omit<CollectionItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCollection: (id: string, updates: Partial<CollectionItem>) => void
  deleteCollection: (id: string) => void
  addArtworkToCollection: (collectionId: string, artworkId: number) => void
  removeArtworkFromCollection: (collectionId: string, artworkId: number) => void
}

/**
 * Zustand store for managing user collections with persistence
 */
export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set) => ({
      collections: [],
      
      addCollection: (collection) =>
        set((state) => {
          const now = new Date().toISOString()
          const newCollection: CollectionItem = {
            ...collection,
            id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            updatedAt: now,
          }
          return {
            collections: [...state.collections, newCollection],
          }
        }),

      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === id
              ? { ...collection, ...updates, updatedAt: new Date().toISOString() }
              : collection
          ),
        })),

      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((collection) => collection.id !== id),
        })),

      addArtworkToCollection: (collectionId, artworkId) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  artworkIds: [...collection.artworkIds, artworkId],
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        })),

      removeArtworkFromCollection: (collectionId, artworkId) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  artworkIds: collection.artworkIds.filter((id) => id !== artworkId),
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        })),
    }),
    {
      name: 'metmuseum-collections-storage',
    }
  )
)
