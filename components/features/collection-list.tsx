'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CollectionForm } from './collection-form'
import { EmptyState } from './empty-state'
import { useCollectionsStore, type CollectionItem } from '@/lib/stores/collections-store'

/**
 * Collection list component with CRUD operations
 * Data persists via Zustand with localStorage
 */
export function CollectionList() {
  const { collections, deleteCollection } = useCollectionsStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null)

  const handleEdit = (collection: CollectionItem) => {
    setEditingCollection(collection)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCollection(id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCollection(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <EmptyState
          type="collection"
          title="No collections yet"
          description="Start building your personal art collection by creating your first collection."
          action={{
            label: 'Create Collection',
            onClick: () => setIsFormOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-1">{collection.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {collection.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">{collection.artworkIds.length}</span> artwork{collection.artworkIds.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  Created {new Date(collection.createdAt).toLocaleDateString()}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
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
        />
      )}
    </div>
  )
}
