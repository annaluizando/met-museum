'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCollectionsStore, type CollectionItem } from '@/lib/stores/collections-store'

interface CollectionFormProps {
  collection?: CollectionItem | null
  onClose: () => void
  onSuccess?: () => void
}

/**
 * CRUD form for managing collections
 * Implements form validation and persists data via Zustand
 */
export function CollectionForm({ collection, onClose, onSuccess }: CollectionFormProps) {
  const { addCollection, updateCollection } = useCollectionsStore()
  const [name, setName] = useState(collection?.name || '')
  const [description, setDescription] = useState(collection?.description || '')
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  useEffect(() => {
    if (collection) {
      setName(collection.name)
      setDescription(collection.description)
    }
  }, [collection])

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Collection name is required'
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    if (collection) {
      // Update existing collection
      updateCollection(collection.id, {
        name: name.trim(),
        description: description.trim(),
      })
    } else {
      // Create new collection
      addCollection({
        name: name.trim(),
        description: description.trim(),
        artworkIds: [],
      })
    }

    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="form-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 id="form-title" className="text-xl font-semibold text-zinc-900 dark:text-zinc-200">
            {collection ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-zinc-900 dark:text-zinc-200" aria-hidden="true" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="collection-name">
              Collection Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Favorite Artworks"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-red-600 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="collection-description">
              Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your collection..."
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-red-600 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 dark:text-zinc-200">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {collection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
