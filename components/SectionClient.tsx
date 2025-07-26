// File: components/SectionClient.tsx
"use client";

import ContentBlockComponent from "./ContentBlock";
import { useState, useEffect, useRef } from "react";
import CourseIdNavbar from "./CourseIdNavbar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface ContentItem {
  id: string;
  block_id: string;
  type: "text" | "image" | "quiz" | "animation" | "calculator" | "math" | "chart";
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
  const [buttonLoading, setButtonLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [allowContinue, setAllowContinue] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean }>({ open: false, correct: false });
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

  const hasQuiz = blocks[unlockedIndex]?.content_items.some((item: any) => item.type === "quiz") || false;

  const handleQuizAnswer = (answer: any) => {
    setQuizAnswers(prev => ({ ...prev, [unlockedIndex]: answer }));
  };

  const handleCheckAnswer = async () => {
    setButtonLoading(true);
    
    // Get the current block's quiz data
    const currentBlock = blocks[unlockedIndex];
    const quizItem = currentBlock?.content_items.find((item: any) => item.type === "quiz");
    
    if (quizItem) {
      try {
        // Fetch quiz data to validate answer
        const response = await fetch(`/api/quiz/${quizItem.id}`);
        if (response.ok) {
          const quizData = await response.json();
          const selectedAnswer = quizAnswers[unlockedIndex];
          
          // Check if answer is correct (first option is always correct)
          const correctOption = quizData.options[0];
          const selectedOption = quizData.options.find((opt: any) => opt.id === selectedAnswer);
          const isAnswerCorrect = selectedOption?.text === correctOption.text;
          
          setQuizCompleted(isAnswerCorrect);
          setAllowContinue(isAnswerCorrect);
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
    const hasQuizInBlock = currentBlock?.content_items.some((item: any) => item.type === "quiz") || false;
    
    // If there's a quiz and no answer selected, don't proceed
    if (hasQuizInBlock && quizAnswers[idx] === undefined) {
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
      setQuizAnswers(prev => ({ ...prev, [idx + 1]: undefined }));
      setQuizCompleted(false);
      setAllowContinue(false);
      setTimeout(() => {
        blockRefs.current[idx + 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    setButtonLoading(false);
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
        currentProgress={showFullProgress ? blocks.length : unlockedIndex}
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
              onQuizAnswer={handleQuizAnswer}
              quizAnswer={quizAnswers[idx]}
              quizCompleted={quizCompleted}
            />
          </div>
        ))}
        {/* Single Continue Button at the bottom */}
        {unlockedIndex < blocks.length && (
          <div className="flex justify-center mt-8 sticky bottom-8 z-20">
            <Button
              onClick={() => handleContinue(unlockedIndex)}
              className="px-6 py-2 rounded-lg font-medium transition-all text-sm bg-primary text-white shadow hover:bg-primary/90"
              style={{ minWidth: 160 }}
              disabled={buttonLoading || (hasQuiz && quizAnswers[unlockedIndex] === undefined)}
            >
              {buttonLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Processing...
                </span>
              ) : hasQuiz && quizAnswers[unlockedIndex] !== undefined && !quizCompleted ? "Check Answer" : unlockedIndex === blocks.length - 1 ? "Finish" : "Continue"}
            </Button>
          </div>
        )}
        {/* Feedback Card Popup */}
        {feedback.open && (
          <div className="fixed left-1/2 bottom-8 z-50 transform -translate-x-1/2 animate-slideup">
            <Card className={`w-[420px] shadow-2xl border-2 flex items-center justify-center overflow-hidden ${feedback.correct ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
              <CardContent className="py-2 px-4 flex flex-row items-center justify-between w-full">
                <div className="flex flex-row items-center gap-2">
                  {feedback.correct ? (
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-600" />
                  )}
                  <span className={`text-base font-bold ${feedback.correct ? 'text-green-700' : 'text-red-700'}`}>{feedback.correct ? "Correct!" : "Wrong answer"}</span>
                </div>
                {feedback.correct ? (
                  <Button size="sm" className="ml-2" onClick={() => { setFeedback({ open: false, correct: false }); handleContinue(unlockedIndex); }}>
                    Continue
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" className="ml-2" onClick={() => setFeedback({ open: false, correct: false })}>
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
