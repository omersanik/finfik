// File: components/SectionClient.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ContentBlockComponent from "./ContentBlock";
import CourseIdNavbar from "./CourseIdNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizData {
  options: QuizOption[];
}

interface ContentItem {
  id: string;
  block_id: string;
  type:
    | "text"
    | "image"
    | "quiz"
    | "animation"
    | "calculator"
    | "math"
    | "chart"
    | "drag-drop";
  content_text?: string;
  image_url?: string;
  quiz_data?: QuizData;
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

declare global {
  interface Window {
    checkDragDropAnswers?: () => boolean;
  }
}

export default function SectionClient({
  section,
  coursePathId,
  courseSlug,
  blocks,
}: Props) {
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dragDropCompleted, setDragDropCompleted] = useState(false);
  const [dragDropReady, setDragDropReady] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean }>(
    { open: false, correct: false }
  );
  const [showFullProgress, setShowFullProgress] = useState(false);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (finished) {
      const timeout = setTimeout(() => {
        window.location.href = `/courses/${courseSlug}`;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [finished, courseSlug]);

  const hasQuiz =
    blocks[unlockedIndex]?.content_items.some(
      (item: ContentItem) => item.type === "quiz"
    ) || false;
  const hasDragDrop =
    blocks[unlockedIndex]?.content_items.some(
      (item: ContentItem) => item.type === "drag-drop"
    ) || false;

  const handleQuizAnswer = (answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [unlockedIndex]: answer }));
  };

  const handleDragDropComplete = (isCompleted: boolean) => {
    if (isCompleted) {
      setDragDropCompleted(true);
      setDragDropReady(true);
      // Show congratulations popup for correct drag-drop
      setFeedback({ open: true, correct: true });
    } else {
      // This means all items are dropped but not necessarily correct
      setDragDropReady(true);
      setDragDropCompleted(false);
    }
  };

  const handleCheckAnswer = async () => {
    setButtonLoading(true);

    // Get the current block's quiz data
    const currentBlock = blocks[unlockedIndex];
    const quizItem = currentBlock?.content_items.find(
      (item: ContentItem) => item.type === "quiz"
    );

    if (quizItem) {
      try {
        // Fetch quiz data to validate answer
        const response = await fetch(`/api/quiz/${quizItem.id}`);
        if (response.ok) {
          const quizData: QuizData = await response.json();
          const selectedAnswer = quizAnswers[unlockedIndex];

          // Check if answer is correct (first option is always correct)
          const correctOption = quizData.options[0];
          const selectedOption = quizData.options.find(
            (opt: QuizOption) => opt.id === selectedAnswer
          );
          const isAnswerCorrect = selectedOption?.text === correctOption.text;

          setQuizCompleted(isAnswerCorrect);
          setFeedback({ open: true, correct: isAnswerCorrect });
        }
      } catch (error) {
        console.error("Error checking quiz answer:", error);
      }
    }

    setButtonLoading(false);
  };

  const handleContinue = async (idx: number) => {
    const currentBlock = blocks[idx];
    const hasQuizInBlock =
      currentBlock?.content_items.some(
        (item: ContentItem) => item.type === "quiz"
      ) || false;
    const hasDragDropInBlock =
      currentBlock?.content_items.some(
        (item: ContentItem) => item.type === "drag-drop"
      ) || false;

    // If there's a quiz and no answer selected, don't proceed
    if (hasQuizInBlock && quizAnswers[idx] === undefined) {
      return;
    }

    // If there's a drag-drop and not completed, check the answers first
    if (hasDragDropInBlock && !dragDropCompleted) {
      // Call the global function to check drag-drop answers
      if (typeof window !== "undefined" && window.checkDragDropAnswers) {
        const isCorrect = window.checkDragDropAnswers();
        if (isCorrect) {
          // If correct, allow progression
          setDragDropCompleted(true);
          setDragDropReady(true);
        } else {
          // Show feedback popup for incorrect answers
          setFeedback({ open: true, correct: false });
        }
      }
      return;
    }

    // If there's a quiz and answer selected but not completed, check the answer first
    if (hasQuizInBlock && quizAnswers[idx] !== undefined && !quizCompleted) {
      await handleCheckAnswer();
      return;
    }

    setButtonLoading(true);
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
      setShowFullProgress(true);
      setTimeout(() => {
        setFinished(true);
      }, 1000);
    } else {
      setUnlockedIndex((prev) => Math.max(prev, idx + 1));
      // Reset quiz state for next block
      setQuizAnswers((prev) => ({ ...prev, [idx + 1]: undefined }));
      setQuizCompleted(false);
      setDragDropCompleted(false);
      setDragDropReady(false);
      setTimeout(() => {
        const nextBlockElement = blockRefs.current[idx + 1];
        if (nextBlockElement) {
          // Calculate the exact position to scroll to (top of the block)
          const blockTop = nextBlockElement.offsetTop;
          const navbarHeight = 96; // Account for fixed navbar (pt-24 = 96px)
          const targetScrollPosition = Math.max(
            0,
            blockTop - navbarHeight - 20
          ); // 20px extra padding, ensure not negative

          console.log("Scrolling to next block:", {
            blockTop,
            navbarHeight,
            targetScrollPosition,
            currentScroll:
              window.pageYOffset || document.documentElement.scrollTop,
          });

          // Direct smooth scroll to the exact position - no bouncing
          window.scrollTo({
            top: targetScrollPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
    setButtonLoading(false);
  };

  if (finished) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">🎉 Section Completed!</h2>
        <p className="text-gray-600 mt-2 mb-6">
          You have finished this section.
        </p>
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
        currentProgress={showFullProgress ? blocks.length : unlockedIndex}
        totalProgress={blocks.length}
      />
      <div className="max-w-4xl mx-auto p-4 pt-24 pb-20">
        {blocks.slice(0, unlockedIndex + 1).map((block, idx) => (
          <div
            key={block.id}
            ref={(el) => {
              blockRefs.current[idx] = el;
            }}
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
              onQuizAnswer={handleQuizAnswer}
              quizAnswer={quizAnswers[idx]}
              quizCompleted={quizCompleted}
              onDragDropComplete={handleDragDropComplete}
              dragDropCompletedProp={dragDropCompleted}
            />
          </div>
        ))}
        {/* Fixed Bottom Bar with Continue Button - Matching Navbar Design */}
        <div className="w-full fixed bottom-0 left-0 bg-background border-t border-border shadow-sm z-50 h-24 flex items-center px-4">
          <div className="w-full flex justify-center">
            <Button
              onClick={() => handleContinue(unlockedIndex)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 rounded-full font-semibold shadow-lg text-lg"
              style={{ minWidth: 180 }}
              disabled={
                buttonLoading ||
                (hasQuiz && quizAnswers[unlockedIndex] === undefined) ||
                (hasDragDrop && !dragDropReady)
              }
            >
              {buttonLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Processing...
                </span>
              ) : (hasQuiz &&
                  quizAnswers[unlockedIndex] !== undefined &&
                  !quizCompleted) ||
                (hasDragDrop && !dragDropCompleted) ? (
                "Check Answer"
              ) : unlockedIndex === blocks.length - 1 ? (
                "Finish"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
        {/* Feedback Card Popup - Inside Footer */}
        {feedback.open && (
          <div className="fixed left-0 right-0 bottom-0 z-50 animate-slideup h-24">
            <Card
              className={`w-full h-full shadow-2xl border-2 flex items-center justify-center overflow-hidden rounded-none ${
                feedback.correct
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <CardContent className="py-2 px-6 flex flex-row items-center justify-center w-full max-w-2xl">
                <div className="flex flex-row items-center gap-3">
                  {feedback.correct ? (
                    <div className="p-1.5 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-red-100 rounded-full">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <span
                    className={`text-base font-semibold ${
                      feedback.correct ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {feedback.correct
                      ? "🎉 Correct! Well done!"
                      : "Incorrect answer"}
                  </span>
                </div>
                {feedback.correct ? (
                  <Button
                    size="sm"
                    className="ml-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg text-base"
                    onClick={() => {
                      setFeedback({ open: false, correct: false });
                      handleContinue(unlockedIndex);
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-6 font-semibold px-8 py-3 rounded-full shadow-lg text-base"
                    onClick={() => setFeedback({ open: false, correct: false })}
                  >
                    Try Again
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
