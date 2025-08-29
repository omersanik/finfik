"use client";

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV === 'production') {
      // Core Web Vitals
      onCLS(console.log);
      onINP(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    }
  }, []);

  return null; // This component doesn't render anything
}
