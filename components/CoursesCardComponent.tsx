"use client";

import Image, { StaticImageData } from "next/image";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CoursesCardComponentProps {
  title: string;
  description: string;
  thumbnail: string | StaticImageData;
  slug: string;
  courseId: string;
}

const CoursesCardComponent = ({
  title,
  description,
  thumbnail,
  slug,
  courseId,
}: CoursesCardComponentProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);

    const res = await fetch("/api/progress/start-course-and-paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/courses/${slug}`);
    } else {
      const err = await res.text();
      alert("Failed to start course: " + err);
    }
  };

  const hasValidThumbnail =
    thumbnail &&
    (typeof thumbnail === "string" ? thumbnail.trim() !== "" : true);

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden transition hover:scale-[1.02] hover:shadow-xl duration-300">
      {hasValidThumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          width={1000}
          height={1000}
          className="w-full h-48 object-contain bg-white"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-sm">No Image</div>
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardFooter className="justify-end">
        <Button onClick={handleStart} disabled={loading}>
          {loading ? "Starting..." : "Start"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CoursesCardComponent;
