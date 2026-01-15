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
      "overflow-hidden h-full",
      isListView && "flex flex-row"
    )}>
      {/* Image Skeleton */}
      <Skeleton className={cn(
        isListView ? "w-48 h-48 shrink-0" : "aspect-square w-full",
        "rounded-none"
      )} />

      {/* Content Skeleton */}
      <div className={cn("flex flex-col", isListView && "flex-1")}>
        <CardContent className={cn("flex-1", isListView ? "p-4" : "p-4")}>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-1/3 mb-2" />
          
          {isListView && (
            <div className="mt-2 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
        </CardContent>

        <CardFooter className={cn("px-4 pb-4 pt-0")}>
          <Skeleton className="h-3 w-24" />
        </CardFooter>
      </div>
    </Card>
  )
}
