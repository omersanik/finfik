"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import LoadingAnimation from "./LoadingAnimation";
import MathFormulaRenderer from "./MathFormulaRenderer";
import ChartRenderer from "./ChartRenderer";

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
  content_type?: string;
  styling_data?: any;
  math_formula?: string;
  interactive_data?: any;
  media_files?: any;
  font_settings?: any;
  layout_config?: any;
  animation_settings?: any;
}

interface ContentBlock {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}

interface ContentBlockProps {
  block: ContentBlock;
  isVisible: boolean;
  onContinue: () => void;
  canContinue: boolean;
  isLastBlock: boolean;
  locked?: boolean;
  hideContinueButton?: boolean;
  onQuizAnswer?: (answer: any) => void;
  quizAnswer?: any;
  quizCompleted?: boolean;
}

const ContentBlockComponent = ({
  block,
  isVisible,
  onContinue,
  canContinue,
  isLastBlock,
  locked = false,
  hideContinueButton = false,
  onQuizAnswer,
  quizAnswer,
  quizCompleted = false,
}: ContentBlockProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [isClient, setIsClient] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, any[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset quiz state when block changes
  useEffect(() => {
    setQuizAnswers({ quiz: undefined });
    setShowFeedback(false);
    setIsCorrect(false);
  }, [block.id]);

  // Fetch quiz data from database when component mounts
  useEffect(() => {
    const fetchQuizData = async () => {
      const quizItems = block.content_items.filter(item => item.type === "quiz");
      
      if (quizItems.length > 0) {
        try {
          const response = await fetch(`/api/quiz/${quizItems[0].id}`);
          
          if (response.ok) {
            const data = await response.json();
            setQuizData(data);
            
            // Use a consistent seed for shuffling to avoid hydration issues
            const options = [...data.options];
            // Simple shuffle using block ID as seed for consistency
            const seed = quizItems[0].id.charCodeAt(0) % options.length;
            for (let i = options.length - 1; i > 0; i--) {
              const j = (seed + i) % (i + 1);
              [options[i], options[j]] = [options[j], options[i]];
            }
            setShuffledOptions({ quiz: options });
          } else {
            const errorData = await response.json();
            console.error("Quiz API error:", errorData);
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        }
      }
    };

    fetchQuizData();
  }, [block.content_items]);

  if (!isVisible) return null;

  const hasQuiz = block.content_items.some((item) => item.type === "quiz");

  const handleQuizAnswer = (questionId: string, answer: any) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    
    // Notify parent component about the answer selection
    if (onQuizAnswer) {
      onQuizAnswer(answer);
    }
  };

  const checkQuizCompletion = () => {
    if (!quizData) return;
    
    // Check if user has answered the quiz
    const hasAnswered = quizAnswers.quiz !== undefined;

    if (hasAnswered) {
      // Quiz completion is now managed by parent component
    }
  };

  const handleCheckAnswer = () => {
    const blockHasQuiz = block.content_items.some(item => item.type === "quiz");
    
    if (blockHasQuiz && !quizCompleted) {
      // Check if user has answered
      if (quizAnswers.quiz === undefined) {
        alert("Please select an answer before checking.");
        return;
      }
      
      // Check if answer is correct (first option is correct)
      const selectedOption = shuffledOptions.quiz?.find(opt => opt.id === quizAnswers.quiz);
      const correctOption = quizData.options[0]; // First option is always correct
      const isAnswerCorrect = selectedOption?.text === correctOption.text;
      
      setIsCorrect(isAnswerCorrect);
      setShowFeedback(true);
      
      if (isAnswerCorrect) {
        // Hide feedback after 2 seconds
        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      } else {
        // Hide feedback after 2 seconds
        setTimeout(() => {
          setShowFeedback(false);
        }, 2000);
      }
    }
  };

  const getButtonText = () => {
    const blockHasQuiz = block.content_items.some(item => item.type === "quiz");
    
    if (blockHasQuiz) {
      if (!quizCompleted) {
        return quizAnswers.quiz === undefined ? "Select Answer" : "Check Answer";
      } else {
        return isLastBlock ? "Finish" : "Continue";
      }
    }
    
    return isLastBlock ? "Finish" : "Continue";
  };

  const handleContinue = () => {
    const blockHasQuiz = block.content_items.some(item => item.type === "quiz");
    
    // If there's no quiz, just continue
    if (!blockHasQuiz) {
      onContinue();
      return;
    }
    
    // If there's a quiz but no answer selected
    if (quizAnswers.quiz === undefined) {
      alert("Please select an answer first.");
      return;
    }
    
    // If quiz is not completed yet, check the answer
    if (!quizCompleted) {
      handleCheckAnswer();
      return;
    }
    
    // Quiz is completed, allow continuing
    onContinue();
  };

  const renderContentItem = (item: ContentItem) => {
    switch (item.type) {
      case "text":
        return (
          <div key={item.id} className="mb-3">
            <div
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: item.content_text || "" }}
              style={{
                fontFamily: item.font_settings?.fontFamily,
                fontSize: item.font_settings?.fontSize,
                color: item.font_settings?.color,
                textAlign: item.font_settings?.textAlign,
              }}
            />
          </div>
        );

      case "math":
        // Extract formula from content_text if math_formula is empty (for existing content)
        let formula = item.math_formula || "";
        if (!formula && item.content_text) {
          const mathFormulaMatch = item.content_text.match(/data-formula="([^"]+)"/);
          if (mathFormulaMatch) {
            formula = mathFormulaMatch[1];
          }
        }
        
        return (
          <div key={item.id} className="mb-3">
            <MathFormulaRenderer
              formula={formula}
              display="block"
              className={item.styling_data?.className}
            />
          </div>
        );

      case "chart":
        return (
          <div key={item.id} className="mb-6">
            <ChartRenderer
              chartData={item.content_text || "{}"}
              className={item.styling_data?.className}
            />
          </div>
        );

      case "image":
        // Only check for external images on client side
        const isExternalImage = isClient
          ? item.image_url?.startsWith("http") &&
            !item.image_url.includes(window.location.hostname)
          : item.image_url?.startsWith("http");

        return (
          <div key={item.id} className="mb-3">
            <div className="relative w-full max-w-xs mx-auto">
              {isExternalImage ? (
                <img
                  src={item.image_url}
                  alt="Course content"
                  className="w-full rounded-xl border border-gray-100 dark:border-neutral-700"
                  style={{ maxHeight: "120px", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              ) : (
                <Image
                  src={item.image_url || "/placeholder-image.jpg"}
                  alt="Course content"
                  width={240}
                  height={120}
                  className="rounded-xl border border-gray-100 dark:border-neutral-700"
                  style={{ width: "100%", height: "auto" }}
                  priority={false}
                />
              )}
            </div>
          </div>
        );

            case "quiz":
        // Don't render quiz until data is loaded to prevent hydration issues
        if (!isClient || !quizData) {
          return (
            <div key={item.id} className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
              <h4 className="font-medium mb-2 text-sm font-lora">Quiz</h4>
              <Suspense fallback={<div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>}>
                <div className="flex items-center justify-center py-4">
                  <LoadingAnimation size="small" />
                  <span className="ml-2 text-sm text-gray-500">Loading quiz...</span>
                </div>
              </Suspense>
            </div>
          );
        }

        return (
          <div key={item.id} className="mb-3 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
            <h4 className="font-medium mb-2 text-sm font-lora">Quiz</h4>
            <p className="mb-3 font-medium text-sm font-lora">{quizData.question}</p>
            
            {/* Feedback message */}
            {showFeedback && (
              <div className={`mb-3 p-3 rounded-lg text-sm font-medium ${
                isCorrect 
                  ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
              }`}>
                {isCorrect ? '🎉 Good job! Correct answer!' : '❌ Incorrect answer. Try again!'}
              </div>
            )}
            
            <div className="space-y-2">
              {shuffledOptions.quiz?.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 text-sm font-lora cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <input
                      type="radio"
                      name="quiz"
                      value={option.id}
                      onChange={() => {
                        handleQuizAnswer("quiz", option.id);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      quizAnswers.quiz === option.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300 dark:border-neutral-600 hover:border-primary/50'
                    }`}>
                      {quizAnswers.quiz === option.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span className="flex-1">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "animation":
        return (
          <div key={item.id} className="mb-3">
            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                Animation Component: {item.component_key}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = !hasQuiz || (hasQuiz && quizCompleted);

  return (
    <div className="relative">
      {locked && (
        <div className="absolute inset-0 bg-white bg-opacity-70 dark:bg-neutral-800 dark:bg-opacity-80 z-10 flex items-center justify-center pointer-events-auto">
          <span className="text-gray-400 dark:text-neutral-300 text-lg font-semibold">Locked</span>
        </div>
      )}
      <div className={locked ? "pointer-events-none opacity-60" : ""}>
        <div className="max-w-lg mx-auto mb-4 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
          <h2 className="text-base font-semibold mb-3 text-gray-900 dark:text-neutral-200 font-lora">
            {block.title}
          </h2>

          <div className="space-y-3">
            {block.content_items
              .sort((a, b) => a.order_index - b.order_index)
              .map((item) => (
                <div key={item.id} className="dark:text-neutral-200">
                  {renderContentItem(item)}
                </div>
              ))}
          </div>

          {!hideContinueButton && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleContinue}
                disabled={locked || (block.content_items.some(item => item.type === "quiz") && !quizCompleted)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  !locked
                    ? (block.content_items.some(item => item.type === "quiz") && !quizCompleted)
                      ? quizAnswers.quiz === undefined
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                      : quizCompleted
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-300 text-gray-500 dark:bg-neutral-700 dark:text-neutral-400 cursor-not-allowed"
                }`}
              >
                {getButtonText()}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentBlockComponent;
