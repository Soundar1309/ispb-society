import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'grid' | 'table' | 'profile' | 'page';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = 'card', count = 3, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'page') {
    return (
      <div className={cn("min-h-screen bg-background animate-fade-in", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((i) => (
              <CardSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {items.map((i) => (
          <CardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((i) => (
          <ListItemSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-12 w-full rounded-lg" />
        {items.map((i) => (
          <Skeleton 
            key={i} 
            className="h-16 w-full rounded-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
        {items.map((i) => (
          <ProfileSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {items.map((i) => (
        <CardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

function CardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-card rounded-xl border border-border p-6 space-y-4 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ListItemSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
  );
}

function ProfileSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-card rounded-xl border border-border p-6 text-center space-y-4 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-5 w-32 mx-auto" />
      <Skeleton className="h-4 w-24 mx-auto" />
      <Skeleton className="h-3 w-40 mx-auto" />
    </div>
  );
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div className={cn(
      "border-primary/20 border-t-primary rounded-full animate-spin",
      sizeClasses[size]
    )} />
  );
}
