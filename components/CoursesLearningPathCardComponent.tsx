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
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getThumbnailUrl } from "@/lib/thumbnail-utils";
interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
  courseId?: string;
  initialProgress?: number;
  comingSoon?: boolean;
  courseLevel?: 'Easy' | 'Medium' | 'Hard';
}

const CourseLearningPathCardComponent = ({
  title,
  thumbnail,
  description,
  courseId,
  initialProgress = 0,
  comingSoon = false,
  courseLevel,
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

  return (
    <Card className="w-full shadow-2xl flex flex-col relative">
      {comingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full shadow text-sm">Coming Soon</span>
        </div>
      )}
      {courseLevel && (
        <div className="absolute top-4 right-16 z-10">
          <Badge variant="outline" className={`${getLevelBadgeColor(courseLevel)} font-medium`}>
            {courseLevel}
          </Badge>
        </div>
      )}
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
      </CardHeader>
      <div className="flex justify-center flex-shrink-0">
        <Image
          src={getThumbnailUrl(thumbnail)}
          alt="thumbnailimage"
          width={250}
          height={250}
          className="max-w-full h-auto"
        />
      </div>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="text-center text-base p-3 flex-1">
          <p className="overflow-hidden break-words" style={{
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}>{description}</p>
        </CardDescription>
        {/* Progress Bar - only show if courseId is provided */}
        {courseId && !comingSoon && (
          <div className="mt-4 px-2 flex-shrink-0">
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
