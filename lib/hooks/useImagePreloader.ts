import { useEffect, useRef, useState, useCallback } from "react";

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

  const { threshold = 0.1, rootMargin = "50px", priority = false } = options;

  const startLoading = useCallback(() => {
    if (!src || hasError) return;

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

    img.src = src;
  }, [src, hasError]);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (priority) startLoading();
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, priority, startLoading]);

  useEffect(() => {
    if (isInView && !priority) {
      startLoading();
    }
  }, [isInView, priority, startLoading]);

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
