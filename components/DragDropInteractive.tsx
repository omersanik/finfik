"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Sparkles, Target } from 'lucide-react';

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
    e.currentTarget.classList.add('scale-105');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('scale-105');
  };

  const handleDragFromDropZone = (e: React.DragEvent, item: DragItem) => {
    const updatedItems = items.map(i => 
      i.id === item.id 
        ? { ...i, currentCategory: undefined }
        : i
    );
    
    setItems(updatedItems);
    
    const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
    setAllItemsDropped(allDropped);
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
      
      const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
      setAllItemsDropped(allDropped);
      
      if (allDropped && onComplete) {
        onComplete(false);
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
    
    if (!allItemsCorrect) {
      const incorrectItems = updatedItems.filter(item => !item.isCorrect);
      setShakingItems(new Set(incorrectItems.map(item => item.id)));
      
      setTimeout(() => {
        setShakingItems(new Set());
        setIsChecking(false);
        setIsCompleted(false);
        setAllCorrect(false);
        
        const resetItems = items.map(item => ({
          ...item,
          currentCategory: item.isCorrect ? item.currentCategory : undefined,
          isCorrect: undefined
        }));
        
        setItems(resetItems);
      }, 1500);
    } else {
      if (onComplete) {
        onComplete(allItemsCorrect);
      }
    }
    
    return allItemsCorrect;
  };

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
    <div className="max-w-3xl mx-auto p-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        {data.title && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {data.title}
            </h3>
          </div>
        )}
        {data.instructions && (
          <p className="text-muted-foreground text-sm">{data.instructions}</p>
        )}
      </div>

      {/* Available Items - Top */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-sm font-medium text-foreground">Available Items</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {getUnassignedItems().length} remaining
          </Badge>
        </div>
        <div 
          className="min-h-[60px] flex flex-wrap gap-1.5 p-2"
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedItem && draggedItem.currentCategory) {
              const updatedItems = items.map(item => 
                item.id === draggedItem.id 
                  ? { ...item, currentCategory: undefined }
                  : item
              );
              setItems(updatedItems);
              setDraggedItem(null);
              const allDropped = updatedItems.every(item => item.currentCategory !== undefined);
              setAllItemsDropped(allDropped);
            }
          }}
        >
          {getUnassignedItems().map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
                             className={`px-2 py-1 rounded cursor-move transition-all duration-300 text-xs font-medium inline-block whitespace-nowrap ${
                 shakingItems.has(item.id)
                   ? 'animate-shake bg-destructive/10 text-destructive'
                   : 'bg-white text-foreground border border-slate-200 hover:border-slate-300'
               }`}
             >
               {item.text}
               <span className="w-3 h-3 inline-block ml-1"></span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories - Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {categories.map((category, index) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                getItemsInCategory(category).length > 0 ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              <span className="text-sm font-medium text-foreground">{category}</span>
              {getItemsInCategory(category).length > 0 && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {getItemsInCategory(category).length}
                </Badge>
              )}
            </div>
            <div
              className={`min-h-[80px] p-3 rounded-lg transition-all duration-300 ${
                getItemsInCategory(category).length > 0 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category)}
            >
              <div className="flex flex-wrap gap-1.5">
                {getItemsInCategory(category).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragFromDropZone(e, item)}
                    onDragEnd={handleDragEnd}
                                         className={`px-2 py-1 rounded cursor-move transition-all duration-300 text-xs font-medium inline-block whitespace-nowrap ${
                       shakingItems.has(item.id)
                         ? 'animate-shake bg-destructive/10 text-destructive'
                         : isChecking
                         ? item.isCorrect
                           ? 'bg-green-100 text-green-800'
                           : 'bg-destructive/10 text-destructive'
                         : 'bg-white text-foreground border border-slate-200 hover:border-slate-300'
                     }`}
                   >
                     {item.text}
                     {isChecking ? (
                       item.isCorrect ? (
                         <CheckCircle className="h-3 w-3 text-green-600 inline ml-1" />
                       ) : (
                         <XCircle className="h-3 w-3 text-destructive inline ml-1" />
                       )
                     ) : (
                       <span className="w-3 h-3 inline-block ml-1"></span>
                     )}
                   </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button Only */}
      <div className="flex justify-center">
        <Button 
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="px-3"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
} 