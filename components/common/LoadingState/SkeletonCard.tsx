import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Props for the SkeletonCard component
 */
export interface SkeletonCardProps {
  /** Number of content lines to display */
  lines?: number
  /** Whether to show header skeleton */
  showHeader?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * SkeletonCard Component
 * 
 * Skeleton loader for card-based content.
 * 
 * @example
 * ```tsx
 * <SkeletonCard lines={3} showHeader />
 * ```
 */
export function SkeletonCard({
  lines = 3,
  showHeader = true,
  className = ""
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? "" : "pt-6"}>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-4 w-full"
              style={{
                width: index === lines - 1 ? "60%" : "100%"
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
