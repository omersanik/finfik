// Utility functions for handling Supabase storage thumbnails

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const THUMBNAIL_BUCKET = 'thumbnails';

export function getThumbnailUrl(thumbnailPath: string | null): string {
  if (!thumbnailPath || !SUPABASE_URL) {
    return '/fallback-image.png'; // Fallback image
  }

  // If it's already a full URL, return as is
  if (thumbnailPath.startsWith('http')) {
    return thumbnailPath;
  }

  // Clean the path to remove any leading/trailing slashes and spaces
  const cleanPath = thumbnailPath.trim().replace(/^\/+|\/+$/g, '');
  
  // Generate Supabase storage URL
  return `${SUPABASE_URL}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${cleanPath}`;
}

export function getContentImageUrl(imagePath: string | null): string {
  if (!imagePath || !SUPABASE_URL) {
    return '/placeholder-image.jpg'; // Fallback image
  }

  // If it's already a full URL, check if it's pointing to the wrong bucket
  if (imagePath.startsWith('http')) {
    // If the URL contains 'course-content-images', replace it with 'thumbnails'
    if (imagePath.includes('course-content-images')) {
      return imagePath.replace('course-content-images', 'thumbnails');
    }
    return imagePath;
  }

  // Clean the path to remove any leading/trailing slashes and spaces
  const cleanPath = imagePath.trim().replace(/^\/+|\/+$/g, '');
  
  // Generate Supabase storage URL - use the same bucket as thumbnails
  return `${SUPABASE_URL}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${cleanPath}`;
}

export function getThumbnailPath(courseSlug: string, filename: string): string {
  return `${courseSlug}/${filename}`;
}

export function getContentImagePath(courseSlug: string, filename: string): string {
  return `${courseSlug}/${filename}`;
}

// Example usage:
// const thumbnailUrl = getThumbnailUrl('finance-lingo-101/thumbnail.jpg');
// This will generate: https://your-project.supabase.co/storage/v1/object/public/thumbnail/finance-lingo-101/thumbnail.jpg 

// Example usage for content images:
// const contentImageUrl = getContentImageUrl('finance-lingo-101/image1.jpg');
// This will generate: https://your-project.supabase.co/storage/v1/object/public/thumbnails/finance-lingo-101/image1.jpg 