"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  placeholder = "course-slug/image-name.jpg",
  className = ""
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    await uploadImage(file);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);
    await uploadImage(file);
  }, []);

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `admin-upload-${timestamp}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('thumbnail') // Using your existing bucket
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnail')
        .getPublicUrl(fileName);

      // Call the callback with the new image URL
      onImageUploaded(publicUrl);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onImageUploaded('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Image Upload</Label>
      
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="relative inline-block">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-32 h-32 object-cover rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Drop an image here</span> or{' '}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <Input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Manual Path Input (Fallback) */}
      <div className="space-y-2">
        <Label htmlFor="manual-path">Or enter image path manually:</Label>
        <Input
          id="manual-path"
          placeholder={placeholder}
          defaultValue={currentImageUrl || ''}
          onChange={(e) => onImageUploaded(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Format: course-slug/filename.ext (e.g., finance-101/chart1.png)
        </p>
      </div>
    </div>
  );
}
