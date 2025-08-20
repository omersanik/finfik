// Advanced image optimization utilities for lightning-fast loading

export const IMAGE_OPTIMIZATION_CONFIG = {
  // Ultra-fast blur placeholder (tiny, optimized JPEG)
  BLUR_DATA_URL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  
  // Responsive sizes for different image types
  SIZES: {
    THUMBNAIL: "(max-width: 768px) 100vw, 250px",
    COURSE_CARD: "(max-width: 768px) 100vw, 200px",
    CONTENT: "(max-width: 768px) 100vw, 350px",
    HERO: "(max-width: 768px) 100vw, 500px",
    ANIMATION: "(max-width: 768px) 100vw, 400px",
  },
  
  // Default dimensions for common image types
  DIMENSIONS: {
    THUMBNAIL: { width: 250, height: 250 },
    COURSE_CARD: { width: 200, height: 200 },
    CONTENT: { width: 350, height: 250 },
    HERO: { width: 500, height: 300 },
    ANIMATION: { width: 400, height: 300 },
  },

  // Performance settings
  PERFORMANCE: {
    PRELOAD_THRESHOLD: 100, // Start loading 100px before image enters viewport
    LAZY_LOAD_THRESHOLD: 50, // Start lazy loading 50px before image enters viewport
    PRIORITY_MARGIN: 200, // Larger margin for priority images
    TRANSITION_DURATION: 300, // Smooth transition duration in ms
  }
};

// Helper function to get ultra-optimized image props
export const getUltraOptimizedImageProps = (
  src: string,
  alt: string,
  type: keyof typeof IMAGE_OPTIMIZATION_CONFIG.DIMENSIONS,
  priority: boolean = false
) => {
  const dimensions = IMAGE_OPTIMIZATION_CONFIG.DIMENSIONS[type];
  const sizes = IMAGE_OPTIMIZATION_CONFIG.SIZES[type];
  
  return {
    src,
    alt,
    ...dimensions,
    priority,
    sizes,
    className: "object-cover rounded-lg transition-all duration-300 ease-out",
    style: {
      imageRendering: 'auto',
      imageRendering: '-webkit-optimize-contrast',
      imageRendering: 'crisp-edges',
    }
  };
};

// Helper for content images (most common use case)
export const getContentImageProps = (src: string, alt: string = "Course content image") => {
  return getUltraOptimizedImageProps(src, alt, "CONTENT", false);
};

// Helper for priority images (above the fold)
export const getPriorityImageProps = (src: string, alt: string, type: keyof typeof IMAGE_OPTIMIZATION_CONFIG.DIMENSIONS = "CONTENT") => {
  return getUltraOptimizedImageProps(src, alt, type, true);
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

// Batch preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.allSettled(promises); // Use allSettled to not fail if one image fails
};

// Check if image is in viewport
export const isImageInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Get optimal image format based on browser support
export const getOptimalImageFormat = (): string => {
  if (typeof window === 'undefined') return 'webp';
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return 'webp';
  
  try {
    // Test WebP support
    canvas.width = 1;
    canvas.height = 1;
    context.fillStyle = 'red';
    context.fillRect(0, 0, 1, 1);
    
    const webpDataURL = canvas.toDataURL('image/webp');
    if (webpDataURL.indexOf('data:image/webp') === 0) {
      return 'webp';
    }
    
    // Test AVIF support
    const avifDataURL = canvas.toDataURL('image/avif');
    if (avifDataURL.indexOf('data:image/avif') === 0) {
      return 'avif';
    }
  } catch (e) {
    // Fallback to WebP
  }
  
  return 'webp';
};
