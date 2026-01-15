'use client'

import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation dialog component matching app design
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
      onClick={onCancel}
    >
      <Card 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {variant === 'destructive' && (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            )}
            <h2 id="confirm-title" className="text-xl font-semibold text-zinc-900 dark:text-zinc-200">
              {title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Close dialog"
            className="h-7 w-7"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p id="confirm-message" className="text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}
