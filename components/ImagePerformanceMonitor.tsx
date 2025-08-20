"use client";

import { useEffect, useState } from 'react';

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalLoadTime: number;
}

export default function ImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const images = document.querySelectorAll('img');
    let totalLoadTime = 0;
    let loadedCount = 0;
    let failedCount = 0;

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

    images.forEach((img) => {
      const startTime = performance.now();
      
      if (img.complete) {
        handleImageLoad(startTime);
      } else {
        img.addEventListener('load', () => handleImageLoad(startTime));
        img.addEventListener('error', handleImageError);
      }
    });

    setMetrics(prev => ({
      ...prev,
      totalImages: images.length,
    }));

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', () => {});
        img.removeEventListener('error', handleImageError);
      });
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">🖼️ Image Performance</div>
      <div>Total: {metrics.totalImages}</div>
      <div>Loaded: {metrics.loadedImages}</div>
      <div>Failed: {metrics.failedImages}</div>
      <div>Avg Time: {metrics.averageLoadTime.toFixed(0)}ms</div>
      <div>Total Time: {metrics.totalLoadTime.toFixed(0)}ms</div>
    </div>
  );
}
