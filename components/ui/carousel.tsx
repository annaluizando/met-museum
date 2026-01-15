'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils/cn'

interface CarouselProps {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  showControls?: boolean
}

export function Carousel({
  children,
  className,
  itemClassName,
  showControls = true,
}: CarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const items = Array.isArray(children) ? children : [children]
  const itemCount = items.length

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 10) // Small threshold for edge cases
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    
    let maxVisibleArea = 0
    
    itemRefs.current.forEach((itemRef) => {
      if (!itemRef || !container) return
      
      const itemRect = itemRef.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      // Calculate visible area of the item within the container
      const itemLeft = Math.max(itemRect.left, containerRect.left)
      const itemRight = Math.min(itemRect.right, containerRect.right)
      const visibleWidth = Math.max(0, itemRight - itemLeft)
      
      if (visibleWidth > maxVisibleArea) {
        maxVisibleArea = visibleWidth
      }
    })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollability()
    container.addEventListener('scroll', checkScrollability)
    window.addEventListener('resize', checkScrollability)

    return () => {
      container.removeEventListener('scroll', checkScrollability)
      window.removeEventListener('resize', checkScrollability)
    }
  }, [itemCount]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.scrollWidth / itemCount
    const scrollAmount = itemWidth * 2 // Scroll 2 items at a time

    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scroll('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scroll('right')
    }
  };

  return (
    <div className={cn('relative z-0', className)}>
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Carousel"
      >
        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            className={cn('shrink-0 snap-start', itemClassName)}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && itemCount > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-0 bg-white dark:bg-zinc-900 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800',
              !canScrollLeft && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-0 bg-white dark:bg-zinc-900 shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800',
              !canScrollRight && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </>
      )}
    </div>
  )
};
