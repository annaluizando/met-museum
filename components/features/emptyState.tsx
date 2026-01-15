import { Button } from '@/components/ui/button'
import { SearchX, PackageOpen, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  type?: 'search' | 'collection' | 'error'
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Reusable empty state component with different visual states
 */
export function EmptyState({ 
  type = 'search', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  const icons = {
    search: SearchX,
    collection: PackageOpen,
    error: AlertCircle,
  }

  const Icon = icons[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status" aria-live="polite">
      <div className="rounded-full p-6 mb-4 bg-zinc-100 dark:bg-zinc-800" aria-hidden="true">
        <Icon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-200">
        {title}
      </h3>
      
      <p className="max-w-md mb-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}
