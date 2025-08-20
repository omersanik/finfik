import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MainCardSkeleton() {
  return (
    <Card className="w-full max-w-lg shadow-2xl relative">
      {/* Course Level Badge Skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      
      <CardHeader>
        <div className="flex items-center gap-2 justify-center">
          {/* Title Skeleton */}
          <Skeleton className="w-48 h-6 rounded" />
          {/* Premium Badge Skeleton */}
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </CardHeader>
      
      {/* Thumbnail Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-[250px] h-[250px] rounded-lg" />
      </div>
      
      <CardContent>
        {/* Description Skeleton */}
        <div className="text-center p-3">
          <Skeleton className="w-full h-4 rounded mb-2" />
          <Skeleton className="w-3/4 h-4 rounded mx-auto" />
        </div>
        
        {/* Progress Bar Skeleton */}
        <div className="mb-4 px-4">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-8 h-4 rounded" />
          </div>
          <Skeleton className="w-full h-2 rounded" />
        </div>
        
        {/* Button Skeleton */}
        <Skeleton className="w-full h-10 rounded" />
      </CardContent>
    </Card>
  );
}
