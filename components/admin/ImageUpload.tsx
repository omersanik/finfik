"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, FolderOpen } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  className = "",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [loadingFolders, setLoadingFolders] = useState(true);

  // Fetch folders once
  const fetchFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from("thumbnails")
        .list("", { limit: 1000 });

      if (error) {
        setError(`Storage error: ${error.message}`);
        return;
      }

      const folderNames = data.map((item) => item.name);
      setFolders(folderNames);

      if (folderNames.length > 0) {
        setSelectedFolder(folderNames[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Upload image function
  const uploadImage = useCallback(
    async (file: File) => {
      if (!selectedFolder) {
        setError("Please select a folder first");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const fileName = file.name;
        const filePath = `${selectedFolder}/${fileName}`;

        const {
          data: {},
        } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

        const pathForDatabase = `${selectedFolder}/${fileName}`;

        onImageUploaded(pathForDatabase);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFolder, onImageUploaded]
  );

  // Drop handler
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      if (!files.length) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      await uploadImage(file);
    },
    [uploadImage]
  );

  // File input handler
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !files.length) return;

      const file = files[0];
      setError(null);
      await uploadImage(file);
    },
    [uploadImage]
  );

  const removeImage = useCallback(() => {
    onImageUploaded("");
  }, [onImageUploaded]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Image Upload</Label>

      {/* Folder selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="folder-select">Select Upload Folder:</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchFolders}
            disabled={loadingFolders}
          >
            {loadingFolders ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Select
          value={selectedFolder}
          onValueChange={(value) => setSelectedFolder(value)}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                loadingFolders ? "Loading folders..." : "Select a folder"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {loadingFolders ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Loading folders...
              </div>
            ) : folders.length > 0 ? (
              folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {folder}
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No folders found
              </div>
            )}
          </SelectContent>
        </Select>

        <p className="text-xs text-gray-500">
          Choose which folder to upload the image to
        </p>
      </div>

      {/* Current Image */}
      {currentImageUrl && (
        <div className="relative inline-block">
          <Image
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

      {/* Drag & Drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Drop an image here</span> or{" "}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={isUploading || !selectedFolder}
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
          {selectedFolder ? (
            <p className="text-xs text-green-600 font-medium">
              📁 Uploading to: {selectedFolder}
            </p>
          ) : (
            <p className="text-xs text-red-500">
              ⚠️ Please select a folder first
            </p>
          )}
          <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP</p>
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

      {/* Manual Path */}
      <div className="space-y-2">
        <Label htmlFor="manual-path">Or enter image path manually:</Label>
        <Input
          id="manual-path"
          placeholder={
            selectedFolder ? `${selectedFolder}/filename.ext` : placeholder
          }
          defaultValue={currentImageUrl || ""}
          onChange={(e) => onImageUploaded(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {selectedFolder
            ? `Format: ${selectedFolder}/filename.ext (e.g., ${selectedFolder}/chart1.png)`
            : "Format: course-slug/filename.ext (e.g., finance-101/chart1.png)"}
        </p>
      </div>
    </div>
  );
}
