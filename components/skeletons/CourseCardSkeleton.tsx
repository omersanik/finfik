import { Skeleton } from "@/components/ui/skeleton";

const CourseCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      {/* Thumbnail Skeleton */}
      <div className="relative h-48 bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title Skeleton */}
        <Skeleton className="w-3/4 h-6 mb-3" />
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-4/6 h-4" />
        </div>
        
        {/* Level Badge Skeleton */}
        <Skeleton variant="circular" className="w-16 h-6 mb-4" />
        
        {/* Button Skeleton */}
        <Skeleton variant="default" className="w-full h-10" />
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
