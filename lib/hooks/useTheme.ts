'use client'

import { useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

/**
 * Custom hook for theme management using Tailwind's dark mode
 * Persists theme preference in localStorage
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Get resolved theme (actual theme being displayed)
  const getResolvedTheme = (): 'light' | 'dark' => {
    return theme
  }

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const initialTheme = stored || 'dark'
    setTimeout(() => {
      setThemeState(initialTheme)
      applyTheme(initialTheme)
      setMounted(true)
    }, 0)
  }, [applyTheme])

  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
    }
  }, [theme, mounted, applyTheme])

  return {
    theme,
    setTheme,
    resolvedTheme: getResolvedTheme(),
    mounted,
  }
}
