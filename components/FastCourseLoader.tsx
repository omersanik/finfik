"use client";

import { useEffect, useState } from 'react';
import CourseDetailSkeleton from './skeletons/CourseDetailSkeleton';

export default function FastCourseLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading state immediately when component mounts
    setIsLoading(true);
    
    // Hide loading after a very brief moment
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 25); // Super fast - only 25ms!

    return () => clearTimeout(timer);
  }, []);

  // Show skeleton immediately
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  return null;
}
