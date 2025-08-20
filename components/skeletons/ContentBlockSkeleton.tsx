import { Skeleton } from "@/components/ui/skeleton";

const ContentBlockSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto mb-6 p-6">
      {/* Title Skeleton */}
      <Skeleton className="w-3/4 h-8 mb-4" />
      
      {/* Content Items Skeleton */}
      <div className="space-y-4">
        {/* Text Content Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-4/6 h-4" />
        </div>
        
        {/* Image Content Skeleton */}
        <Skeleton className="w-full h-48 rounded-lg" />
        
        {/* Quiz Content Skeleton */}
        <div className="space-y-3">
          <Skeleton className="w-full h-5" />
          <div className="space-y-2">
            <Skeleton className="w-full h-10 rounded-md" />
            <Skeleton className="w-full h-10 rounded-md" />
            <Skeleton className="w-full h-10 rounded-md" />
          </div>
        </div>
      </div>
      
              {/* Continue Button Skeleton */}
        <div className="flex justify-end mt-4">
          <Skeleton variant="default" className="w-24 h-10" />
        </div>
    </div>
  );
};

export default ContentBlockSkeleton;
