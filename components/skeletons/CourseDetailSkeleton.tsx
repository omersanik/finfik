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

          {/* Learning Path - Right Side */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <Skeleton className="w-64 h-8 rounded mb-4" />
              <Skeleton className="w-full h-4 rounded mb-2" />
              <Skeleton className="w-3/4 h-4 rounded" />
            </div>

            {/* Learning Path Steps */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  {/* Step Number */}
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-48 h-5 rounded" />
                    <Skeleton className="w-full h-4 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="w-20 h-6 rounded-full" />
                      <Skeleton className="w-24 h-6 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Status */}
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
