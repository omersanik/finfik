"use client";

import { useEffect, useState } from 'react';

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalLoadTime: number;
  imagesInView: number;
  imagesPreloaded: number;
}

export default function ImagePerformanceTracker() {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
    imagesInView: 0,
    imagesPreloaded: 0,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let totalLoadTime = 0;
    let loadedCount = 0;
    let failedCount = 0;
    let preloadedCount = 0;

    const handleImageLoad = (startTime: number) => {
      const loadTime = performance.now() - startTime;
      totalLoadTime += loadTime;
      loadedCount++;
      
      setMetrics(prev => ({
        ...prev,
        loadedImages: loadedCount,
        totalLoadTime,
        averageLoadTime: totalLoadTime / loadedCount,
      }));
    };

    const handleImageError = () => {
      failedCount++;
      setMetrics(prev => ({
        ...prev,
        failedImages: failedCount,
      }));
    };

    const handleImagePreload = () => {
      preloadedCount++;
      setMetrics(prev => ({
        ...prev,
        imagesPreloaded: preloadedCount,
      }));
    };

    // Track all images
    const images = document.querySelectorAll('img');
    setMetrics(prev => ({ ...prev, totalImages: images.length }));

    images.forEach((img) => {
      const startTime = performance.now();
      
      if (img.complete) {
        handleImageLoad(startTime);
      } else {
        img.addEventListener('load', () => handleImageLoad(startTime));
        img.addEventListener('error', handleImageError);
      }

      // Track preloaded images
      if (img.loading === 'lazy') {
        handleImagePreload();
      }
    });

    // Track images in viewport
    const observer = new IntersectionObserver((entries) => {
      const inViewCount = entries.filter(entry => entry.isIntersecting).length;
      setMetrics(prev => ({ ...prev, imagesInView: inViewCount }));
    });

    images.forEach(img => observer.observe(img));

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', () => {});
        img.removeEventListener('error', handleImageError);
      });
      observer.disconnect();
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold">🚀 Image Performance</div>
      <div className="space-y-1">
        <div>Total: {metrics.totalImages}</div>
        <div>Loaded: {metrics.loadedImages}</div>
        <div>Failed: {metrics.failedImages}</div>
        <div>Preloaded: {metrics.imagesPreloaded}</div>
        <div>In View: {metrics.imagesInView}</div>
        <div>Avg Time: {metrics.averageLoadTime.toFixed(0)}ms</div>
        <div>Total Time: {metrics.totalLoadTime.toFixed(0)}ms</div>
      </div>
    </div>
  );
}
