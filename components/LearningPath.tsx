// components/LearningPathClient.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Lock, Star, BookOpen, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  courseSlug: string;
  description: string;
  lessons: string[];
  sectionSlug: string;
}

interface Position {
  x: number;
  y: number;
}

const LearningPathClient: React.FC<{
  steps: Lesson[];
  comingSoon?: boolean;
}> = ({ steps, comingSoon = false }) => {
  const [selectedStep, setSelectedStep] = useState<Lesson | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<Lesson | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelectedStep(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCirclePosition = (index: number): Position => {
    const spacingY = 20;
    const baseY = 8;
    const amplitude = 30;
    const frequency = 0.8;

    const y = baseY + index * spacingY;
    const x = 50 + amplitude * Math.sin(frequency * index);

    return { x, y };
  };

  const getButtonText = (step: Lesson): string => {
    if (!step.unlocked) return "Complete Previous Lessons First";
    if (step.completed) return "Review Lesson";
    return "Start Lesson";
  };

  const getButtonVariant = (
    step: Lesson
  ): "default" | "secondary" | "outline" => {
    if (!step.unlocked) return "secondary";
    if (step.completed) return "outline";
    return "default";
  };

  return (
    <div className="flex-1 relative">
      {comingSoon && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
          <div className="bg-yellow-100 text-yellow-800 font-bold px-6 py-3 rounded-xl shadow text-2xl mb-2">
            Coming Soon
          </div>
          <div className="text-gray-600 text-lg">
            This course is not yet available.
          </div>
        </div>
      )}
      <div ref={containerRef} className="relative w-96 h-[580px] mx-auto">
        {steps.map((step, index) => {
          const position = getCirclePosition(index);
          return (
            <div
              key={step.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${
                selectedStep?.id === step.id
                  ? "z-50"
                  : hoveredStep?.id === step.id
                  ? "z-[9999]"
                  : "z-20"
              }`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div
                onClick={() => {
                  setSelectedStep(selectedStep?.id === step.id ? null : step);
                  setHoveredStep(null); // Hide tooltip when clicking
                }}
                onMouseEnter={() => setHoveredStep(step)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`relative w-18 h-18 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-125 cursor-pointer
                  ${
                    step.completed
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white shadow-emerald-200"
                      : step.unlocked
                      ? "bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-blue-200"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-gray-200"
                  }`}
              >
                {step.completed ? (
                  <Check className="w-7 h-7 text-white drop-shadow-sm" />
                ) : step.unlocked ? (
                  <BookOpen className="w-7 h-7 text-white drop-shadow-sm" />
                ) : (
                  <Lock className="w-7 h-7 text-gray-400" />
                )}

                {step.completed && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                  </div>
                )}
              </div>

              {/* Tooltip positioned under the circle */}
              {hoveredStep?.id === step.id && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg text-center min-w-32">
                    <div className="break-words leading-relaxed">
                      {step.title}
                    </div>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              )}

              {selectedStep?.id === step.id && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80">
                  <Card className="shadow-2xl border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                              : step.unlocked
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                        >
                          {step.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : step.unlocked ? (
                            <BookOpen className="w-4 h-4 text-white" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <CardTitle className="text-lg leading-tight break-words min-w-0 flex-1">
                          {step.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed">
                        {step.description}
                      </CardDescription>

                      <Button
                        className="w-full"
                        variant={getButtonVariant(step)}
                        disabled={
                          !step.unlocked || loadingIndex === index || comingSoon
                        }
                        onClick={async () => {
                          if (step.unlocked && !comingSoon) {
                            setLoadingIndex(index);
                            // Keep loading until navigation starts
                            router.push(
                              `/courses/${
                                step.courseSlug
                              }/${step.sectionSlug.trim()}`
                            );
                            // Don't reset loadingIndex here - let it continue until page changes
                          }
                        }}
                      >
                        {comingSoon ? (
                          <span className="text-yellow-700 font-semibold">
                            Coming Soon
                          </span>
                        ) : loadingIndex === index ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Loader2 className="animate-spin h-4 w-4" />
                            Starting...
                          </span>
                        ) : (
                          getButtonText(step)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-200 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathClient;
