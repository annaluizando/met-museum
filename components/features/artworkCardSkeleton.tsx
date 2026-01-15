import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

interface ArtworkCardSkeletonProps {
  viewMode?: 'grid' | 'list'
}

/**
 * Loading skeleton for artwork cards
 */
export function ArtworkCardSkeleton({ viewMode = 'grid' }: ArtworkCardSkeletonProps) {
  const isListView = viewMode === 'list'

  return (
    <Card className={cn(
      "overflow-hidden h-full flex flex-col",
      isListView && "flex-row"
    )}>
      {/* Image Skeleton */}
      <div className={cn(
        "relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden",
        isListView ? "w-48 h-48 shrink-0" : "aspect-square w-full"
      )}>
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Content Skeleton */}
      <div className={cn("flex flex-col flex-1", isListView && "flex-1")}>
        <CardContent className={cn("flex-1 flex flex-col justify-between", isListView ? "p-4" : "p-4")}>
          {/* Title */}
          <Skeleton className="h-6 w-3/4 mb-2" />
          
          {/* Artist */}
          <Skeleton className="h-4 w-1/2 mb-1" />
          
          {/* Date */}
          <Skeleton className="h-4 w-1/3 mb-2" />
          
          {/* Additional Info (only in list view) */}
          {isListView && (
            <div className="mt-2 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
        </CardContent>

        <CardFooter className={cn("px-4 pb-4 pt-0", isListView && "pb-4")}>
          <Skeleton className="h-3 w-24" />
        </CardFooter>
      </div>
    </Card>
  )
}
