"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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

interface ContentBlockProps {
  block: ContentBlock;
  isVisible: boolean;
  onContinue: () => void;
  canContinue: boolean;
  isLastBlock: boolean;
}

const ContentBlockComponent = ({
  block,
  isVisible,
  onContinue,
  canContinue,
  isLastBlock,
}: ContentBlockProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isVisible) return null;

  const hasQuiz = block.content_items.some((item) => item.type === "quiz");

  const handleQuizAnswer = (questionId: string, answer: any) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const checkQuizCompletion = () => {
    const quizItems = block.content_items.filter(
      (item) => item.type === "quiz"
    );
    const allAnswered = quizItems.every((item) => {
      if (!item.quiz_data) return true;

      let quizData;
      try {
        quizData =
          typeof item.quiz_data === "string"
            ? JSON.parse(item.quiz_data)
            : item.quiz_data;
      } catch (e) {
        console.error("Error parsing quiz data:", e);
        return true;
      }

      return quizData.questions?.every(
        (q: any) => quizAnswers[q.id] !== undefined
      );
    });

    if (allAnswered) {
      setQuizCompleted(true);
    }
  };

  const renderContentItem = (item: ContentItem) => {
    switch (item.type) {
      case "text":
        return (
          <div key={item.id} className="mb-4">
            <p className="text-gray-800 leading-relaxed text-sm">
              {item.content_text}
            </p>
          </div>
        );

      case "image":
        // Only check for external images on client side
        const isExternalImage = isClient
          ? item.image_url?.startsWith("http") &&
            !item.image_url.includes(window.location.hostname)
          : item.image_url?.startsWith("http");

        return (
          <div key={item.id} className="mb-4">
            <div className="relative w-full max-w-lg mx-auto">
              {isExternalImage ? (
                <img
                  src={item.image_url}
                  alt="Course content"
                  className="w-full rounded-lg"
                  style={{ maxHeight: "300px", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              ) : (
                <Image
                  src={item.image_url || "/placeholder-image.jpg"}
                  alt="Course content"
                  width={600}
                  height={300}
                  className="rounded-lg"
                  style={{ width: "100%", height: "auto" }}
                  priority={false}
                />
              )}
            </div>
          </div>
        );

      case "quiz":
        let quizData;
        try {
          quizData =
            typeof item.quiz_data === "string"
              ? JSON.parse(item.quiz_data)
              : item.quiz_data || {};
        } catch (e) {
          console.error("Error parsing quiz data:", e);
          quizData = {};
        }

        return (
          <div key={item.id} className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-3 text-sm">Quiz</h4>
            {quizData.questions?.map((question: any) => (
              <div key={question.id} className="mb-3">
                <p className="mb-2 font-medium text-sm">{question.text}</p>
                <div className="space-y-1">
                  {question.options?.map((option: any) => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        onChange={() => {
                          handleQuizAnswer(question.id, option.id);
                          setTimeout(checkQuizCompletion, 100);
                        }}
                        className="form-radio"
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "animation":
        return (
          <div key={item.id} className="mb-4">
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
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

  const canProceed = !hasQuiz || quizCompleted;

  const getButtonText = () => {
    if (hasQuiz && !quizCompleted) {
      return "Complete Quiz to Continue";
    }
    return isLastBlock ? "Finish" : "Continue";
  };

  return (
    <div className="max-w-2xl mx-auto mb-6 p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {block.title}
      </h2>

      <div className="space-y-3">
        {block.content_items
          .sort((a, b) => a.order_index - b.order_index)
          .map(renderContentItem)}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onContinue}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg font-medium transition-all text-sm ${
            canProceed
              ? isLastBlock
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default ContentBlockComponent;
