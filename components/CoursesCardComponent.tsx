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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface CoursesCardComponentProps {
  title: string;
  description: string;
  thumbnail: string | StaticImageData;
  slug: string;
  courseId: string;
  isPremium?: boolean;
  comingSoon?: boolean;
}

const CoursesCardComponent = ({
  title,
  description,
  thumbnail,
  slug,
  courseId,
  isPremium = false,
  comingSoon = false,
}: CoursesCardComponentProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);

    // Premium check before starting the course
    if (isPremium) {
      try {
        const res = await fetch("/api/users/premium-users");
        if (res.ok) {
          const data = await res.json();
          if (!data.is_premium) {
            window.location.href = "/subscription";
            return;
          }
        }
      } catch (err) {
        // fallback: block access if check fails
        window.location.href = "/subscription";
        return;
      }
    }

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
    <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden transition hover:scale-[1.02] hover:shadow-xl duration-300 flex flex-col h-full">
      {hasValidThumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          width={1000}
          height={1000}
          className="w-full h-48 object-contain"
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
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          {isPremium && (
            <span className="ml-2">
              <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 text-xs flex items-center gap-1 border-yellow-300 shadow-sm">
                <span role="img" aria-label="crown">👑</span> Premium
              </Badge>
            </span>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <div className="flex-1 flex items-end">
        <CardFooter className="w-full justify-end">
          <Button onClick={handleStart} disabled={loading || comingSoon}
            className={comingSoon ? 'bg-yellow-100 border border-yellow-400 text-yellow-900 font-bold uppercase' : ''}>
            {comingSoon ? (
              <span className="font-bold uppercase text-yellow-900">Coming Soon</span>
            ) : loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin h-4 w-4" />
                Starting...
              </span>
            ) : (
              "Start"
            )}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default CoursesCardComponent;
