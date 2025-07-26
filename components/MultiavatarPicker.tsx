"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Check, X } from "lucide-react";

// You'll need to install: npm install @multiavatar/multiavatar
// For now, let's use alternative avatar services that are more reliable

const AVATAR_SERVICES = [
  {
    name: "DiceBear Avataaars",
    getUrl: (seed: string) =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  },
  {
    name: "DiceBear Micah",
    getUrl: (seed: string) =>
      `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`,
  },
  {
    name: "DiceBear Personas",
    getUrl: (seed: string) =>
      `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
  },
  {
    name: "Robohash",
    getUrl: (seed: string) =>
      `https://robohash.org/${seed}?format=png&size=200x200`,
  },
];

const generateRandomSeed = () => Math.random().toString(36).substring(2, 10);

export default function MultiavatarPicker() {
  const { user, isLoaded } = useUser();
  const [seed, setSeed] = useState("");
  const [selectedService, setSelectedService] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Initialize with a consistent seed based on user info
  useEffect(() => {
    if (user) {
      const savedSeed = localStorage.getItem(`avatar_seed_${user.id}`);
      const savedService = localStorage.getItem(`avatar_service_${user.id}`);

      const initialSeed = savedSeed || user.id || generateRandomSeed();
      const initialService = savedService ? parseInt(savedService) : 0;

      setSeed(initialSeed);
      setSelectedService(initialService);

      // Save defaults if they don't exist
      if (!savedSeed) {
        localStorage.setItem(`avatar_seed_${user.id}`, initialSeed);
      }
      if (!savedService) {
        localStorage.setItem(`avatar_service_${user.id}`, "0");
      }
    }
  }, [user]);

  useEffect(() => {
    if (seed && AVATAR_SERVICES[selectedService]) {
      setPreviewUrl(AVATAR_SERVICES[selectedService].getUrl(seed));
    }
  }, [seed, selectedService]);

  const handleGenerateNew = () => {
    const newSeed = generateRandomSeed();
    setSeed(newSeed);
    if (user) {
      localStorage.setItem(`avatar_seed_${user.id}`, newSeed);
    }
    setError("");
  };

  const handleServiceChange = (serviceIndex: number) => {
    setSelectedService(serviceIndex);
    if (user) {
      localStorage.setItem(
        `avatar_service_${user.id}`,
        serviceIndex.toString()
      );
    }
    setError("");
  };

  const handleUseAvatar = async () => {
    if (!user || !previewUrl) {
      console.error("Missing user or previewUrl");
      setError("Missing user or avatar URL");
      return;
    }

    console.log("=== Starting avatar update process ===");
    console.log("User ID:", user.id);
    console.log("Preview URL:", previewUrl);

    setUploading(true);
    setError("");

    try {
      // Step 1: Convert SVG to PNG using Canvas (this fixes the content-type issue)
      console.log("Step 1: Converting avatar to PNG...");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      // Set canvas size
      canvas.width = 200;
      canvas.height = 200;

      // Load the image and convert to PNG
      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log("Image loaded successfully");
          // Fill white background first (in case SVG has transparency)
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw the avatar
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          resolve(null);
        };
        img.onerror = (error) => {
          console.error("Image load error:", error);
          reject(new Error("Failed to load image"));
        };
        img.crossOrigin = "anonymous"; // Important for CORS
        img.src = previewUrl;
      });

      // Step 2: Convert canvas to blob
      console.log("Step 2: Converting canvas to PNG blob...");
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => {
            console.log("Canvas blob created:", blob?.type, blob?.size);
            resolve(blob);
          },
          "image/png",
          0.9
        );
      });

      if (!pngBlob) {
        throw new Error("Failed to convert avatar to PNG");
      }

      // Step 3: Create file with proper PNG type
      console.log("Step 3: Creating PNG file...");
      const file = new File([pngBlob], "avatar.png", { type: "image/png" });
      console.log("File created:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeKB: Math.round(file.size / 1024),
      });

      // Step 4: Test if setProfileImage exists
      console.log("Step 4: Checking setProfileImage method...");
      if (typeof user.setProfileImage !== "function") {
        throw new Error("setProfileImage method not available on user object");
      }

      console.log("Step 5: Calling setProfileImage...");

      // Try the upload
      const result = await user.setProfileImage({ file });
      console.log("setProfileImage result:", result);

      console.log("Step 6: Upload successful!");
      setShowPicker(false);
      setError("");

      // Small delay before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("=== ERROR in avatar update ===");
      console.error("Error details:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);

      setError(`Failed to update avatar: ${err.message}`);

      // Don't hide the picker on error so user can retry
    } finally {
      setUploading(false);
      console.log("=== Avatar update process finished ===");
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="mt-2">
      {!showPicker ? (
        <Button
          onClick={() => setShowPicker(true)}
          size="sm"
          variant="outline"
          className="h-8 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Change Avatar
        </Button>
      ) : (
        <Card className="w-full max-w-sm">
          <CardContent className="p-4 space-y-4">
            <div className="text-sm font-medium">Pick an Avatar Style</div>

            {/* Service Selection */}
            <div className="flex flex-wrap gap-2">
              {AVATAR_SERVICES.map((service, index) => (
                <Button
                  key={index}
                  onClick={() => handleServiceChange(index)}
                  variant={selectedService === index ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                >
                  {service.name.split(" ")[1] || service.name}
                </Button>
              ))}
            </div>

            {/* Avatar Preview */}
            {previewUrl && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="w-16 h-16 rounded-full border-2 border-border"
                    onError={(e) => {
                      console.error("Avatar failed to load:", previewUrl);
                      setError("Failed to load avatar preview");
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="text-xs">
                    {AVATAR_SERVICES[selectedService]?.name}
                  </Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateNew}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={uploading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                New
              </Button>
              <Button
                onClick={() => {
                  console.log("Use This button clicked!");
                  handleUseAvatar();
                }}
                size="sm"
                className="h-8 text-xs"
                disabled={uploading || !previewUrl}
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Use This
              </Button>
              <Button
                onClick={() => setShowPicker(false)}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={uploading}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>

            {uploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">
                  Uploading avatar...
                </span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
