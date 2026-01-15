'use client'

import { useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

/**
 * Custom hook for theme management using Tailwind's dark mode
 * Persists theme preference in localStorage
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Get resolved theme (actual theme being displayed)
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'system') return getSystemTheme()
    return theme
  }

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme

    if (resolved === 'dark') {
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
    const initialTheme = stored || 'system'
    setTimeout(() => {
      setThemeState(initialTheme)
      applyTheme(initialTheme)
      setMounted(true)
    }, 0)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const currentTheme = stored || 'system'
      if (currentTheme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [applyTheme])

  // Update when theme changes
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
