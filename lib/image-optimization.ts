// Image optimization utilities for consistent performance across the app

export const IMAGE_OPTIMIZATION_CONFIG = {
  // Blur placeholder data URL (tiny, optimized JPEG)
  BLUR_DATA_URL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  
  // Responsive sizes for different image types
  SIZES: {
    THUMBNAIL: "(max-width: 768px) 100vw, 250px",
    COURSE_CARD: "(max-width: 768px) 100vw, 200px",
    CONTENT: "(max-width: 768px) 100vw, 350px",
    HERO: "(max-width: 768px) 100vw, 500px",
  },
  
  // Default dimensions for common image types
  DIMENSIONS: {
    THUMBNAIL: { width: 250, height: 250 },
    COURSE_CARD: { width: 200, height: 200 },
    CONTENT: { width: 350, height: 250 },
    HERO: { width: 500, height: 300 },
  }
};

// Helper function to get optimized image props
export const getOptimizedImageProps = (
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
    loading: priority ? undefined : "lazy" as const,
    placeholder: "blur" as const,
    blurDataURL: IMAGE_OPTIMIZATION_CONFIG.BLUR_DATA_URL,
    sizes,
    className: "object-cover rounded-lg",
  };
};

// Helper for course thumbnails
export const getCourseThumbnailProps = (src: string, title: string, priority: boolean = false) => {
  return getOptimizedImageProps(src, `${title} course thumbnail`, "THUMBNAIL", priority);
};

// Helper for course card images
export const getCourseCardProps = (src: string, title: string) => {
  return getOptimizedImageProps(src, `${title} course thumbnail`, "COURSE_CARD", false);
};

// Helper for content images
export const getContentImageProps = (src: string, alt: string = "Course content image") => {
  return getOptimizedImageProps(src, alt, "CONTENT", false);
};
