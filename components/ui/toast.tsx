'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { UI_CONFIG } from '@/lib/constants/config'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ message, duration = UI_CONFIG.TOAST_DEFAULT_DURATION, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, UI_CONFIG.TOAST_FADE_OUT_DELAY)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md',
        isVisible ? 'slide-in-from-bottom-2 fade-in' : 'slide-out-to-bottom-2 fade-out',
        'transition-all duration-200'
      )}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm text-zinc-900 dark:text-zinc-200">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, UI_CONFIG.TOAST_CLOSE_DELAY)
        }}
        className="shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
