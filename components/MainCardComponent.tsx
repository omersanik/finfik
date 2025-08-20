"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useEnrollmentStatus, useCourseProgress, useStartCourse, useUpdateLastAccessed } from "@/lib/hooks/useApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getThumbnailUrl } from "@/lib/thumbnail-utils";
import MainCardSkeleton from "./skeletons/MainCardSkeleton";

interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
  slug: string;
  courseId: string; // ✅ Make sure this is passed from the parent
  isPremium?: boolean;
  comingSoon?: boolean;
  courseLevel?: 'Easy' | 'Medium' | 'Hard';
}

const MainCardComponent = ({
  title,
  thumbnail,
  description,
  slug,
  courseId,
  isPremium = false,
  comingSoon = false,
  courseLevel,
}: MainCardComponentProps) => {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  // Debug log to see render state
  console.log("MainCardComponent rendered. enrolled:", enrolled, "courseId:", courseId, "slug:", slug);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Temporarily use the old approach to test if React Query is the issue
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  
  // Check if user is enrolled and get progress
  useEffect(() => {
    const checkEnrollmentAndProgress = async () => {
      try {
        const token = await getToken();
        console.log('MainCardComponent - Token for API call:', token ? 'Yes' : 'No');
        
        const res = await fetch(`/api/progress/check-enrollment?slug=${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const isEnrolled = res.status === 200;
        console.log('MainCardComponent - Enrollment check result:', isEnrolled);
        setEnrolled(isEnrolled);
        
        if (isEnrolled) {
          // Get progress for enrolled course
          const progressRes = await fetch("/api/progress/course-progress", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId }),
          });
          
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgress(progressData.progress);
          }
        }
      } catch (err) {
        console.error("Failed to check enrollment or progress", err);
      } finally {
        setEnrollmentLoading(false);
      }
    };

    checkEnrollmentAndProgress();
  }, [courseId, slug, getToken]);
  
  // Progress loading is now handled by local state
  const progressLoading = enrollmentLoading;

  // Use React Query mutations
  const startCourseMutation = useStartCourse();
  const updateLastAccessedMutation = useUpdateLastAccessed();

  // If not enrolled, start the course
  const handleStart = async () => {
    setButtonLoading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        alert("No auth token found. Please sign in again.");
        setButtonLoading(false);
        return;
      }
      
      // Start course in background (fire and forget)
      startCourseMutation.mutate({ courseId, token });
      
      // Small delay to show button loading state briefly
      setTimeout(() => {
        // Navigate to course page
        router.push(`/courses/${slug}`);
      }, 200);
      
      // Don't set loading to false - let navigation handle it
    } catch (err) {
      console.error("Failed to start course", err);
      alert("Error starting course: " + err);
      setButtonLoading(false);
    }
  };

  // If enrolled, update last_accessed and continue
  const handleContinue = async () => {
    setButtonLoading(true);
    
    // Small delay to show button loading state briefly
    setTimeout(() => {
      // Navigate to course page
      router.push(`/courses/${slug}`);
    }, 200);
    
    // Update last_accessed in the background (fire and forget)
    try {
      const token = await getToken();
      if (token) {
        // Don't await - let it run in background
        updateLastAccessedMutation.mutate({ courseId, token });
      }
    } catch (err) {
      // Silently fail in background - user is already navigating
      console.error("Background update failed:", err);
    }
    
    // Don't set loading to false - let navigation handle it
  };

  // Show skeleton while loading enrollment status
  if (enrollmentLoading) {
    return <MainCardSkeleton />;
  }

  return (
    <main className="flex">
      <Card className="w-full max-w-lg shadow-2xl relative">
        {courseLevel && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="outline" className={`${getLevelBadgeColor(courseLevel)} font-medium`}>
              {courseLevel}
            </Badge>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 justify-center">
            <CardTitle className="text-xl mt-6 text-center">{title}</CardTitle>
            {isPremium && (
              <span className="ml-2">
                <Badge variant="secondary">
                  <span role="img" aria-label="throne">🪑</span> Premium
                </Badge>
              </span>
            )}
            {comingSoon && (
              <span className="ml-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">Coming Soon</Badge>
              </span>
            )}
          </div>
        </CardHeader>
        <div className="flex justify-center">
          <Image
                            src={thumbnail && typeof thumbnail === "string" && thumbnail.trim() !== "" ? getThumbnailUrl(thumbnail) : "/fallback-image.png"}
            alt="thumbnailimage"
            width={250}
            height={250}
            style={{ width: 250, height: 250, objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
        <CardContent>
          <CardDescription className="text-center text-sm p-3">
            <p>{description}</p>
          </CardDescription>

          {/* Progress Bar for enrolled courses */}
          {enrolled && !comingSoon && (
            <div className="mb-4 px-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {progressLoading ? "Loading progress..." : `${progress}% Complete`}
                </span>
                {!progressLoading && progress > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {progress}%
                  </span>
                )}
              </div>
              <Progress 
                value={progress} 
                className="h-2"
              />
            </div>
          )}

          {comingSoon ? (
            <Button disabled className="w-full">
              <span className="text-yellow-700 font-semibold">Coming Soon</span>
            </Button>
          ) : enrolled === null ? (
            <Button disabled className="w-full">
              Loading...
            </Button>
          ) : enrolled ? (
            <Button className="w-full" onClick={handleContinue} disabled={buttonLoading}>
              {buttonLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Continuing...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleStart} disabled={buttonLoading}>
              {buttonLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Starting...
                </span>
              ) : (
                "Start"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default MainCardComponent;
