// File: components/SectionClient.tsx
"use client";

import ContentBlockComponent from "./ContentBlock";
import { useState, useEffect, useRef } from "react";
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
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => {
        window.location.href = `/courses/${courseSlug}`;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [finished, courseSlug]);

  const handleContinue = async (idx: number) => {
    const isLast = idx === blocks.length - 1;
    if (isLast) {
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
      setUnlockedIndex((prev) => Math.max(prev, idx + 1));
      setTimeout(() => {
        blockRefs.current[idx + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
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

  return (
    <>
      <CourseIdNavbar
        hrefX={`/courses/${courseSlug}`}
        currentProgress={unlockedIndex + 1}
        totalProgress={blocks.length}
      />
      <div className="max-w-3xl mx-auto p-4 pt-24">
        {blocks.slice(0, unlockedIndex + 1).map((block, idx) => (
          <div
            key={block.id}
            ref={el => { blockRefs.current[idx] = el; }}
            className="mb-12 transition-all duration-700 ease-in-out"
          >
            <ContentBlockComponent
              block={block}
              isVisible={true}
              onContinue={() => handleContinue(idx)}
              canContinue={true}
              isLastBlock={idx === blocks.length - 1}
              locked={false}
              hideContinueButton={true}
            />
          </div>
        ))}
        {/* Single Continue Button at the bottom */}
        {unlockedIndex < blocks.length && (
          <div className="flex justify-center mt-8 sticky bottom-8 z-20">
            <button
              onClick={() => handleContinue(unlockedIndex)}
              className="px-6 py-2 rounded-lg font-medium transition-all text-sm bg-primary text-white shadow hover:bg-primary/90"
              style={{ minWidth: 160 }}
            >
              {unlockedIndex === blocks.length - 1 ? "Finish" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
