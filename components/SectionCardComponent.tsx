"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";
import { getThumbnailUrl } from "@/lib/thumbnail-utils";

interface SectionCardComponentProp {
  title: string;
  thumbnail: string;
  slug: string;
  courseId: string;
  initialProgress?: number;
  comingSoon?: boolean;
  courseLevel?: 'Easy' | 'Medium' | 'Hard';
}

const SectionCardComponent = ({
  title,
  thumbnail,
  slug,
  courseId,
  initialProgress = 0,
  comingSoon = false,
  courseLevel,
}: SectionCardComponentProp) => {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [progressLoading, setProgressLoading] = useState(initialProgress === 0);

  // Debug log to see render state
  console.log(
    "SectionCardComponent rendered. slug:",
    slug,
    "courseId:",
    courseId
  );

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

  // Get progress for this course (only if no initial progress provided)
  useEffect(() => {
    if (initialProgress === 0) {
      const getProgress = async () => {
        try {
          const progressRes = await fetch("/api/progress/course-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId }),
          });
          
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgress(progressData.progress);
          }
        } catch (err) {
          console.error("Failed to get progress", err);
        } finally {
          setProgressLoading(false);
        }
      };

      getProgress();
    } else {
      setProgressLoading(false);
    }
  }, [courseId, initialProgress]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("Token:", token);
      console.log("Slug:", slug);
      console.log("Course ID:", courseId);
      if (!token) {
        alert("No auth token found. Please sign in again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/progress/update-last-accessed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      const text = await res.text();
      console.log("update-last-accessed response:", res.status, text);
      if (!res.ok) {
        alert("Failed to update last accessed: " + text);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Failed to update last_accessed", err);
      alert("Error updating last accessed: " + err);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push(`/courses/${slug}`);
  };

  return (
    <Card className="shadow-2xl h-full flex flex-col relative">
      {courseLevel && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className={`${getLevelBadgeColor(courseLevel)} font-medium`}>
            {courseLevel}
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex justify-center items-center mb-4">
          <Image
            src={getThumbnailUrl(thumbnail)}
            alt={`Thumbnail for ${title}`}
            width={200}
            height={200}
            className="max-w-full"
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4 px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {progressLoading ? "Loading..." : `${progress}% Complete`}
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

        <div>
          {comingSoon && (
            <div className="mb-2 text-center text-yellow-700 font-semibold bg-yellow-100 rounded py-1">
              Coming Soon
            </div>
          )}
          <Button className="w-full px-8" onClick={handleContinue} disabled={loading || comingSoon}>
            {comingSoon ? (
              <span className="text-yellow-700 font-semibold">Coming Soon</span>
            ) : loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin h-4 w-4" />
                Continuing...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionCardComponent;
