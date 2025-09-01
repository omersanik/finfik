"use client";

import React, { useEffect } from "react";
import {
  useHeavyContent,
  useLazyLoadTrigger,
} from "@/lib/hooks/useHeavyContent";
import DragDropInteractive from "./DragDropInteractive";

interface DragDropContentProps {
  item: {
    id: string;
    type: string;
  };
  dragDropCompleted: boolean;
  onDragDropComplete?: (isCorrect: boolean) => void;
  onReadyStateChange?: (ready: boolean) => void;
}

export default function DragDropContent({
  item,
  dragDropCompleted,
  onDragDropComplete,
  onReadyStateChange,
}: DragDropContentProps) {
  const { shouldLoad, triggerLoad } = useLazyLoadTrigger();
  const { heavyData, loading, error } = useHeavyContent(
    item.id,
    item.type,
    shouldLoad
  );

  // Automatically trigger loading when component mounts
  useEffect(() => {
    if (!shouldLoad) {
      triggerLoad();
    }
  }, [shouldLoad, triggerLoad]);

  // Show loading state (automatically loading)
  if (loading || !shouldLoad) {
    return (
      <div className="mb-4">
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            Loading drag & drop activity...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">
            Error loading drag and drop activity
          </p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <button
            onClick={triggerLoad}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Process the loaded heavy data
  if (!heavyData) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  console.log("=== DRAG-DROP HEAVY DATA LOADED ===");
  console.log("Heavy data:", heavyData);
  console.log("drag_drop_categories:", heavyData.drag_drop_categories);
  console.log("drag_drop_items:", heavyData.drag_drop_items);

  const dragDropCategories = heavyData.drag_drop_categories;
  const dragDropItems = heavyData.drag_drop_items;

  // Validate the heavy data
  const hasValidCategories =
    dragDropCategories &&
    String(dragDropCategories).trim().length > 0 &&
    !String(dragDropCategories).includes("undefined") &&
    String(dragDropCategories) !== "null";

  const hasValidItems =
    dragDropItems &&
    String(dragDropItems).trim().length > 0 &&
    !String(dragDropItems).includes("undefined") &&
    String(dragDropItems) !== "null";

  if (!hasValidCategories || !hasValidItems) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">
            Error loading drag and drop activity
          </p>
          <p className="text-red-500 text-sm mt-2">
            Required data is missing or contains invalid values for this
            activity. Categories valid: {String(hasValidCategories)}, Items
            valid: {String(hasValidItems)}. Please refresh the page or contact
            support if the issue persists.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Expected format: &quot;Item text → Category name&quot; (one per
            line)
          </p>
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer">
              Debug Info (Updated Version ✅)
            </summary>
            <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
              Item ID: {item.id}
              {JSON.stringify(heavyData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  try {
    // Parse categories
    const categories = String(dragDropCategories)
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((cat: string) => cat.trim())
      .filter((cat: string) => cat.length > 0);

    if (categories.length === 0) {
      throw new Error("No valid categories found");
    }

    // Parse items
    type DragDropItem = {
      id: string;
      text: string;
      correctCategory: string;
    };

    const dragDropItemsArray: DragDropItem[] = String(dragDropItems)
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .map((line: string, idx: number) => {
        const parts = line.includes("→") ? line.split("→") : line.split("->");
        if (parts.length !== 2) {
          throw new Error(`Invalid format in line: ${line}`);
        }

        const [text, category] = parts.map((s: string) => s.trim());
        if (!text || !category) {
          throw new Error(`Empty text or category in line: ${line}`);
        }

        return {
          id: `item-${idx}`,
          text,
          correctCategory: category.split("(")[0].trim(),
        };
      });

    if (dragDropItemsArray.length === 0) {
      throw new Error("No valid items found");
    }

    // Validate that each item's category exists
    const invalidItems = dragDropItemsArray.filter(
      (dragItem) => !categories.includes(dragItem.correctCategory)
    );

    if (invalidItems.length > 0) {
      throw new Error(
        `Some items reference non-existent categories: ${invalidItems
          .map((dragItem) => dragItem.text)
          .join(", ")}`
      );
    }

    // Return the drag-drop component with parsed data
    return (
      <div className="mb-4">
        <DragDropInteractive
          data={{
            title: heavyData.drag_drop_title ?? "",
            instructions: heavyData.drag_drop_instructions ?? "",
            categories,
            items: dragDropItemsArray,
          }}
          completedFromParent={dragDropCompleted}
          onComplete={(isCorrect: boolean) => {
            if (onDragDropComplete) {
              onDragDropComplete(isCorrect);
            }
          }}
          onReadyStateChange={onReadyStateChange}
        />
      </div>
    );
  } catch (error) {
    console.error("Error parsing drag-drop data:", error);
    return (
      <div className="mb-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">
            Error loading drag and drop activity
          </p>
          <p className="text-red-500 text-sm mt-2">
            {error instanceof Error ? error.message : "Invalid data format"}
          </p>
          <button
            onClick={triggerLoad}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
