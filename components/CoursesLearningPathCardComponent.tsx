"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
  courseId?: string;
  initialProgress?: number;
  comingSoon?: boolean;
}

const CourseLearningPathCardComponent = ({
  title,
  thumbnail,
  description,
  courseId,
  initialProgress = 0,
  comingSoon = false,
}: MainCardComponentProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [progressLoading, setProgressLoading] = useState(initialProgress === 0);

  // Get progress for this course (only if courseId is provided and no initial progress)
  useEffect(() => {
    if (courseId && initialProgress === 0) {
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

  return (
    <Card className="w-full shadow-2xl h-full relative">
      {comingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full shadow text-sm">Coming Soon</span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
      </CardHeader>
      <div className="flex justify-center">
        <Image
          src={thumbnail}
          alt="thumbnailimage"
          width={250}
          height={250}
          className="max-w-full h-auto"
        />
      </div>
      <CardContent>
        <CardDescription className="text-center text-base p-3">
          <p>{description}</p>
        </CardDescription>
        {/* Progress Bar - only show if courseId is provided */}
        {courseId && !comingSoon && (
          <div className="mt-4 px-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {progressLoading ? "Loading..." : `${progress}% Complete`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseLearningPathCardComponent;
