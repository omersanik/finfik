import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
          {/* Course Information Card - Left Side */}
          <div className="flex-shrink-0">
            <div className="w-[500px] h-[500px]">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          </div>

          {/* Learning Path - Right Side - NO SKELETON */}
          <div className="flex-1 min-w-0">
            {/* Empty space - no skeleton here for instant loading */}
          </div>
        </div>
      </div>
    </main>
  );
}
