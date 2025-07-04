"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
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

interface MainCardComponentProps {
  title: string;
  thumbnail: string;
  description: string;
  slug: string;
  courseId: string; // ✅ Make sure this is passed from the parent
}

const MainCardComponent = ({
  title,
  thumbnail,
  description,
  slug,
  courseId,
}: MainCardComponentProps) => {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  // Debug log to see render state
  console.log("MainCardComponent rendered. enrolled:", enrolled, "courseId:", courseId, "slug:", slug);

  // Check if user is enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const res = await fetch(`/api/progress/check-enrollment?slug=${slug}`);
        setEnrolled(res.status === 200);
      } catch (err) {
        console.error("Failed to check enrollment", err);
      }
    };

    checkEnrollment();
  }, [courseId]);

  // If not enrolled, start the course
  const handleStart = async () => {
    setLoading(true);

    const res = await fetch("/api/progress/start-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/courses/${slug}`);
    } else {
      const errText = await res.text();
      alert("Failed to start course: " + errText);
    }
  };

  // If enrolled, update last_accessed and continue
  const handleContinue = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("Token:", token);
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
    <main className="flex my-4 sm:mx-12 lg:mx-20">
      <Card className="w-full sm:w-[35%] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
        </CardHeader>
        <div className="flex justify-center">
          <Image
            src={thumbnail && typeof thumbnail === "string" && thumbnail.trim() !== "" ? thumbnail : "/fallback-image.png"}
            alt="thumbnailimage"
            width={250}
            height={250}
            style={{ width: 250, height: "auto", objectFit: "contain" }}
            className="max-w-full h-auto"
          />
        </div>
        <CardContent>
          <CardDescription className="text-center text-base p-3">
            <p>{description}</p>
          </CardDescription>

          {enrolled === null ? (
            <Button disabled className="w-full">
              Loading...
            </Button>
          ) : enrolled ? (
            <Button className="w-full" onClick={handleContinue} disabled={loading}>
              {loading ? "Continuing..." : "Continue"}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleStart} disabled={loading}>
              {loading ? "Starting..." : "Start"}
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default MainCardComponent;
