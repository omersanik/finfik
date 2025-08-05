"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import LoadingAnimation from "./LoadingAnimation";
import MathFormulaRenderer from "./MathFormulaRenderer";
import ChartRenderer from "./ChartRenderer";
import LottieAnimation from "./LottieAnimation";
import DragDropInteractive from "./DragDropInteractive";
import { getContentImageUrl, getThumbnailUrl } from "@/lib/thumbnail-utils";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface ContentItem {
  id: string;
  block_id: string;
  type: "text" | "image" | "quiz" | "animation" | "calculator" | "math" | "chart" | "table" | "drag-drop";
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
  drag_drop_title?: string;
  drag_drop_instructions?: string;
  drag_drop_items?: string;
  drag_drop_categories?: string;
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
  onDragDropComplete?: (isCompleted: boolean) => void;
  dragDropCompletedProp?: boolean;
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
  onDragDropComplete,
  dragDropCompletedProp = false,
}: ContentBlockProps) => {
  
  const formatMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>');
  };

  const processMathFormulas = (text: string): string => {
    console.log("Processing text for math formulas:", text);
    // Process inline math formulas in the text
    const processed = text.replace(
      /<span class="math-formula inline" data-formula="([^"]+)"><\/span>/g,
      (match, formula) => {
        console.log("Found inline math formula:", formula);
        // Create a unique ID for this math formula
        const id = `math-${Math.random().toString(36).substr(2, 9)}`;
        return `<span id="${id}" class="math-formula inline" data-formula="${formula}"></span>`;
      }
    );
    console.log("Processed text:", processed);
    return processed;
  };
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [isClient, setIsClient] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, any[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [dragDropCompleted, setDragDropCompleted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render inline math formulas after content is rendered
  useEffect(() => {
    if (isClient) {
      const renderInlineMath = async () => {
        console.log("Rendering inline math formulas...");
        // Dynamically import KaTeX
        const katex = await import('katex');
        const mathElements = document.querySelectorAll('.math-formula.inline');
        console.log("Found math elements:", mathElements.length);
        mathElements.forEach((element) => {
          const formula = element.getAttribute('data-formula');
          console.log("Processing formula:", formula);
          if (formula && element instanceof HTMLElement) {
            try {
              katex.default.render(formula, element, {
                throwOnError: false,
                displayMode: false,
              });
              console.log("Successfully rendered formula:", formula);
            } catch (error) {
              console.error('KaTeX rendering error for inline math:', error);
            }
          }
        });
      };

      // Small delay to ensure DOM is ready
      setTimeout(renderInlineMath, 100);
    }
  }, [isClient, block.content_items]);

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
            // Fisher-Yates shuffle with consistent seed for hydration
            const seed = quizItems[0].id.charCodeAt(0);
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(((seed + i) * 9301 + 49297) % 233280) % (i + 1);
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
  const hasDragDrop = block.content_items.some((item) => item.type === "drag-drop");
  
  console.log("BLOCK CONTENT ITEMS:", block.content_items.map(item => ({ id: item.id, type: item.type })));
  console.log("HAS QUIZ:", hasQuiz, "HAS DRAG DROP:", hasDragDrop);
  console.log("DRAG DROP STATE:", { dragDropCompleted, hasDragDrop });

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
    const blockHasDragDrop = block.content_items.some(item => item.type === "drag-drop");
    
    console.log("BUTTON TEXT DEBUG:", {
      blockHasQuiz,
      blockHasDragDrop,
      quizCompleted,
      dragDropCompleted,
      isLastBlock,
      contentItems: block.content_items.map(item => ({ id: item.id, type: item.type }))
    });
    
    // Debug the button text logic
    if (blockHasDragDrop) {
      if (!dragDropCompleted) {
        console.log("SHOULD SHOW: Check Answers");
        return "Check Answers";
      } else {
        console.log("SHOULD SHOW:", isLastBlock ? "Finish" : "Continue");
        return isLastBlock ? "Finish" : "Continue";
      }
    }
    
    if (blockHasQuiz) {
      if (!quizCompleted) {
        return quizAnswers.quiz === undefined ? "Select Answer" : "Check Answer";
      } else {
        return isLastBlock ? "Finish" : "Continue";
      }
    }
    
    if (blockHasDragDrop) {
      if (!dragDropCompleted) {
        return "Check Answers";
      } else {
        return isLastBlock ? "Finish" : "Continue";
      }
    }
    
    return isLastBlock ? "Finish" : "Continue";
  };

  const handleContinue = () => {
    const blockHasQuiz = block.content_items.some(item => item.type === "quiz");
    const blockHasDragDrop = block.content_items.some(item => item.type === "drag-drop");
    
    // If there's no quiz or drag-drop, just continue
    if (!blockHasQuiz && !blockHasDragDrop) {
      onContinue();
      return;
    }
    
    // Handle quiz logic
    if (blockHasQuiz) {
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
    }
    
    // Handle drag-drop logic
    if (blockHasDragDrop && !dragDropCompleted) {
      // Check drag-drop answers using the exposed function
      if (typeof window !== 'undefined' && (window as any).checkDragDropAnswers) {
        const isCorrect = (window as any).checkDragDropAnswers();
        setDragDropCompleted(isCorrect);
        return; // Don't continue yet, let user see the results
      }
    }
    
    // Both quiz and drag-drop are completed, allow continuing
    onContinue();
  };

  const renderContentItem = (item: ContentItem) => {
    console.log("RENDERING ITEM:", item.id, item.type, "content_text:", item.content_text, "math_formula:", item.math_formula);
    console.log("FULL ITEM DATA:", item);
    console.log("SWITCH DEBUG:", {
      itemId: item.id,
      itemType: item.type,
      itemTypeLength: item.type?.length,
      itemTypeTrimmed: item.type?.trim(),
      itemTypeLowerCase: item.type?.toLowerCase()
    });
    
    switch (item.type) {
      case "text":
        // Only render if type is exactly 'text'
        if (item.type !== "text") return null;
        // If this is actually a math formula, skip rendering
        if (item.content_text?.includes('class="math-formula"')) {
          return null;
        }
        return (
          <div key={item.id} className="mb-4">
            <div
              className="prose prose-sm mx-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processMathFormulas(item.content_text || "") }}
              style={{
                fontFamily: item.font_settings?.fontFamily,
                fontSize: item.font_settings?.fontSize || '14px',
                color: item.font_settings?.color,
                textAlign: item.font_settings?.textAlign,
              }}
            />
          </div>
        );
      case "math":
        // Only render if type is exactly 'math'
        if (item.type !== "math") return null;
        const formula = item.math_formula || "";
        console.log("MATH CASE: Rendering math formula:", formula);
        console.log("MATH CASE: Item ID:", item.id);
        console.log("MATH CASE: Item type:", item.type);
        console.log("MATH CASE: Content text:", item.content_text);
        console.log("MATH CASE: Math formula:", item.math_formula);
        return (
          <div key={item.id} className="mb-2" data-debug="math-item-container">
            <MathFormulaRenderer
              formula={formula}
              display="block"
              className={item.styling_data?.className}
            />
          </div>
        );
      case "chart":
        return (
          <div key={item.id} className="mb-3">
            <ChartRenderer
              chartData={item.content_text || "{}"}
              className={item.styling_data?.className}
            />
          </div>
        );

      case "image":
        console.log("IMAGE ITEM DEBUG:", {
          itemId: item.id,
          image_url: item.image_url,
          hasImageUrl: !!item.image_url,
          imageUrlType: typeof item.image_url,
          fullItem: item
        });
        
        // Try using the same function as thumbnails first
        console.log("ORIGINAL IMAGE PATH:", item.image_url);
        const imageUrl = getThumbnailUrl(item.image_url || null);
        console.log("IMAGE DEBUG:", {
          originalImageUrl: item.image_url,
          processedImageUrl: imageUrl,
          itemId: item.id,
          usingThumbnailFunction: true
        });
        // Also log to alert for visibility
        console.warn("IMAGE DEBUG ALERT:", {
          originalImageUrl: item.image_url,
          processedImageUrl: imageUrl,
          itemId: item.id,
          decodedUrl: decodeURIComponent(imageUrl),
          hasSpaces: item.image_url?.includes(' ') || false
        });
        return (
          <div key={item.id} className="mb-1">
            <div className="relative w-full max-w-sm mx-auto">
              <Image
                src={imageUrl}
                alt="Course content"
                width={350}
                height={250}
                className="w-full"
                style={{ width: "100%", height: "auto" }}
                priority={false}
                onError={(e) => {
                  console.log("IMAGE ERROR:", {
                    failedUrl: e.currentTarget.src,
                    itemId: item.id
                  });
                  e.currentTarget.src = "/placeholder-image.jpg";
                }}
              />
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
        // Process animation path through Supabase URL function
        const animationUrl = getThumbnailUrl(item.image_url || null);
        console.log("ANIMATION DEBUG:", {
          originalPath: item.image_url,
          processedUrl: animationUrl,
          itemId: item.id
        });
        
        return (
          <div key={item.id} className="mb-4">
            <LottieAnimation
              animationPath={animationUrl}
              size="custom"
              width={item.animation_settings?.width || 400}
              height={item.animation_settings?.height || 400}
              loop={item.animation_settings?.loop !== false}
              autoplay={item.animation_settings?.autoplay !== false}
              className="mx-auto"
            />
          </div>
        );

      case "table":
        try {
          const tableData = JSON.parse(item.content_text || '{}');
          
          // Handle both old and new table data formats
          const headers = tableData.headers || [];
          const rows = tableData.rows || [];
          
          return (
            <div key={item.id} className="mb-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header: string, index: number) => (
                      <TableHead key={index} className="font-medium">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(header || '') }}
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row: any[], rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell: any, colIndex: number) => {
                        // Handle both Cell objects and string values
                        const cellValue = typeof cell === 'object' && cell.value !== undefined 
                          ? cell.value 
                          : (typeof cell === 'string' ? cell : '');
                        
                        return (
                          <TableCell key={colIndex}>
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: formatMarkdown(cellValue) }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        } catch (error) {
          console.error('Error parsing table data:', error);
          console.error('Table content:', item.content_text);
          return (
            <div key={item.id} className="mb-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">Error loading table data</p>
              <p className="text-xs text-red-500 mt-1">Check console for details</p>
            </div>
          );
        }

      case "drag-drop":
        console.log("RENDERING DRAG-DROP ITEM:", item.id, item.type);
        console.log("DRAG-DROP DATA:", {
          drag_drop_title: item.drag_drop_title,
          drag_drop_instructions: item.drag_drop_instructions,
          drag_drop_items: item.drag_drop_items,
          drag_drop_categories: item.drag_drop_categories
        });
        
        // Parse drag drop data
        const parseDragDropData = () => {
          try {
            console.log('Parsing drag drop data:', {
              items: item.drag_drop_items,
              categories: item.drag_drop_categories,
              title: item.drag_drop_title,
              instructions: item.drag_drop_instructions
            });

            const items = item.drag_drop_items?.split('\n').filter(line => line.trim()) || [];
            console.log('Parsed items:', items);
            
            const parsedItems = items.map((line, index) => {
              const parts = line.split('→');
              if (parts.length !== 2) {
                console.error('Invalid item format:', line);
                return null;
              }
              const [text, fullCategory] = parts.map(s => s.trim());
              
              // Handle empty category - try to infer from context
              let correctCategory = fullCategory;
              if (!fullCategory) {
                console.warn('Empty category for item:', text, '- attempting to infer...');
                // Try to infer category based on the text
                if (text.toLowerCase().includes('rental') || text.toLowerCase().includes('property')) {
                  correctCategory = 'Asset';
                } else if (text.toLowerCase().includes('subscription') || text.toLowerCase().includes('handbag')) {
                  correctCategory = 'Liability';
                } else {
                  console.error('Cannot infer category for item:', text);
                  return null;
                }
              } else {
                // Extract just the category name (before any parentheses)
                correctCategory = fullCategory.split('(')[0].trim();
              }
              
              return {
                id: `item-${index}`,
                text,
                correctCategory
              };
            }).filter((item): item is { id: string; text: string; correctCategory: string } => item !== null);

            const categories = item.drag_drop_categories?.split('\n').filter(line => line.trim()) || [];
            console.log('Parsed categories:', categories);

            const result = {
              title: item.drag_drop_title || "",
              instructions: item.drag_drop_instructions || "",
              items: parsedItems,
              categories
            };

            console.log('Final parsed data:', result);
            return result;
          } catch (error) {
            console.error('Error parsing drag drop data:', error);
            return null;
          }
        };

        const dragDropData = parseDragDropData();
        
        if (!dragDropData) {
          return (
            <div key={item.id} className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">Error loading drag and drop activity</p>
            </div>
          );
        }

        return (
          <div key={item.id} className="mb-4">
            <DragDropInteractive 
              data={dragDropData}
              completedFromParent={dragDropCompleted}
              onComplete={(isCorrect) => {
                console.log('Drag drop completed:', isCorrect);
                console.log('Setting dragDropCompleted to:', isCorrect);
                // Store the result for the footer button
                setDragDropCompleted(isCorrect);
                // Also notify parent component
                if (onDragDropComplete) {
                  onDragDropComplete(isCorrect);
                }
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = (!hasQuiz && !hasDragDrop) || (hasQuiz && quizCompleted) || (hasDragDrop && dragDropCompleted);

  return (
    <div className="relative">
      {locked && (
        <div className="absolute inset-0 bg-white bg-opacity-70 dark:bg-neutral-800 dark:bg-opacity-80 z-10 flex items-center justify-center pointer-events-auto">
          <span className="text-gray-400 dark:text-neutral-300 text-lg font-semibold">Locked</span>
        </div>
      )}
      <div className={locked ? "pointer-events-none opacity-60" : ""}>
        <div className="max-w-2xl mx-auto mb-6 p-6">
          <h2 className="text-sm font-semibold mb-4 text-gray-900 dark:text-neutral-200 font-lora">
            {block.title}
          </h2>

          <div className="space-y-4">
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
                disabled={locked || 
                  (block.content_items.some(item => item.type === "quiz") && !quizCompleted) ||
                  (block.content_items.some(item => item.type === "drag-drop") && !dragDropCompleted)
                }
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  !locked
                    ? (block.content_items.some(item => item.type === "quiz") && !quizCompleted) ||
                      (block.content_items.some(item => item.type === "drag-drop") && !dragDropCompleted)
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : (block.content_items.some(item => item.type === "quiz") && quizCompleted) ||
                        (block.content_items.some(item => item.type === "drag-drop") && dragDropCompleted)
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
