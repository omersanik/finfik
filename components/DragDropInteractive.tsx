"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  const [progress, setProgress] = useState(0);

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

  // Update progress based on items placed
  useEffect(() => {
    const placedItems = items.filter(item => item.currentCategory !== undefined).length;
    const totalItems = items.length;
    setProgress(totalItems > 0 ? (placedItems / totalItems) * 100 : 0);
  }, [items]);

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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        {data.title && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {data.title}
            </h3>
          </div>
        )}
        {data.instructions && (
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{data.instructions}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left Side - Available Items */}
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Sparkles className="w-5 h-5" />
              Available Items
              <Badge variant="secondary" className="ml-auto">
                {getUnassignedItems().length} remaining
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-[200px] flex flex-wrap gap-3 p-4 rounded-lg bg-white/50"
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
                  className={`px-4 py-3 rounded-xl cursor-move transition-all duration-300 ease-in-out text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 ${
                    shakingItems.has(item.id)
                      ? 'animate-shake bg-red-100 border-2 border-red-300 text-red-800'
                      : 'bg-white border-2 border-blue-200 text-blue-800 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span>{item.text}</span>
                </div>
              ))}
              {getUnassignedItems().length === 0 && (
                <div className="w-full text-center text-gray-500 py-8">
                  <ArrowRight className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>All items have been placed!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Drop Zones */}
        <div className="space-y-4">
          {categories.map((category, index) => (
            <Card 
              key={category}
              className={`border-2 transition-all duration-300 ${
                getItemsInCategory(category).length > 0 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-dashed border-gray-200 bg-gray-50'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${
                    getItemsInCategory(category).length > 0 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  {category}
                  {getItemsInCategory(category).length > 0 && (
                    <Badge variant="outline" className="ml-auto text-green-700 border-green-300">
                      {getItemsInCategory(category).length} item{getItemsInCategory(category).length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`min-h-[80px] p-3 rounded-lg transition-all duration-300 ${
                    getItemsInCategory(category).length > 0 
                      ? 'bg-white' 
                      : 'bg-white/50 border-2 border-dashed border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category)}
                >
                  <div className="flex flex-wrap gap-2">
                    {getItemsInCategory(category).map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragFromDropZone(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-move shadow-sm ${
                          shakingItems.has(item.id)
                            ? 'animate-shake bg-red-100 border-2 border-red-300 text-red-800'
                            : isChecking
                            ? item.isCorrect
                              ? 'bg-green-100 border-2 border-green-300 text-green-800'
                              : 'bg-red-100 border-2 border-red-300 text-red-800'
                            : 'bg-blue-100 border-2 border-blue-300 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{item.text}</span>
                          {isChecking && (
                            item.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button 
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="px-6"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={checkAnswers}
          disabled={!allItemsDropped || isChecking}
          size="lg"
          className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isChecking ? 'Checking...' : 'Check Answers'}
        </Button>
      </div>
    </div>
  );
} 