import { Heart } from 'lucide-react'

/**
 * App footer with credits and links
 */
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Built with <Heart className="inline w-4 h-4 text-red-500" aria-hidden="true" /> using{' '}
            <a
              href="https://metmuseum.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline"
            >
              The Met Collection API
            </a>
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-600">
            © {new Date().getFullYear()} MetMuseum Explorer. Data provided by The Metropolitan Museum of Art.
          </p>
        </div>
      </div>
    </footer>
  )
}
