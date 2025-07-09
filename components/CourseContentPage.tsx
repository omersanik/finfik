"use client";
import React, { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import ContentBlockComponent from "./ContentBlock";
import CourseIdNavbar from "./CourseIdNavbar";
import LoadingAnimation from "./LoadingAnimation";

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

interface ContentBlock {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}

interface Section {
  id: string;
  title: string;
  completed: boolean;
  unlocked: boolean;
  quiz_passed: boolean;
  order: number;
  description?: string;
  content_blocks: ContentBlock[];
}

interface CourseContentPageProps {
  courseData: {
    course: {
      id: string;
      slug: string;
      is_premium?: boolean;
    };
    path: {
      id: string;
      name: string;
      sections: Section[];
    };
  };
  userId: string;
}

const CourseContentPage = ({ courseData, userId }: CourseContentPageProps) => {
  // Find the current active section (first unlocked but not completed section)
  const findCurrentSection = () => {
    const uncompletedUnlocked = courseData.path.sections.find(
      (section) => section.unlocked && !section.completed
    );

    if (uncompletedUnlocked) {
      return courseData.path.sections.findIndex(
        (s) => s.id === uncompletedUnlocked.id
      );
    }

    const firstLocked = courseData.path.sections.find(
      (section) => !section.unlocked
    );

    if (firstLocked) {
      return courseData.path.sections.findIndex((s) => s.id === firstLocked.id);
    }

    return courseData.path.sections.length - 1;
  };

  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    findCurrentSection()
  );
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isUpdatingProgress, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentSection = courseData.path.sections[currentSectionIndex];
  
  // Set loading to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const currentSectionBlocks = currentSection?.content_blocks || [];

  const canAccessCurrentSection = currentSection?.unlocked || false;

  // Helper function to check if current block is the last block of current section
  const isLastBlockOfCurrentSection = (blockIndex: number) => {
    return blockIndex >= currentSectionBlocks.length - 1;
  };

  // Function to complete section and unlock next
  const completeSectionAndUnlockNext = async (
    sectionId: string,
    courseId: string,
    currentOrder: number
  ) => {
    try {
      const response = await fetch("/api/course/complete-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          sectionId: sectionId,
          courseId: courseId,
          currentOrder: currentOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete section");
      }

      return await response.json();
    } catch (error) {
      console.error("Error completing section:", error);
      throw error;
    }
  };

  const handleContinue = async () => {
    const isLastBlock = isLastBlockOfCurrentSection(currentBlockIndex);
    setError(null);

    if (isLastBlock) {
      if (currentSection && !currentSection.completed) {
        startTransition(async () => {
          try {
            console.log("Completing section:", currentSection.id);

            await completeSectionAndUnlockNext(
              currentSection.id,
              courseData.course.id,
              currentSection.order
            );

            // Update the local state to reflect completion
            currentSection.completed = true;

            // Check if there's a next section and unlock it
            const nextSectionIndex = currentSectionIndex + 1;
            if (nextSectionIndex < courseData.path.sections.length) {
              const nextSection = courseData.path.sections[nextSectionIndex];
              nextSection.unlocked = true;
              setCurrentSectionIndex(nextSectionIndex);
              setCurrentBlockIndex(0);
            } else {
              setShowCongratulations(true);
            }
          } catch (error) {
            console.error("Error updating progress:", error);
            setError(
              "Failed to update progress. Please try again or contact support."
            );
          }
        });
      } else {
        // If section is already completed, just move to next section
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
      setCurrentBlockIndex(currentBlockIndex + 1);
    }
  };

  // Calculate progress based on completed blocks across all sections
  const calculateProgress = () => {
    let completedBlocks = 0;
    let totalBlocks = 0;

    courseData.path.sections.forEach((section, sectionIdx) => {
      totalBlocks += section.content_blocks.length;

      if (sectionIdx < currentSectionIndex) {
        // All blocks in previous sections are completed
        completedBlocks += section.content_blocks.length;
      } else if (sectionIdx === currentSectionIndex) {
        // Only count blocks that are actually completed in current section
        // When currentBlockIndex is 0, we're viewing the first block but haven't completed it yet
        completedBlocks += currentBlockIndex;
      }
    });

    return { current: completedBlocks, total: totalBlocks };
  };

  const progress = calculateProgress();

  // Debug progress
  console.log("Progress:", progress);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fefaf1] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Suspense fallback={<div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>}>
            <LoadingAnimation size="large" />
          </Suspense>
          <p className="mt-4 text-gray-600 text-sm">Loading course content...</p>
        </div>
      </div>
    );
  }

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
                    This is a premium course. Upgrade your account to access all
                    content.
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
                {currentSectionBlocks
                  .slice(0, currentBlockIndex + 1)
                  .map((block, index) => (
                    <div key={block.id} data-block-index={index}>
                      <ContentBlockComponent
                        block={block}
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
