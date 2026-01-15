'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface ImageViewerProps {
  src: string
  alt: string
  title?: string
}

/**
 * Image viewer with fullscreen and zoom capabilities
 * Implements keyboard navigation (Escape, +/-, scroll wheel)
 */
export function ImageViewer({ src, alt, title }: ImageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isFullscreenImageLoading, setIsFullscreenImageLoading] = useState(true)
  const fullscreenDialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const minZoom = 1
  const maxZoom = 4
  const zoomStep = 0.5

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isFullscreen) return

    // Store the previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement

    // Focus the close button when fullscreen opens
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        setZoom(1)
        setPosition({ x: 0, y: 0 })
        setIsFullscreenImageLoading(false)
        previousActiveElementRef.current?.focus()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoom((prev) => Math.min(prev + zoomStep, maxZoom))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom((prev) => {
          const newZoom = Math.max(prev - zoomStep, minZoom)
          if (newZoom === minZoom) {
            setPosition({ x: 0, y: 0 })
          }
          return newZoom
        })
      }

      // Focus trap: keep focus within the dialog
      if (e.key === 'Tab') {
        const dialog = fullscreenDialogRef.current
        if (!dialog) return

        const focusableElements = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, zoomStep, maxZoom, minZoom])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  // Handle mouse up globally to properly release drag
  useEffect(() => {
    if (!isDragging) return

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging])

  return (
    <>
      {/* Thumbnail with fullscreen button */}
      <div className="relative group w-full h-full">
        {/* Loading skeleton */}
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600 animate-spin" aria-hidden="true" />
              <p className="text-sm text-zinc-500 dark:text-zinc-500">Loading image...</p>
            </div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            "object-contain transition-opacity duration-300",
            isImageLoading ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
        
        {/* Fullscreen button overlay */}
        {!isImageLoading && (
          <button
            onClick={() => {
              setIsFullscreen(true)
              setZoom(1)
              setPosition({ x: 0, y: 0 })
              setIsFullscreenImageLoading(true)
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-inset"
            aria-label="View fullscreen"
          >
            <div className="bg-white dark:bg-zinc-800 rounded-full p-3 shadow-lg">
              <Maximize2 className="cursor-pointer w-6 h-6 text-zinc-900 dark:text-zinc-200" aria-hidden="true" />
            </div>
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          ref={fullscreenDialogRef}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-lg p-2 flex items-center gap-2 shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newZoom = Math.max(zoom - zoomStep, minZoom)
                  setZoom(newZoom)
                  if (newZoom === minZoom) {
                    setPosition({ x: 0, y: 0 })
                  }
                }}
                disabled={zoom <= minZoom}
                aria-label="Zoom out"
                title="Zoom out (-)"
              >
                <ZoomOut className="w-5 h-5" aria-hidden="true" />
              </Button>
              
              <span className="text-sm font-medium min-w-[3ch] text-center text-zinc-900 dark:text-zinc-200">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((prev) => Math.min(prev + zoomStep, maxZoom))}
                disabled={zoom >= maxZoom}
                aria-label="Zoom in"
                title="Zoom in (+)"
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsFullscreen(false)
                setZoom(1)
                setPosition({ x: 0, y: 0 })
                setIsFullscreenImageLoading(false)
                previousActiveElementRef.current?.focus()
              }}
              className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur hover:bg-white dark:hover:bg-zinc-800 shadow-lg"
              aria-label="Close fullscreen"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Title */}
          {title && (
            <div className="absolute bottom-4 left-4 right-4 text-center z-10">
              <div className="bg-black/70 backdrop-blur text-white px-4 py-2 rounded-lg inline-block max-w-3xl">
                <p className="text-sm md:text-base">{title}</p>
              </div>
            </div>
          )}

          {/* Image Container */}
          <div
            className={cn(
              "relative w-full h-full flex items-center justify-center overflow-hidden select-none",
              zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            )}
            onWheel={(e) => {
              e.preventDefault()
              if (e.deltaY < 0) {
                setZoom((prev) => Math.min(prev + zoomStep, maxZoom))
              } else {
                const newZoom = Math.max(zoom - zoomStep, minZoom)
                setZoom(newZoom)
                if (newZoom === minZoom) {
                  setPosition({ x: 0, y: 0 })
                }
              }
            }}
            onMouseDown={(e) => {
              if (zoom <= 1) return
              setIsDragging(true)
              setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
              })
            }}
            onMouseMove={(e) => {
              if (!isDragging || zoom <= 1) return
              setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
              })
            }}
          >
            {/* Loading skeleton for fullscreen */}
            {isFullscreenImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-white animate-spin" aria-hidden="true" />
                  <p className="text-sm text-white/80">Loading...</p>
                </div>
              </div>
            )}
            
            <div
              className={cn(
                "relative transition-all duration-200 ease-out",
                isFullscreenImageLoading && "opacity-0"
              )}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                width: '90vw',
                height: '90vh',
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  isFullscreenImageLoading ? "opacity-0" : "opacity-100"
                )}
                sizes="100vw"
                priority
                quality={100}
                draggable={false}
                onLoad={() => setIsFullscreenImageLoading(false)}
                onError={() => setIsFullscreenImageLoading(false)}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-white/70 text-xs space-y-1 hidden md:block">
            <p>Scroll or use +/- keys to zoom</p>
            {zoom > 1 && <p>Click and drag to pan</p>}
            <p>Press Esc to close</p>
          </div>
        </div>
      )}
    </>
  )
}
