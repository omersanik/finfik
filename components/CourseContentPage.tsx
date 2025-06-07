"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import ContentBlock from "./ContentBlock";
import CourseIdNavbar from "./CourseIdNavbar";
import {
  updateSectionProgress,
  unlockNextSection,
  completeSectionAndUnlockNext,
} from "@/lib/db/actions/course-actions";

interface ContentItem {
  id: string;
  type: "text" | "image" | "quiz" | "animation";
  content_text?: string;
  image_url?: string;
  quiz_data?: any;
  component_key?: string;
  order_index: number;
}

interface CourseContentPageProps {
  courseData: {
    course: { id: string; slug: string; is_premium?: boolean };
    path: {
      id: string;
      name: string;
      sections: Array<{
        id: string;
        title: string;
        completed: boolean;
        unlocked: boolean;
        quiz_passed: boolean;
        order: number;
        description?: string;
        blocks: Array<{
          id: string;
          section_id: string;
          title: string;
          order_index: number;
          content_item: ContentItem[];
        }>;
      }>;
    };
  };
}

const CourseContentPage = ({ courseData }: CourseContentPageProps) => {
  // Add debug logging
  console.log("Course Data:", {
    courseId: courseData.course.id,
    isPremium: courseData.course.is_premium,
    sections: courseData.path.sections.map(s => ({
      id: s.id,
      title: s.title,
      order: s.order,
      unlocked: s.unlocked,
      completed: s.completed
    }))
  });

  // Find the current active section (first unlocked but not completed section)
  const findCurrentSection = () => {
    // First try to find an unlocked but not completed section
    const uncompletedUnlocked = courseData.path.sections.find(
      (section) => section.unlocked && !section.completed
    );

    console.log("Uncompleted Unlocked Section:", uncompletedUnlocked);

    if (uncompletedUnlocked) {
      return courseData.path.sections.findIndex(
        (s) => s.id === uncompletedUnlocked.id
      );
    }

    // If all unlocked sections are completed, return the first locked section
    const firstLocked = courseData.path.sections.find(
      (section) => !section.unlocked
    );
    console.log("First Locked Section:", firstLocked);

    if (firstLocked) {
      return courseData.path.sections.findIndex((s) => s.id === firstLocked.id);
    }

    // If everything is completed, return the last section
    return courseData.path.sections.length - 1;
  };

  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    findCurrentSection()
  );
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isUpdatingProgress, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);

  const currentSection = courseData.path.sections[currentSectionIndex];
  const currentSectionBlocks = currentSection?.blocks || [];

  // Check if current section is accessible
  const canAccessCurrentSection = currentSection?.unlocked || false;

  console.log("Current Section State:", {
    currentSectionIndex,
    currentSection: currentSection ? {
      id: currentSection.id,
      title: currentSection.title,
      order: currentSection.order,
      unlocked: currentSection.unlocked,
      completed: currentSection.completed
    } : null,
    canAccessCurrentSection,
    isPremium: courseData.course.is_premium
  });

  // Helper function to check if current block is the last block of current section
  const isLastBlockOfCurrentSection = (blockIndex: number) => {
    return blockIndex >= currentSectionBlocks.length - 1;
  };

  const handleContinue = async () => {
    const isLastBlock = isLastBlockOfCurrentSection(currentBlockIndex);
    setError(null); // Clear any previous errors

    if (isLastBlock) {
      // We're at the last block of the current section
      if (currentSection && !currentSection.completed) {
        // Mark section as completed and unlock next
        startTransition(async () => {
          try {
            console.log("Completing section:", currentSection.id);

            const result = await completeSectionAndUnlockNext(
              currentSection.id,
              courseData.course.id,
              currentSection.order
            );

            console.log("Section completion result:", result);

            // Check if there's a next section
            const nextSectionIndex = currentSectionIndex + 1;
            if (nextSectionIndex < courseData.path.sections.length) {
              // Move to next section
              setCurrentSectionIndex(nextSectionIndex);
              setCurrentBlockIndex(0);
            } else {
              // No more sections - show congratulations
              setShowCongratulations(true);
            }
          } catch (error) {
            console.error("Error updating progress:", error);
            setError(
              error instanceof Error
                ? error.message
                : "Failed to update progress"
            );
          }
        });
      } else {
        // Section already completed, just move to next section or show congratulations
        const nextSectionIndex = currentSectionIndex + 1;
        if (nextSectionIndex < courseData.path.sections.length) {
          setCurrentSectionIndex(nextSectionIndex);
          setCurrentBlockIndex(0);
        } else {
          setShowCongratulations(true);
        }
      }
    } else {
      // Move to next block in current section
      setCurrentBlockIndex((prev) => prev + 1);

      // Auto-scroll to next content block
      setTimeout(() => {
        const nextBlockElement = document.querySelector(
          `[data-block-index="${currentBlockIndex + 1}"]`
        );
        if (nextBlockElement) {
          nextBlockElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  // Calculate progress based on completed blocks across all sections
  const calculateProgress = () => {
    let completedBlocks = 0;
    let totalBlocks = 0;

    courseData.path.sections.forEach((section, sectionIdx) => {
      totalBlocks += section.blocks.length;

      if (sectionIdx < currentSectionIndex) {
        // All blocks in previous sections are completed
        completedBlocks += section.blocks.length;
      } else if (sectionIdx === currentSectionIndex) {
        // Current blocks completed in current section
        completedBlocks += currentBlockIndex;
      }
    });

    return { current: completedBlocks, total: totalBlocks };
  };

  const progress = calculateProgress();

  // If course is premium and user doesn't have access
  if (courseData.course.is_premium && !canAccessCurrentSection) {
    return (
      <>
        <CourseIdNavbar
          hrefX={`/courses/${courseData.course.slug}`}
          currentProgress={progress.current}
          totalProgress={progress.total}
        />
        <div className="min-h-screen bg-[#fefaf1] pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mt-8">
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-yellow-800 mb-3">
                    ⭐ Premium Course
                  </h2>
                  <p className="text-yellow-700 mb-4 text-sm">
                    This is a premium course. Upgrade your account to access all content.
                  </p>
                  <Link
                    href={`/courses/${courseData.course.slug}`}
                    className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm"
                  >
                    Back to Course
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If section is not accessible, show lock message
  if (!canAccessCurrentSection && !showCongratulations) {
    return (
      <>
        <CourseIdNavbar
          hrefX={`/courses/${courseData.course.slug}`}
          currentProgress={progress.current}
          totalProgress={progress.total}
        />
        <div className="min-h-screen bg-[#fefaf1] pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mt-8">
                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-yellow-800 mb-3">
                    🔒 Section Locked
                  </h2>
                  <p className="text-yellow-700 mb-4 text-sm">
                    Complete the previous sections to unlock "
                    {currentSection?.title}".
                  </p>
                  <Link
                    href={`/courses/${courseData.course.slug}`}
                    className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium text-sm"
                  >
                    Back to Course
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CourseIdNavbar
        hrefX={`/courses/${courseData.course.slug}`}
        currentProgress={
          showCongratulations ? progress.total : progress.current
        }
        totalProgress={progress.total}
      />
      <div className="min-h-screen bg-[#fefaf1] pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
              {courseData.path.name}
            </h1>

            {/* Section indicator */}
            {!showCongratulations && (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  Section {currentSection?.order}: {currentSection?.title}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-md mx-auto">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        currentSectionBlocks.length > 0
                          ? ((currentBlockIndex + 1) /
                              currentSectionBlocks.length) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Block {currentBlockIndex + 1} of {currentSectionBlocks.length}
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  <strong>Warning:</strong> {error}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  You can continue with the course, but your progress might not
                  be saved properly.
                </p>
              </div>
            )}

            {!showCongratulations ? (
              <div className="space-y-4">
                {/* Only show blocks from current section up to current block index */}
                {currentSectionBlocks
                  .slice(0, currentBlockIndex + 1)
                  .map((block, index) => (
                    <div key={block.id} data-block-index={index}>
                      <ContentBlock
                        id={block.id}
                        title={block.title}
                        contentItems={block.content_item}
                        isVisible={true}
                        onContinue={handleContinue}
                        canContinue={true}
                        isLastBlock={
                          index === currentBlockIndex &&
                          isLastBlockOfCurrentSection(currentBlockIndex) &&
                          currentSectionIndex ===
                            courseData.path.sections.length - 1
                        }
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center mt-8">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200 max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-green-800 mb-3">
                    🎉 Congratulations!
                  </h2>
                  <p className="text-green-700 mb-4 text-sm">
                    You've completed the entire course!
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-700 text-xs">
                        Note: There was an issue updating your progress, but you
                        completed the course.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Link
                      href={`/courses/${courseData.course.slug}`}
                      className="block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                    >
                      Back to Course
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseContentPage;
