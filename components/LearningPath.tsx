"use client";
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
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  description: string;
  lessons: string[];
}

interface Position {
  x: number;
  y: number;
}

const LearningPath: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<Lesson | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const steps: Lesson[] = [
    {
      id: 1,
      title: "What is a stock",
      completed: true,
      unlocked: true,
      description:
        "Learn the fundamental concept of stocks, how they represent ownership in companies, and why people buy and sell them.",
      lessons: [
        "Stock basics",
        "Company ownership",
        "Share types",
        "Market participation",
      ],
    },
    {
      id: 2,
      title: "First exchange ever",
      completed: true,
      unlocked: true,
      description:
        "Discover the fascinating history of the first stock exchange and how trading evolved from coffee houses to digital platforms.",
      lessons: [
        "Amsterdam Stock Exchange",
        "Trading evolution",
        "Historical context",
        "Modern markets",
      ],
    },
    {
      id: 3,
      title: "How to know what to invest",
      completed: false,
      unlocked: true,
      description:
        "Master the art of investment research, fundamental analysis, and how to evaluate companies before investing your money.",
      lessons: [
        "Research methods",
        "Financial statements",
        "Company analysis",
        "Risk assessment",
      ],
    },
    {
      id: 4,
      title: "What is a bond",
      completed: false,
      unlocked: false,
      description:
        "Understand bonds as debt instruments, how they work differently from stocks, and their role in a balanced portfolio.",
      lessons: [
        "Bond fundamentals",
        "Interest rates",
        "Government vs corporate",
        "Portfolio balance",
      ],
    },
    {
      id: 5,
      title: "What does Wall Street do",
      completed: false,
      unlocked: false,
      description:
        "Explore the role of Wall Street, major financial institutions, and how they influence global markets and economy.",
      lessons: [
        "Financial district",
        "Investment banks",
        "Market makers",
        "Economic impact",
      ],
    },
  ];

  const getCirclePosition = (index: number): Position => {
    const positions: Position[] = [
      { x: 50, y: 10 }, // Start center-top
      { x: 15, y: 25 }, // Left
      { x: 70, y: 40 }, // Right
      { x: 25, y: 65 }, // Left-lower
      { x: 50, y: 85 }, // Center-bottom
    ];
    return positions[index] || { x: 50, y: 50 };
  };

  const getConnectionPath = (from: number, to: number): string => {
    const fromPos = getCirclePosition(from);
    const toPos = getCirclePosition(to);

    // Create smooth curved path between positions
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    // Calculate control point for curve
    let controlX = midX;
    let controlY = midY;

    // Add curve variation based on position relationship
    const deltaX = toPos.x - fromPos.x;
    const deltaY = toPos.y - fromPos.y;

    // Create more pronounced curves
    if (Math.abs(deltaX) > 20) {
      controlY += deltaX > 0 ? -10 : 10;
    }
    if (Math.abs(deltaY) > 20 && Math.abs(deltaX) < 30) {
      controlX += deltaY > 0 ? 15 : -15;
    }

    return `M${fromPos.x},${fromPos.y} Q${controlX},${controlY} ${toPos.x},${toPos.y}`;
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
      <div ref={containerRef} className="relative w-96 h-96 mx-auto">
        {/* Connection Paths */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {steps.slice(0, -1).map((step, index) => {
            const nextStep = steps[index + 1];
            const path = getConnectionPath(index, index + 1);
            return (
              <path
                key={index}
                d={path}
                stroke={
                  step.completed && nextStep.unlocked ? "#10b981" : "#d1d5db"
                }
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={
                  step.completed && nextStep.unlocked ? "0" : "2,1"
                }
                className="transition-all duration-500"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Animated dots on completed paths */}
          {steps.slice(0, -1).map((step, index) => {
            const nextStep = steps[index + 1];
            if (!step.completed || !nextStep.unlocked) return null;
            const path = getConnectionPath(index, index + 1);
            return (
              <g key={`dots-${index}`}>
                <circle r="0.8" fill="#10b981" opacity="0.8">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
                <circle r="0.6" fill="#34d399" opacity="0.6">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    begin="1s"
                    path={path}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Step Circles */}
        {steps.map((step, index) => {
          const position = getCirclePosition(index);
          return (
            <div
              key={step.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${
                selectedStep?.id === step.id ? "z-50" : "z-20"
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              {/* Step Circle */}
              <div
                onClick={() =>
                  setSelectedStep(selectedStep?.id === step.id ? null : step)
                }
                className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-125 cursor-pointer
                  ${
                    step.completed
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white shadow-emerald-200"
                      : step.unlocked
                      ? "bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-blue-200"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-gray-200"
                  }
                `}
              >
                {step.completed ? (
                  <Check className="w-6 h-6 text-white drop-shadow-sm" />
                ) : step.unlocked ? (
                  <BookOpen className="w-6 h-6 text-white drop-shadow-sm" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}

                {/* Completion Badge */}
                {step.completed && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-2.5 h-2.5 text-yellow-800 fill-current" />
                  </div>
                )}
              </div>

              {/* Hover Title */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                  {step.title}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>

              {/* Small Popup Card */}
              {selectedStep?.id === step.id && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80">
                  <Card className="shadow-2xl border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${
                            step.completed
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                              : step.unlocked
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }
                        `}
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
                          {step.lessons.map((lesson, lessonIndex) => (
                            <Badge
                              key={lessonIndex}
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
                      >
                        {getButtonText(step)}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Arrow pointing to circle */}
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

export default LearningPath;
