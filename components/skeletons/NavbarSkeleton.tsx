import { Skeleton } from "@/components/ui/skeleton";

const NavbarSkeleton = () => {
  return (
    <header className="w-full border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Left: Logo Skeleton */}
        <div className="flex items-center">
          <Skeleton className="w-[140px] h-[100px] rounded-lg" />
        </div>

        {/* Center: Navigation Links Skeleton */}
        <nav className="hidden sm:flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-14 h-5 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-20 h-5 rounded" />
          </div>
        </nav>

        {/* Right: Premium Button/Badge, Theme Toggle, Avatar Skeleton */}
        <div className="flex items-center justify-center gap-4">
          {/* Streak Counter Skeleton - Facebook style */}
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
          
          {/* Premium Button/Badge Skeleton - Facebook style */}
          <Skeleton className="w-24 h-9 rounded-full" />
          
          {/* Theme Toggle Skeleton */}
          <Skeleton className="w-9 h-9 rounded-lg" />
          
          {/* Avatar Skeleton */}
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>
    </header>
  );
};

export default NavbarSkeleton;
