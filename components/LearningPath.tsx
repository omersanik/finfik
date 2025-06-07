// components/LearningPathClient.tsx
"use client";
import { useRouter } from "next/navigation";

import React, { useState, useRef, useEffect } from "react";
import { Check, Lock, Star, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  unlocked: boolean;
  description: string;
  lessons: string[];
  courseSlug: string;
  order: number;
  quiz_passed: boolean;
}

interface Position {
  x: number;
  y: number;
}

const LearningPathClient: React.FC<{ steps: Lesson[] }> = ({ steps }) => {
  const [selectedStep, setSelectedStep] = useState<Lesson | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

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
      <div ref={containerRef} className="relative w-96 h-[580px] mx-auto">
        {sortedSteps.map((step, index) => {
          const position = getCirclePosition(index);
          return (
            <div
              key={step.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${
                selectedStep?.id === step.id ? "z-50" : "z-20"
              }`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div
                onClick={() =>
                  setSelectedStep(selectedStep?.id === step.id ? null : step)
                }
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-125 cursor-pointer
                  ${
                    step.completed
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white shadow-emerald-200"
                      : step.unlocked
                      ? "bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-blue-200"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-gray-200"
                  }`}
              >
                {step.completed ? (
                  <Check className="w-6 h-6 text-white drop-shadow-sm" />
                ) : step.unlocked ? (
                  <BookOpen className="w-6 h-6 text-white drop-shadow-sm" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}

                {step.completed && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                  </div>
                )}
              </div>

              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                  {step.title}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>

              {selectedStep?.id === step.id && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80">
                  <Card className="shadow-2xl border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed">
                        {step.description}
                      </CardDescription>
                      <div>
                        <h5 className="font-semibold text-sm mb-2">
                          Lesson Topics:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {step.lessons.map((lesson, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {lesson}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        variant={getButtonVariant(step)}
                        disabled={!step.unlocked}
                        onClick={() => {
                          if (step.unlocked) {
                            router.push(
                              `/courses/${step.courseSlug}/${step.id}`
                            );
                          }
                        }}
                      >
                        {getButtonText(step)}
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
