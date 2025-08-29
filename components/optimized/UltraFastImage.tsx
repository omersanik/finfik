"use client";

import React from "react";
import { useImagePreloader } from "@/lib/hooks/useImagePreloader";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface UltraFastImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function UltraFastImage({
  src,
  alt,
  width = 350,
  height = 250,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 350px",
  placeholder = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  onLoad,
  onError,
}: UltraFastImageProps) {
  const { isLoaded, isInView, hasError, imgRef } = useImagePreloader(src, {
    priority,
    rootMargin: priority ? "200px" : "50px", // Larger margin for priority images
  });

  // Show skeleton while loading
  if (!isInView || !isLoaded) {
    return (
      <div ref={imgRef} className={`relative ${className}`}>
        <Skeleton className="w-full h-full rounded-lg animate-pulse" />

        {/* Show placeholder when in view but not loaded */}
        {isInView && !isLoaded && (
          <Image
            src={placeholder}
            alt={`${alt} (loading)`}
            width={width}
            height={height}
            className={`${className} absolute inset-0 object-cover rounded-lg opacity-50`}
          />
        )}
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center`}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image failed to load</div>
        </div>
      </div>
    );
  }

  // Show optimized image with smooth transition
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`${className} transition-all duration-300 ease-out transform scale-100 hover:scale-105`}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      onLoad={onLoad}
      onError={onError}
      style={{
        imageRendering: "auto",
        imageRendering: "-webkit-optimize-contrast",
        imageRendering: "crisp-edges",
      }}
    />
  );
}
