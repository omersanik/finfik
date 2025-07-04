"use client";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SectionCardComponentProp {
  title: string;
  thumbnail: string;
  slug: string;
  courseId: string;
}

const SectionCardComponent = ({
  title,
  thumbnail,
  slug,
  courseId,
}: SectionCardComponentProp) => {
  const { getToken } = useAuth();
  const router = useRouter();

  // Debug log to see render state
  console.log("SectionCardComponent rendered. slug:", slug, "courseId:", courseId);

  const handleContinue = async () => {
    try {
      const token = await getToken();
      console.log("Token:", token);
      console.log("Slug:", slug);
      console.log("Course ID:", courseId);
      if (!token) {
        alert("No auth token found. Please sign in again.");
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
        return;
      }
    } catch (err) {
      console.error("Failed to update last_accessed", err);
      alert("Error updating last accessed: " + err);
      return;
    }
    router.push(`/courses/${slug}`);
  };

  return (
    <div className="w-[446px] h-[377px] sm:w-1/2 lg:w-1/3 p-4">
      <Card className="shadow-2xl h-full flex max-sm:flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-2xl mt-6 text-center">{title}</CardTitle>
        </CardHeader>

        <div className="flex justify-center">
          <Image
            src={thumbnail}
            alt={`Thumbnail for ${title}`}
            width={200}
            height={200}
            className="max-w-full h-auto"
          />
        </div>

        <div className="mx-4 mb-4">
          <Button className="w-full" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SectionCardComponent;
