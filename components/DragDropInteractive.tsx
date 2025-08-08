"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, Sparkles, Target, Trophy, ArrowRight } from 'lucide-react';

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
  const [showSuccess, setShowSuccess] = useState(false);

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
    e.currentTarget.classList.add('scale-105', 'shadow-lg');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('scale-105', 'shadow-lg');
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
      setShowSuccess(true);
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
    setShowSuccess(false);
  };

  const getItemsInCategory = (category: string) => {
    return items.filter(item => item.currentCategory === category);
  };

  const getUnassignedItems = () => {
    return items.filter(item => !item.currentCategory);
  };

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">Excellent Work!</h3>
            <p className="text-green-700 mb-6">You've successfully completed the drag and drop activity!</p>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        {data.title && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {data.title}
            </h3>
          </div>
        )}
        {data.instructions && (
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">{data.instructions}</p>
        )}
      </div>

      {/* Available Items - Top */}
      <Card className="mb-6 border-2 border-dashed border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            Available Items
            <Badge variant="secondary" className="ml-auto">
              {getUnassignedItems().length} remaining
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="min-h-[80px] flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30"
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
                className={`px-3 py-1.5 rounded-md cursor-move transition-all duration-300 ease-in-out text-xs font-medium shadow-sm hover:shadow-md transform hover:scale-105 ${
                  shakingItems.has(item.id)
                    ? 'animate-shake bg-destructive/10 border border-destructive text-destructive'
                    : 'bg-background border border-border text-foreground hover:border-primary hover:bg-accent'
                }`}
              >
                <span>{item.text}</span>
              </div>
            ))}
            {getUnassignedItems().length === 0 && (
              <div className="w-full text-center text-muted-foreground py-4">
                <ArrowRight className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs">All items have been placed!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories - Bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {categories.map((category, index) => (
          <Card 
            key={category}
            className={`border-2 transition-all duration-300 ${
              getItemsInCategory(category).length > 0 
                ? 'border-primary/20 bg-primary/5' 
                : 'border-dashed border-muted bg-muted/30'
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  getItemsInCategory(category).length > 0 ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
                {category}
                {getItemsInCategory(category).length > 0 && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {getItemsInCategory(category).length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`min-h-[60px] p-2 rounded-md transition-all duration-300 ${
                  getItemsInCategory(category).length > 0 
                    ? 'bg-background' 
                    : 'bg-muted/20 border-2 border-dashed border-muted'
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
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 cursor-move shadow-sm ${
                        shakingItems.has(item.id)
                          ? 'animate-shake bg-destructive/10 border border-destructive text-destructive'
                          : isChecking
                          ? item.isCorrect
                            ? 'bg-green-100 border border-green-300 text-green-800'
                            : 'bg-destructive/10 border border-destructive text-destructive'
                          : 'bg-accent border border-border text-foreground hover:bg-accent/80'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{item.text}</span>
                        {isChecking && (
                          item.isCorrect ? (
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="px-4"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={checkAnswers}
          disabled={!allItemsDropped || isChecking}
          size="sm"
          className="px-6"
        >
          {isChecking ? 'Checking...' : 'Check Answers'}
        </Button>
      </div>
    </div>
  );
} 