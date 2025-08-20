import { Skeleton } from "@/components/ui/skeleton";

export default function MainPageSkeleton() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>
      
      {/* Main card and streak section skeleton */}
      <div className="mx-10 mb-8 flex flex-col md:flex-row md:items-start justify-center gap-2">
        <div className="flex-1 max-w-xl">
          <Skeleton className="w-full h-[400px] rounded-xl" />
        </div>
        <div className="flex-shrink-0">
          <Skeleton className="w-[300px] h-[200px] rounded-xl" />
        </div>
      </div>

      {/* Your Courses section skeleton */}
      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-12 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full h-[300px] rounded-xl" />
        ))}
      </div>
      
      <div className="text-center py-4 px-12">
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
    </main>
  );
}
