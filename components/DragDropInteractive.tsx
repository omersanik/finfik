"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

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
}

export default function DragDropInteractive({ data, onComplete, completedFromParent = false }: DragDropInteractiveProps) {
  const [items, setItems] = useState<DragItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [allItemsDropped, setAllItemsDropped] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [shakingItems, setShakingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize items and categories only if not already initialized and not completed
    if (items.length === 0 && !completedFromParent) {
      setItems(data.items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        currentCategory: undefined,
        isCorrect: undefined
      })));
      setCategories(data.categories);
    }
  }, [data, completedFromParent]);

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragFromDropZone = (e: React.DragEvent, item: DragItem) => {
    // When dragging an item from a drop zone back to available items
    const updatedItems = items.map(i => 
      i.id === item.id 
        ? { ...i, currentCategory: undefined }
        : i
    );
    
    setItems(updatedItems);
    
    // Check if all items are still dropped
    const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
    setAllItemsDropped(allDropped);
    
    // Only notify parent if items were removed (not when just starting to drag)
    // We don't call onComplete here to avoid resetting the state
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    if (draggedItem) {
      const updatedItems = items.map(item => 
        item.id === draggedItem.id 
          ? { ...item, currentCategory: category }
          : item
      );
      
      setItems(updatedItems);
      setDraggedItem(null);
      
      // Check if all items are now dropped
      const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
      setAllItemsDropped(allDropped);
      
      // Notify parent when all items are dropped
      if (allDropped && onComplete) {
        onComplete(false); // false means not completed correctly yet, but ready to check
      }
    }
  };

  const checkAnswers = () => {
    setIsChecking(true);
    
    const updatedItems = items.map(item => ({
      ...item,
      isCorrect: item.currentCategory === item.correctCategory
    }));
    
    setItems(updatedItems);
    
    const allItemsCorrect = updatedItems.every(item => item.isCorrect);
    setAllCorrect(allItemsCorrect);
    setIsCompleted(true);
    
         // If not all correct, shake incorrect items and move them back to initial position
     if (!allItemsCorrect) {
       const incorrectItems = updatedItems.filter(item => !item.isCorrect);
       
       // Add shaking animation to incorrect items
       setShakingItems(new Set(incorrectItems.map(item => item.id)));
       
       // After shake animation, move incorrect items back to initial position
       setTimeout(() => {
         setShakingItems(new Set());
         setIsChecking(false);
         setIsCompleted(false);
         setAllCorrect(false);
         
         // Move incorrect items back to their initial position
         const resetItems = items.map(item => ({
           ...item,
           currentCategory: item.isCorrect ? item.currentCategory : undefined,
           isCorrect: undefined
         }));
         
         setItems(resetItems);
         
         // Don't call onComplete(false) - keep the button enabled so user can try again
       }, 1000); // Wait for shake animation to complete
     } else {
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(allItemsCorrect);
      }
    }
    
    return allItemsCorrect;
  };

  // Expose checkAnswers function to parent
  useEffect(() => {
    if (window) {
      (window as any).checkDragDropAnswers = checkAnswers;
      (window as any).checkDragDropAllDropped = () => {
        return items.every(item => item.currentCategory !== undefined);
      };
    }
  }, [items]);

  const handleReset = () => {
    setItems(data.items.map((item, index) => ({
      ...item,
      id: `item-${index}`,
      currentCategory: undefined,
      isCorrect: undefined
    })));
    setIsChecking(false);
    setIsCompleted(false);
    setAllCorrect(false);
  };

  const getItemsInCategory = (category: string) => {
    return items.filter(item => item.currentCategory === category);
  };

  const getUnassignedItems = () => {
    return items.filter(item => !item.currentCategory);
  };

                       return (
       <div className="max-w-6xl mx-auto p-6">
        {data.title && (
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{data.title}</h3>
            {data.instructions && <p className="text-gray-600">{data.instructions}</p>}
          </div>
        )}

                 {/* Main Layout - Everything Centered */}
         <div className="flex flex-col items-center gap-6">
                       {/* Draggable Items - Centered */}
            <div 
              className="flex flex-wrap gap-2 justify-center min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg p-3"
              onDragOver={handleDragOver}
                                                           onDrop={(e) => {
                  e.preventDefault();
                  if (draggedItem && draggedItem.currentCategory) {
                    // Item is being dragged back to available items
                    const updatedItems = items.map(item => 
                      item.id === draggedItem.id 
                        ? { ...item, currentCategory: undefined }
                        : item
                    );
                    
                    setItems(updatedItems);
                    setDraggedItem(null);
                    
                    // Check if all items are still dropped
                    const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
                    setAllItemsDropped(allDropped);
                    
                    // Don't call onComplete here - let the parent handle the state
                    // This prevents items from going back to their original places
                  }
                }}
            >
              {getUnassignedItems().map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                                     className={`px-3 py-2 border-2 rounded-lg cursor-move transition-all duration-500 ease-in-out text-sm font-medium ${
                     shakingItems.has(item.id)
                       ? 'animate-shake bg-red-100 border-red-300 text-red-800'
                       : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                   }`}
                >
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

           {/* Drop Zones - Centered */}
           <div className="grid grid-cols-1 gap-3 w-full max-w-md">
             {categories.map((category) => (
               <div
                 key={category}
                 className="min-h-[50px] border-2 border-dashed border-gray-300 rounded-lg p-3 text-center"
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, category)}
               >
                 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">{category}</div>
                 <div className="flex flex-wrap gap-1 justify-center">
                                       {getItemsInCategory(category).map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragFromDropZone(e, item)}
                                                 className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-500 ease-in-out cursor-move ${
                           shakingItems.has(item.id)
                             ? 'animate-shake bg-red-100 border-red-300 text-red-800'
                             : isChecking
                             ? item.isCorrect
                               ? 'bg-green-100 border-green-300 text-green-800'
                               : 'bg-red-100 border-red-300 text-red-800'
                             : 'bg-blue-100 border-blue-300 text-blue-800'
                         }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.text}</span>
                          {isChecking && (
                            item.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-1 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 ml-1 flex-shrink-0" />
                            )
                          )}
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ))}
           </div>
         </div>
     </div>
   );
} 