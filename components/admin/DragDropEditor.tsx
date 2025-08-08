"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowRight } from 'lucide-react';

interface DragDropData {
  title: string;
  instructions: string;
  items: Array<{
    text: string;
    correctCategory: string;
  }>;
  categories: string[];
}

interface DragDropEditorProps {
  value: DragDropData;
  onChange: (data: DragDropData) => void;
}

export default function DragDropEditor({ value, onChange }: DragDropEditorProps) {
  const [data, setData] = useState<DragDropData>(value);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    setData(value);
  }, [value]);

  const updateData = (newData: DragDropData) => {
    setData(newData);
    onChange(newData);
  };

  const addCategory = () => {
    if (newCategory.trim() && !data.categories.includes(newCategory.trim())) {
      const updatedData = {
        ...data,
        categories: [...data.categories, newCategory.trim()]
      };
      updateData(updatedData);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    const updatedData = {
      ...data,
      categories: data.categories.filter(c => c !== category),
      items: data.items.filter(item => item.correctCategory !== category)
    };
    updateData(updatedData);
  };

  const addItem = () => {
    if (newItem.trim() && selectedCategory && !data.items.some(item => item.text === newItem.trim())) {
      const updatedData = {
        ...data,
        items: [...data.items, {
          text: newItem.trim(),
          correctCategory: selectedCategory
        }]
      };
      updateData(updatedData);
      setNewItem('');
      setSelectedCategory(''); // Reset category selection after adding item
    }
  };

  const removeItem = (itemText: string) => {
    const updatedData = {
      ...data,
      items: data.items.filter(item => item.text !== itemText)
    };
    updateData(updatedData);
  };

  const updateTitle = (title: string) => {
    updateData({ ...data, title });
  };

  const updateInstructions = (instructions: string) => {
    updateData({ ...data, instructions });
  };

  return (
    <div className="space-y-6">
      {/* Title and Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Enter title..."
          />
        </div>
        <div>
          <Label htmlFor="instructions">Instructions (Optional)</Label>
          <Input
            id="instructions"
            value={data.instructions}
            onChange={(e) => updateInstructions(e.target.value)}
            placeholder="Enter instructions..."
          />
        </div>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Categories</span>
            <Badge variant="secondary">{data.categories.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <Button onClick={addCategory} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <Badge key={category} variant="outline" className="flex items-center gap-1">
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Items</span>
            <Badge variant="secondary">{data.items.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add new item..."
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {data.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <Button 
              onClick={addItem} 
              size="sm" 
              disabled={!newItem.trim() || !selectedCategory || data.categories.length === 0}
              title={data.categories.length === 0 ? "Add categories first" : ""}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {data.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.text}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <Badge variant="outline">{item.correctCategory}</Badge>
                </div>
                <button
                  onClick={() => removeItem(item.text)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {data.items.length > 0 && data.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p><strong>Categories:</strong> {data.categories.join(', ')}</p>
              <p><strong>Items:</strong> {data.items.length} items to categorize</p>
              {data.title && <p><strong>Title:</strong> {data.title}</p>}
              {data.instructions && <p><strong>Instructions:</strong> {data.instructions}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 