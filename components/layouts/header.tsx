'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Library } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/themeToggle'
import { cn } from '@/lib/utils/cn'

const navigation = [
  { name: 'Explore', href: '/' },
  { name: 'Collections', href: '/collections' },
]

/**
 * App header with navigation
 * Implements accessible navigation with current page indicator
 */
export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-zinc-950/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-200 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2 rounded-md"
            aria-label="MetMuseum Explorer - Home"
          >
            <Library className="w-6 h-6" aria-hidden="true" />
            <span>MetMuseum</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-offset-2",
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              )
            })}
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  )
}
