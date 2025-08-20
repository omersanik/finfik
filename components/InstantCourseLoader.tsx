"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CourseDetailSkeleton from './skeletons/CourseDetailSkeleton';

export default function InstantCourseLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for navigation events
    const handleStart = (url: string) => {
      if (url.includes('/courses/') && !url.includes('/courses/')) {
        const slug = url.split('/courses/')[1];
        if (slug) {
          setLoadingSlug(slug);
          setIsLoading(true);
        }
      }
    };

    const handleComplete = () => {
      setIsLoading(false);
      setLoadingSlug(null);
    };

    // Add navigation event listeners
    window.addEventListener('beforeunload', () => setIsLoading(false));
    
    // Listen for route changes
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      const url = args[2] as string;
      if (url && url.includes('/courses/')) {
        handleStart(url);
      }
    };

    return () => {
      window.removeEventListener('beforeunload', () => setIsLoading(false));
      history.pushState = originalPushState;
    };
  }, []);

  // Show skeleton immediately when loading
  if (isLoading && loadingSlug) {
    return <CourseDetailSkeleton />;
  }

  return null;
}
