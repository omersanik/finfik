import { Skeleton } from "@/components/ui/skeleton";

const LandingPageSkeleton = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Top navigation skeleton */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto flex justify-between items-center pt-8 px-8">
        {/* Logo skeleton */}
        <Skeleton className="w-32 h-12 rounded" />
        
        {/* Navigation buttons skeleton */}
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" className="w-20 h-10" />
          <Skeleton variant="circular" className="w-24 h-10" />
        </div>
      </nav>

      {/* Hero Section skeleton */}
      <section className="relative z-30 flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        {/* Title skeleton */}
        <Skeleton className="w-4/5 h-16 mb-6" />
        
        {/* Subtitle skeleton */}
        <Skeleton className="w-3/4 h-8 mb-8" />
        
        {/* CTA button skeleton */}
        <Skeleton variant="circular" className="w-48 h-14" />
      </section>

      {/* Features section skeleton */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section title skeleton */}
          <Skeleton className="w-64 h-12 mx-auto mb-16" />
          
          {/* Features grid skeleton */}
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
                <Skeleton className="w-32 h-6 mx-auto mb-3" />
                <Skeleton className="w-full h-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses section skeleton */}
      <section className="py-20 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          {/* Section title skeleton */}
          <Skeleton className="w-48 h-12 mx-auto mb-16" />
          
          {/* Courses grid skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="w-3/4 h-6 mb-3" />
                  <Skeleton className="w-full h-16 mb-4" />
                  <Skeleton className="w-full h-10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="relative z-10 py-16 px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <Skeleton className="w-24 h-8 mb-6 md:mb-0" />
          <div className="text-center md:text-right">
            <Skeleton className="w-48 h-4 mb-2" />
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageSkeleton;
