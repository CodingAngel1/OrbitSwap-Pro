/**
 * OrbitSwap Pro - Skeleton Component
 *
 * Loading skeleton placeholder for content that is being fetched.
 */

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * Skeleton loading placeholder component.
 */
export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-800 rounded-lg";
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  const style = {
    width: width || (variant === "circular" ? "40px" : "100%"),
    height: height || (variant === "text" ? "16px" : variant === "circular" ? "40px" : "100px"),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * Swap interface skeleton.
 */
export function SwapSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20" />
      <div className="flex justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-20" />
      <Skeleton className="h-12" />
      <Skeleton className="h-10" count={3} />
    </div>
  );
}

/**
 * Market info skeleton.
 */
export function MarketSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

/**
 * Transaction history skeleton.
 */
export function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
