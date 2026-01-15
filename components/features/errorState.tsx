import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

/**
 * Error state component with retry functionality
 */
export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-red-50 dark:bg-red-950/30 p-6 mb-4">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" aria-hidden="true" />
      </div>
      
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-200 mb-2">
        {title}
      </h3>
      
      <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
        {message}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      )}
    </div>
  )
}
