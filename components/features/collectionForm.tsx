'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCollectionsStore, type CollectionItem } from '@/lib/stores/collections-store'
import { collectionFormSchema } from '@/lib/validations/collection'
import { sanitizeString } from '@/lib/utils/sanitize'

interface CollectionFormProps {
  collection?: CollectionItem | null
  onClose: () => void
  onSuccess?: (collectionId?: string) => void
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
    // Sanitize inputs first
    const sanitizedName = sanitizeString(name)
    const sanitizedDescription = sanitizeString(description)
    
    // Validate using Zod schema
    const result = collectionFormSchema.safeParse({
      name: sanitizedName,
      description: sanitizedDescription,
    })

    if (!result.success) {
      const newErrors: { name?: string; description?: string } = {}
      
      // Extract field-specific errors from Zod
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'name') {
          newErrors.name = issue.message
        } else if (issue.path[0] === 'description') {
          newErrors.description = issue.message
        }
      })
      
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!validate()) {
      return
    }

    // Sanitize and validate one more time before saving
    const sanitizedName = sanitizeString(name)
    const sanitizedDescription = sanitizeString(description)
    const result = collectionFormSchema.safeParse({
      name: sanitizedName,
      description: sanitizedDescription,
    })

    if (!result.success) {
      return
    }

    if (collection) {
      // Update existing collection
      updateCollection(collection.id, {
        name: result.data.name,
        description: result.data.description,
      })
      onSuccess?.()
    } else {
      // Create new collection
      const collectionId = addCollection({
        name: result.data.name,
        description: result.data.description,
        artworkIds: [],
      })
      onSuccess?.(collectionId)
    }

    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      onClick={handleBackdropClick}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
        }
      }}
      aria-hidden="true"
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="form-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
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
        <form 
          onSubmit={handleSubmit} 
          className="p-6 space-y-4" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div>
            <Label htmlFor="collection-name">
              Collection Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => {
                const value = e.target.value
                setName(value.length <= 100 ? value : name)
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="e.g., My Favorite Artworks"
              maxLength={100}
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
              onChange={(e) => {
                const value = e.target.value
                setDescription(value.length <= 1000 ? value : description)
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Describe your collection..."
              rows={4}
              maxLength={1000}
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
