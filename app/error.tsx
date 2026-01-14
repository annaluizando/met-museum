'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

/**
 * Global error boundary
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="rounded-full bg-red-50 p-6 mb-6">
          <AlertTriangle className="w-16 h-16 text-red-600" aria-hidden="true" />
        </div>
        
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Something went wrong!
        </h2>
        
        <p className="text-zinc-600 mb-8">
          We encountered an unexpected error. Don't worry, we're working on it.
        </p>

        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  )
}
