// File: components/SectionClient.tsx
"use client";

import ContentBlockComponent from "./ContentBlock";
import { useState, useEffect } from "react";
import CourseIdNavbar from "./CourseIdNavbar";

interface ContentItem {
  id: string;
  block_id: string;
  type: "text" | "image" | "quiz" | "animation";
  content_text?: string;
  image_url?: string;
  quiz_data?: any;
  component_key?: string;
  order_index: number;
  created_at: string;
}

interface Block {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}

interface Props {
  section: { id: string; title: string; order: number };
  coursePathId: string;
  courseSlug: string;
  blocks: Block[];
}

export default function SectionClient({
  section,
  coursePathId,
  courseSlug,
  blocks,
}: Props) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => {
        window.location.href = `/courses/${courseSlug}`;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [finished, courseSlug]);

  const onContinue = async () => {
    const isLast = blockIndex === blocks.length - 1;

    if (isLast) {
      // Complete section via API (send course_path_section_id as sectionId)
      await fetch("/api/progress/complete-and-unlock", {
        method: "POST",
        body: JSON.stringify({
          sectionId: section.id,
          courseId: coursePathId,
          currentOrder: section.order,
        }),
        headers: { "Content-Type": "application/json" },
      });

      setFinished(true);
    } else {
      setBlockIndex((prev) => prev + 1);
    }
  };

  if (finished) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">🎉 Section Completed!</h2>
        <p className="text-gray-600 mt-2 mb-6">You have finished this section.</p>
        <a
          href={`/courses/${courseSlug}`}
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
        >
          Back to Course
        </a>
        <p className="text-xs text-gray-400 mt-2">Redirecting...</p>
      </div>
    );
  }

  const current = blocks[blockIndex];

  return (
    <>
      <CourseIdNavbar
        hrefX={`/courses/${courseSlug}`}
        currentProgress={blockIndex + 1}
        totalProgress={blocks.length}
      />
      <div className="max-w-3xl mx-auto p-4 pt-24">
        <ContentBlockComponent
          block={current}
          isVisible={true}
          onContinue={onContinue}
          canContinue={true}
          isLastBlock={blockIndex === blocks.length - 1}
        />
      </div>
    </>
  );
}
