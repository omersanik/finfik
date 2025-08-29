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

// Create Supabase client outside component to avoid multiple instances
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

  // Fetch available folders from the thumbnails bucket (only once)
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoadingFolders(true);
        console.log("Fetching folders from thumbnail bucket...");

        // Now try to list the thumbnails bucket contents
        const { data, error } = await supabase.storage
          .from("thumbnails")
          .list("", { limit: 1000 });

        if (error) {
          console.error("Error fetching folders:", error);
          setError(`Storage error: ${error.message}`);
          return;
        }

        console.log("Raw storage data:", data);

        // Extract folder names from the data
        const folderNames = data.map((item) => item.name);

        console.log("Found folders:", folderNames);
        setFolders(folderNames);

        // Set default folder if available
        if (folderNames.length > 0) {
          console.log("Setting default folder to:", folderNames[0]);
          setSelectedFolder(folderNames[0]);
        }

        console.log("Final state - folders:", folderNames);
        console.log(
          "Final state - selectedFolder will be set to:",
          folderNames[0] || "none"
        );
      } catch (err) {
        console.error("Error fetching folders:", err);
        setError(
          `Fetch error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchFolders();
  }, []); // Empty dependency array - only run once

  // Monitor state changes
  useEffect(() => {
    console.log("State changed - selectedFolder:", selectedFolder);
    console.log("State changed - folders:", folders);
  }, [selectedFolder, folders]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const uploadImage = async (file: File) => {
    console.log("=== UPLOAD ATTEMPT ===");
    console.log("selectedFolder state:", selectedFolder);
    console.log("folders state:", folders);
    console.log("loadingFolders state:", loadingFolders);
    console.log("current error state:", error);
    console.log("=======================");

    if (!selectedFolder) {
      setError("Please select a folder first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Use the original filename directly
      const fileName = file.name;

      // Upload to the selected folder in Supabase Storage
      const filePath = `${selectedFolder}/${fileName}`;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

      // Extract just the path part for the database (folder/filename)
      const pathForDatabase = `${selectedFolder}/${fileName}`;

      console.log("Full public URL:", publicUrl);
      console.log("Path for database:", pathForDatabase);

      // Call the callback with the path for database (not the full URL)
      onImageUploaded(pathForDatabase);
      setUploadProgress(100);

      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      await uploadImage(file);
    },
    [uploadImage] // include uploadImage here
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      setError(null);
      await uploadImage(file);
    },
    [uploadImage]
  ); // Add selectedFolder as dependency

  const removeImage = () => {
    onImageUploaded("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Image Upload</Label>

      {/* Folder Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="folder-select">Select Upload Folder:</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadingFolders(true);
              setError(null);
              // Re-fetch folders
              const fetchFolders = async () => {
                try {
                  const { data, error } = await supabase.storage
                    .from("thumbnails")
                    .list("", { limit: 1000 });

                  if (error) {
                    console.error("Refresh error:", error);
                    setError(`Storage error: ${error.message}`);
                    return;
                  }

                  const folderNames = data.map((item) => item.name);
                  console.log("Refresh - found folders:", folderNames);

                  setFolders(folderNames);
                  if (folderNames.length > 0) {
                    console.log(
                      "Refresh - setting selected folder to:",
                      folderNames[0]
                    );
                    setSelectedFolder(folderNames[0]);
                  }
                } catch (err) {
                  console.error("Refresh error:", err);
                } finally {
                  setLoadingFolders(false);
                }
              };
              fetchFolders();
            }}
            disabled={loadingFolders}
          >
            {loadingFolders ? "Loading..." : "Refresh"}
          </Button>
        </div>

        <Select
          value={selectedFolder}
          onValueChange={(value) => {
            console.log("Folder selected:", value);
            setSelectedFolder(value);
          }}
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

        {/* Debug Info */}
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
          <p>Debug: Found {folders.length} folders</p>
          <p>Selected: {selectedFolder || "None"}</p>
          <p>Loading: {loadingFolders ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Current Image Display */}
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

      {/* Drag & Drop Zone */}
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

      {/* Manual Path Input (Fallback) */}
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
