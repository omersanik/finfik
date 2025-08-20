import { Skeleton } from "@/components/ui/skeleton";

const NavbarSkeleton = () => {
  return (
    <header className="w-full border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Left: Logo Skeleton */}
        <div className="flex items-center">
          <Skeleton className="w-[100px] h-[50px] rounded-md" />
        </div>

        {/* Center: Navigation Links Skeleton */}
        <nav className="hidden sm:flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-12 h-6 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-16 h-6 rounded" />
          </div>
        </nav>

        {/* Right: Premium Button/Badge, Theme Toggle, Avatar Skeleton */}
        <div className="flex items-center justify-center gap-4">
          {/* Streak Counter Skeleton - matches the gradient badge style */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full text-sm font-semibold shadow-md">
            <Skeleton variant="circular" className="w-4 h-4" />
            <Skeleton variant="text" className="w-6 h-4" />
          </div>
          
          {/* Premium Button/Badge Skeleton - matches the button/badge style */}
          <Skeleton variant="circular" className="w-28 h-8" />
          
          {/* Theme Toggle Skeleton */}
          <Skeleton variant="default" className="w-10 h-10" />
          
          {/* Avatar Skeleton */}
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </div>
    </header>
  );
};

export default NavbarSkeleton;
