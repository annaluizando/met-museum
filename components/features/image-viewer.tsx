'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
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

  const minZoom = 1
  const maxZoom = 4
  const zoomStep = 0.5

  // Handle escape key to close fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, zoom])

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

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - zoomStep, minZoom)
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isFullscreen) return
      
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    },
    [isFullscreen, handleZoomIn, handleZoomOut]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || zoom <= 1) return
      
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart, zoom]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom <= 1) return
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      })
    },
    [zoom, position]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || zoom <= 1) return
      
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart, zoom]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <>
      {/* Thumbnail with fullscreen button */}
      <div className="relative group">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        
        {/* Fullscreen button overlay */}
        <button
          onClick={openFullscreen}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 focus-visible:ring-inset"
          aria-label="View fullscreen"
        >
          <div className="bg-white dark:bg-zinc-800 rounded-full p-3 shadow-lg">
            <Maximize2 className="w-6 h-6 text-zinc-900 dark:text-zinc-200" aria-hidden="true" />
          </div>
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
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
                onClick={handleZoomOut}
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
                onClick={handleZoomIn}
                disabled={zoom >= maxZoom}
                aria-label="Zoom in"
                title="Zoom in (+)"
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={closeFullscreen}
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
              "relative w-full h-full flex items-center justify-center overflow-hidden",
              zoom > 1 && "cursor-move"
            )}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="relative transition-transform duration-200"
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
                className="object-contain"
                sizes="100vw"
                priority
                quality={100}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 text-white/70 text-xs space-y-1 hidden md:block">
            <p>Scroll or use +/- keys to zoom</p>
            <p>Click and drag to pan when zoomed</p>
            <p>Press Esc to close</p>
          </div>
        </div>
      )}
    </>
  )
}
