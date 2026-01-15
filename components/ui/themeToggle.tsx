'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import { Button } from '@/components/ui/button'

/**
 * Theme toggle button with system preference detection
 * Supports light, dark, and system modes
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Toggle theme">
        <Sun className="h-5 w-5" aria-hidden="true" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      return;
    } 
    
    if (theme === 'dark') {
      setTheme('light');
      return;
    }

    setTheme('dark');
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark mode (click for light)'
    return 'Light mode (click for dark)'
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {isDark ? (
        <Moon className="h-5 w-5 text-zinc-100" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  )
}
