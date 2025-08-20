import { useEffect, useRef, useState } from 'react';

interface UseImagePreloaderOptions {
  threshold?: number;
  rootMargin?: string;
  priority?: boolean;
}

export function useImagePreloader(
  src: string,
  options: UseImagePreloaderOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const imgElement = useRef<HTMLImageElement | null>(null);

  const { threshold = 0.1, rootMargin = '50px', priority = false } = options;

  useEffect(() => {
    if (!imgRef.current) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // If priority, start loading immediately
          if (priority) {
            startLoading();
          }
          
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, priority]);

  const startLoading = () => {
    if (!src || hasError) return;

    // Create image element for preloading
    const img = new Image();
    imgElement.current = img;

    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    // Start loading
    img.src = src;
  };

  // Start loading when image comes into view
  useEffect(() => {
    if (isInView && !priority) {
      startLoading();
    }
  }, [isInView, priority]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (imgElement.current) {
        imgElement.current.onload = null;
        imgElement.current.onerror = null;
      }
    };
  }, []);

  return {
    isLoaded,
    isInView,
    hasError,
    imgRef,
    startLoading,
  };
}
