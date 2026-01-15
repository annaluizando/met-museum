'use client'

import { ErrorState } from '@/components/features/errorState'
import { getErrorMessage } from '@/lib/utils/error-handler'

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
  const errorInfo = getErrorMessage(error)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <ErrorState
        title={errorInfo.title}
        message={errorInfo.message}
        onRetry={reset}
      />
    </div>
  )
}
