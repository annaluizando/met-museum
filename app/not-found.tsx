import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

/**
 * Custom 404 page
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-zinc-200 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to exploring art!
        </p>
        <Link href="/">
          <Button size="lg">
            <Home className="w-5 h-5 mr-2" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
