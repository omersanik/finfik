"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDroppable,
} from "@dnd-kit/core";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DragItem {
  id: string;
  text: string;
  correctCategory: string;
  currentCategory?: string;
  isCorrect?: boolean;
}

interface DragDropData {
  title: string;
  instructions: string;
  items: DragItem[];
  categories: string[];
}

interface DragDropInteractiveProps {
  data: DragDropData;
  onComplete?: (isCorrect: boolean) => void;
  completedFromParent?: boolean;
  onReadyStateChange?: (ready: boolean) => void;
}

// Extended Window interface for type safety
declare global {
  interface Window {
    getDragDropState: () => {
      items: DragItem[];
      allItemsDropped: boolean;
      isChecking: boolean;
      isCompleted: boolean;
    };
    checkDragDropAnswers?: () => boolean;
    areAllItemsDropped: () => boolean;
    debugDragDropItems: () => void;
    shouldEnableCheckAnswer: () => boolean;
    getDragDropCompletionStatus: () => {
      allDropped: boolean;
      droppedCount: number;
      totalCount: number;
      progress: number;
      canCheckAnswers: boolean;
    };
    checkDragDropAnswersManually: () => void;
    isDragDropReady: boolean;
    canEnableCheckAnswer: () => boolean;
    dragDropReadyForCheck: boolean;
  }
}

// Draggable Item Component using @dnd-kit
function DraggableItem({
  item,
  isChecking,
  shakingItems,
}: {
  item: DragItem;
  isChecking: boolean;
  shakingItems: Set<string>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-2 py-1.5 rounded-md cursor-move transition-all duration-200 text-xs font-medium flex items-center justify-between shadow-sm border ${
        shakingItems.has(item.id)
          ? "animate-shake bg-destructive/10 text-destructive border-destructive/20"
          : isChecking
          ? item.isCorrect
            ? "bg-green-50 text-green-800 border-green-200 shadow-green-100"
            : "bg-destructive/10 text-destructive border-destructive/200"
          : "bg-white text-foreground border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="flex-1 text-xs">{item.text}</span>
      {isChecking ? (
        item.isCorrect ? (
          <CheckCircle className="h-3 w-3 text-green-600 ml-1 flex-shrink-0" />
        ) : (
          <XCircle className="h-3 w-3 text-destructive ml-1 flex-shrink-0" />
        )
      ) : (
        <div className="w-3 h-3 ml-1 flex-shrink-0 opacity-30">
          <Target className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

// Droppable Category Component
function DroppableCategory({
  category,
  children,
  itemCount,
  categoryIndex,
}: {
  category: string;
  children: React.ReactNode;
  itemCount: number;
  categoryIndex: number;
  items: DragItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: category,
  });

  const isRedFlags =
    category.toLowerCase().includes("red") ||
    (category.toLowerCase().includes("flag") && categoryIndex === 0);
  const isGreenFlags =
    category.toLowerCase().includes("green") ||
    (category.toLowerCase().includes("flag") && categoryIndex === 1);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] p-6 rounded-lg transition-all duration-200 border-2 ${
        isOver
          ? "ring-4 ring-blue-500 ring-opacity-80 bg-blue-100 border-blue-400 scale-105"
          : itemCount > 0
          ? isRedFlags
            ? "bg-red-50 border-red-200 shadow-sm hover:border-red-300 hover:bg-red-100"
            : isGreenFlags
            ? "bg-green-50 border-green-200 shadow-sm hover:border-green-300 hover:bg-green-100"
            : "bg-blue-50 border-blue-200 shadow-sm hover:border-blue-300 hover:bg-blue-100"
          : "bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 hover:scale-105"
      }`}
      data-category={category}
    >
      {children}
    </div>
  );
}

export default function DragDropInteractive({
  data,
  onComplete,
  completedFromParent = false,
  onReadyStateChange,
}: DragDropInteractiveProps) {
  const [items, setItems] = useState<DragItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shakingItems, setShakingItems] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Super easy to start dragging
      },
    })
  );

  // Memoized helper functions to avoid dependency issues
  const getItemsInCategory = useCallback(
    (category: string) => {
      return items.filter((item) => item.currentCategory === category);
    },
    [items]
  );

  const getAvailableItems = useCallback(() => {
    return items.filter((item) => !item.currentCategory);
  }, [items]);

  const checkAnswers = useCallback(() => {
    const updatedItems = items.map((item) => ({
      ...item,
      isCorrect: item.currentCategory === item.correctCategory,
    }));

    setItems(updatedItems);
    setIsChecking(true);

    const correctCount = updatedItems.filter((item) => item.isCorrect).length;
    const allCorrect = correctCount === updatedItems.length;

    console.log("=== CHECKING ANSWERS ===");
    console.log(
      "Items and their correctness:",
      updatedItems.map((item) => ({
        text: item.text,
        currentCategory: item.currentCategory,
        correctCategory: item.correctCategory,
        isCorrect: item.isCorrect,
      }))
    );
    console.log(`Correct: ${correctCount}/${updatedItems.length}`);
    console.log("All correct:", allCorrect);

    if (allCorrect) {
      console.log("🎉 All answers correct! Calling onComplete(true)...");
      setIsCompleted(true);
      // Call onComplete with true to indicate successful completion
      onComplete?.(true);
      return true;
    } else {
      console.log("❌ Some answers are wrong! Showing feedback...");
      const incorrectItems = updatedItems.filter((item) => !item.isCorrect);
      setShakingItems(new Set(incorrectItems.map((item) => item.id)));

      // Reset isChecking after showing feedback
      setTimeout(() => {
        setShakingItems(new Set());
        setIsChecking(false);
      }, 2000);
      return false;
    }
  }, [items, onComplete]);

  // Initialize items and categories
  useEffect(() => {
    if (items.length === 0 && !completedFromParent) {
      const shuffledItems = [...data.items]
        .map((item, index) => ({
          ...item,
          id: `item-${index}`,
          currentCategory: undefined,
          isCorrect: undefined,
        }))
        .sort(() => Math.random() - 0.5);

      setItems(shuffledItems);
      setCategories(data.categories);
    }
  }, [data, completedFromParent, items.length]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log("=== DRAG END DEBUG ===");
    console.log("Drag end event:", { active: active.id, over: over?.id });
    console.log("Current items state:", items);
    console.log("Available items count:", getAvailableItems().length);
    console.log("Categories:", categories);

    if (over && active.id !== over.id) {
      const itemId = active.id as string;
      const category = over.id as string;

      console.log("Attempting to move item:", itemId, "to category:", category);

      // Check if the target is a category (not an item)
      if (categories.includes(category)) {
        setItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.id === itemId ? { ...item, currentCategory: category } : item
          );

          console.log(`✅ Item moved to category "${category}"`);
          console.log("Updated items:", updatedItems);
          console.log(
            "All items dropped:",
            updatedItems.every((item) => item.currentCategory)
          );
          console.log(
            "Available items after drop:",
            updatedItems.filter((item) => !item.currentCategory)
          );

          return updatedItems;
        });
      } else {
        console.log("❌ Target is not a valid category:", category);
        console.log("Valid categories:", categories);
      }
    } else {
      console.log("❌ No valid drop target or same item");
    }
    console.log("=== END DRAG END DEBUG ===");
  };

  // Expose functions to parent component
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.getDragDropState = () => ({
        items,
        allItemsDropped: items.every((item) => item.currentCategory),
        isChecking,
        isCompleted,
      });

      // Fixed: This now returns a boolean as expected
      window.checkDragDropAnswers = () => {
        if (items.every((item) => item.currentCategory)) {
          console.log("Checking drag and drop answers...");
          return checkAnswers(); // This now returns boolean
        } else {
          console.log("Cannot check answers - not all items are dropped yet");
          return false;
        }
      };

      window.areAllItemsDropped = () =>
        items.every((item) => item.currentCategory);

      window.debugDragDropItems = () => {
        console.log("=== DRAG DROP DEBUG ===");
        console.log("All items:", items);
        console.log("Available items:", getAvailableItems());
        console.log(
          "Items in categories:",
          categories.map((cat) => ({
            category: cat,
            items: getItemsInCategory(cat),
          }))
        );
        console.log(
          "All items dropped:",
          items.every((item) => item.currentCategory)
        );
        console.log("=======================");
      };

      // Also expose a function to check if check answer should be enabled
      window.shouldEnableCheckAnswer = () => {
        const allDropped = items.every((item) => item.currentCategory);
        console.log("Should enable check answer:", allDropped);
        console.log(
          "Items status:",
          items.map((item) => ({
            id: item.id,
            text: item.text,
            hasCategory: !!item.currentCategory,
            category: item.currentCategory,
          }))
        );
        return allDropped;
      };

      // Add a more reliable function for parent components
      window.getDragDropCompletionStatus = () => {
        const allDropped = items.every((item) => item.currentCategory);
        const droppedCount = items.filter(
          (item) => item.currentCategory
        ).length;
        const totalCount = items.length;

        return {
          allDropped,
          droppedCount,
          totalCount,
          progress: totalCount > 0 ? (droppedCount / totalCount) * 100 : 0,
          canCheckAnswers: allDropped && !isChecking && !isCompleted,
        };
      };

      // Function to manually check answers (for parent component)
      window.checkDragDropAnswersManually = () => {
        if (items.every((item) => item.currentCategory)) {
          console.log("Manually checking answers...");
          checkAnswers();
        } else {
          console.log("Cannot check answers - not all items are dropped yet");
        }
      };

      // Simple boolean flag for parent components
      window.isDragDropReady = items.every((item) => item.currentCategory);

      // Most reliable function for parent components
      window.canEnableCheckAnswer = () => {
        const allDropped = items.every((item) => item.currentCategory);
        const notChecking = !isChecking;
        const notCompleted = !isCompleted;

        console.log("=== CAN ENABLE CHECK ANSWER ===");
        console.log("All items dropped:", allDropped);
        console.log("Not checking:", notChecking);
        console.log("Not completed:", notCompleted);
        console.log("Can enable:", allDropped && notChecking && notCompleted);

        return allDropped && notChecking && notCompleted;
      };
    }
  }, [
    items,
    categories,
    isChecking,
    isCompleted,
    checkAnswers,
    getAvailableItems,
    getItemsInCategory,
  ]);

  // Auto-notify parent when all items are dropped (for easier integration)
  useEffect(() => {
    console.log("=== DRAG DROP INTERACTIVE: useEffect triggered ===");
    console.log("Items length:", items.length);
    console.log("Items:", items);
    console.log("isCompleted:", isCompleted);

    const allItemsDropped =
      items.length > 0 && items.every((item) => item.currentCategory);
    const readyForCheck = allItemsDropped && !isCompleted;

    console.log("allItemsDropped:", allItemsDropped);
    console.log("readyForCheck:", readyForCheck);

    // Notify parent component about ready state change
    console.log("Calling onReadyStateChange with:", readyForCheck);
    onReadyStateChange?.(readyForCheck);

    if (readyForCheck) {
      console.log(
        "🎯 All items dropped! Parent can now enable check answer button"
      );
      // This will help parent components know when to enable the check answer button
      if (typeof window !== "undefined") {
        window.dragDropReadyForCheck = true;

        // Dispatch a custom event that parent components can listen to
        const event = new CustomEvent("dragDropReady", {
          detail: {
            allItemsDropped: true,
            itemCount: items.length,
            categories: categories,
          },
        });
        window.dispatchEvent(event);
      }

      // IMPORTANT: Call onComplete with false to indicate "ready to check answers" not "completed"
      // This matches the quiz behavior where onComplete(false) means ready to check
      onComplete?.(false);
    }
  }, [items, isCompleted, categories, onComplete, onReadyStateChange]);

  const resetGame = () => {
    const shuffledItems = [...data.items]
      .map((item, index) => ({
        ...item,
        id: `item-${index}`,
        currentCategory: undefined,
        isCorrect: undefined,
      }))
      .sort(() => Math.random() - 0.5);

    setItems(shuffledItems);
    setIsChecking(false);
    setIsCompleted(false);
    setShakingItems(new Set());
  };

  const availableItems = getAvailableItems();
  const activeItem = activeId
    ? items.find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-foreground">{data.title}</h2>
          <p className="text-muted-foreground text-sm">{data.instructions}</p>
        </div>

        {/* Available Items Section */}
        <Card className="border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Available Items</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {availableItems.length} remaining
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableItems.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isChecking={isChecking}
                  shakingItems={shakingItems}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const categoryItems = getItemsInCategory(category);
            const isRedFlags =
              category.toLowerCase().includes("red") ||
              (category.toLowerCase().includes("flag") && index === 0);
            const isGreenFlags =
              category.toLowerCase().includes("green") ||
              (category.toLowerCase().includes("flag") && index === 1);

            return (
              <Card key={category} className="border border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isRedFlags ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : isGreenFlags ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Target className="h-4 w-4 text-blue-600" />
                      )}
                      <CardTitle className="text-base">{category}</CardTitle>
                    </div>
                    {categoryItems.length > 0 && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {categoryItems.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <DroppableCategory
                    category={category}
                    itemCount={categoryItems.length}
                    categoryIndex={index}
                    items={categoryItems}
                  >
                    <div className="space-y-1">
                      {categoryItems.map((item) => (
                        <DraggableItem
                          key={item.id}
                          item={item}
                          isChecking={isChecking}
                          shakingItems={shakingItems}
                        />
                      ))}
                      {categoryItems.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-base font-semibold">
                            Drop items here
                          </p>
                          <p className="text-sm opacity-70">
                            Just drag and drop from below
                          </p>
                        </div>
                      )}
                    </div>
                  </DroppableCategory>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button
            onClick={resetGame}
            variant="outline"
            className="px-4 py-2 text-sm font-medium gap-2"
            size="sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="px-2 py-1.5 rounded-md bg-white text-foreground border border-slate-300 shadow-lg cursor-move text-xs font-medium flex items-center justify-between opacity-90">
            <span className="flex-1 text-xs">{activeItem.text}</span>
            <div className="w-3 h-3 ml-1 flex-shrink-0 opacity-30">
              <Target className="w-full h-full" />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
