'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingAnimation from './LoadingAnimation';

const PageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading when route changes
    setIsLoading(true);
    
    // Hide loading after a short delay to show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <Suspense fallback={<div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>}>
          <LoadingAnimation size="large" />
        </Suspense>
        <p className="mt-4 text-gray-600 dark:text-neutral-400 text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default PageLoading; 