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

export function getThumbnailPath(courseSlug: string, filename: string): string {
  return `${courseSlug}/${filename}`;
}

// Example usage:
// const thumbnailUrl = getThumbnailUrl('finance-lingo-101/thumbnail.jpg');
// This will generate: https://your-project.supabase.co/storage/v1/object/public/thumbnail/finance-lingo-101/thumbnail.jpg 