'use client';

import { Suspense } from 'react';
import LoadingAnimation from './LoadingAnimation';

interface SectionLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SectionLoading = ({ 
  message = "Loading...", 
  size = 'medium', 
  className = '' 
}: SectionLoadingProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Suspense fallback={<div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>}>
        <LoadingAnimation size={size} />
      </Suspense>
      {message && (
        <p className="mt-4 text-gray-600 dark:text-neutral-400 text-sm">
          {message}
        </p>
      )}
    </div>
  );
};

export default SectionLoading; 