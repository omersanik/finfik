"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Trash2, Plus, Eye, EyeOff, FileText, Image, Brain, Calculator, Table, Move, Type } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail_url?: string;
  is_premium: boolean;
  created_at: string;
  course_level?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  slug: string;
  lessons: number;
  order: number;
  course_path: string;
  created_at: string;
}

interface ContentBlock {
  id: string;
  title: string;
  order_index: number;
  section_id: string;
  created_at: string;
}

interface ContentItem {
  id: string;
  type: string;
  content_text: string;
  order_index: number;
  block_id: string;
  section_id: string;
  course_id: string;
  image_url?: string;
  quiz_data?: string;
  quiz_question?: string;
  math_formula?: string;
  drag_drop_title?: string;
  drag_drop_instructions?: string;
  drag_drop_items?: string;
  drag_drop_categories?: string;
  component_key?: string;
  content_type?: string;
  styling_data?: string;
  interactive_data?: string;
  media_files?: string;
  font_settings?: string;
  layout_config?: string;
  animation_settings?: string;
  created_at: string;
}

const CONTENT_TYPES = [
  { value: 'text', label: 'Text Content', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'quiz', label: 'Quiz', icon: Brain },
  { value: 'chart', label: 'Chart', icon: Calculator },
  { value: 'animation', label: 'Animation', icon: Eye },
  { value: 'calculator', label: 'Calculator', icon: Calculator },
  { value: 'math', label: 'Math Formula', icon: Type },
  { value: 'table', label: 'Table', icon: Table },
  { value: 'drag-drop', label: 'Drag & Drop', icon: Move },
];

export default function AdminEditPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setMessage('Error fetching courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error fetching courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSections = useCallback(async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/sections?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      } else {
        setMessage('Error fetching sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error fetching sections');
    }
  }, []);

  const fetchContentBlocks = useCallback(async (sectionId: string) => {
    try {
      const response = await fetch(`/api/admin/content-blocks?section_id=${sectionId}`);
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data);
      } else {
        setMessage('Error fetching content blocks');
      }
    } catch (error) {
      console.error('Error fetching content blocks:', error);
      setMessage('Error fetching content blocks');
    }
  }, []);

  const fetchContentItems = useCallback(async (blockId: string) => {
    try {
      const response = await fetch(`/api/admin/content-items?blockId=${blockId}`);
      if (response.ok) {
        const data = await response.json();
        setContentItems(data);
      } else {
        setMessage('Error fetching content items');
      }
    } catch (error) {
      console.error('Error fetching content items:', error);
      setMessage('Error fetching content items');
    }
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch sections when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchSections(selectedCourse.id);
      setSelectedSection(null);
      setSelectedBlock(null);
      setContentBlocks([]);
      setContentItems([]);
    }
  }, [selectedCourse, fetchSections]);

  // Fetch content blocks when section changes
  useEffect(() => {
    if (selectedSection) {
      fetchContentBlocks(selectedSection.id);
      setSelectedBlock(null);
      setContentItems([]);
    }
  }, [selectedSection, fetchContentBlocks]);

  // Fetch content items when block changes
  useEffect(() => {
    if (selectedBlock) {
      fetchContentItems(selectedBlock.id);
    }
  }, [selectedBlock, fetchContentItems]);

  const startEditing = (item: any, type: string) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async (type: string) => {
    try {
      let endpoint = '';
      let method = 'PUT';

      switch (type) {
        case 'course':
          endpoint = `/api/admin/courses/${editingId}`;
          break;
        case 'section':
          endpoint = `/api/admin/sections/${editingId}`;
          break;
        case 'block':
          endpoint = `/api/admin/blocks/${editingId}`;
          break;
        case 'item':
          endpoint = `/api/admin/content-items/${editingId}`;
          break;
        default:
          throw new Error('Invalid type');
      }

      console.log(`Saving ${type} changes:`, { endpoint, editForm, editingId });

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log(`Success response:`, responseData);
        setMessage(`${type} updated successfully!`);
        setEditingId(null);
        setEditForm({});
        // Refresh data based on what was updated
        if (type === 'course') {
          fetchCourses();
        } else if (type === 'section' && selectedCourse) {
          fetchSections(selectedCourse.id);
        } else if (type === 'block' && selectedSection) {
          fetchContentBlocks(selectedSection.id);
        } else if (type === 'item' && selectedBlock) {
          fetchContentItems(selectedBlock.id);
        }
      } else {
        const errorData = await response.json();
        console.error(`Error response:`, errorData);
        setMessage(`Error: ${errorData.error || 'Failed to update'}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage('Error saving changes');
    }
  };

  const deleteItem = async (id: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      let endpoint = '';
      switch (type) {
        case 'course':
          endpoint = `/api/admin/delete-course`;
          break;
        case 'section':
          endpoint = `/api/admin/delete-section`;
          break;
        case 'block':
          endpoint = `/api/admin/delete-content-block`;
          break;
        case 'item':
          endpoint = `/api/admin/delete-content-item`;
          break;
        default:
          throw new Error('Invalid type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setMessage(`${type} deleted successfully!`);
        // Refresh data based on what was deleted
        if (type === 'course') {
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedBlock(null);
          fetchCourses();
        } else if (type === 'section') {
          setSelectedSection(null);
          setSelectedBlock(null);
          if (selectedCourse) {
            fetchSections(selectedCourse.id);
          }
        } else if (type === 'block') {
          setSelectedBlock(null);
          if (selectedSection) {
            fetchContentBlocks(selectedSection.id);
          }
        } else if (type === 'item') {
          if (selectedBlock) {
            fetchContentItems(selectedBlock.id);
          }
        }
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Error deleting item');
    }
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = CONTENT_TYPES.find(t => t.value === type);
    return contentType ? contentType.icon : FileText;
  };

  const getContentTypeLabel = (type: string) => {
    const contentType = CONTENT_TYPES.find(t => t.value === type);
    return contentType ? contentType.label : type;
  };

  const renderContentItemForm = (item: ContentItem) => {
    const isEditing = editingId === item.id;
    const form = isEditing ? editForm : item;

    return (
      <div className="space-y-4">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Content Type</Label>
            <Select
              value={form.type || ''}
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Order Index</Label>
            <Input
              type="number"
              value={form.order_index || 0}
              onChange={(e) => handleInputChange('order_index', parseInt(e.target.value))}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Content Text */}
        <div>
          <Label>Content Text</Label>
          <Textarea
            value={form.content_text || ''}
            onChange={(e) => handleInputChange('content_text', e.target.value)}
            rows={6}
            disabled={!isEditing}
            placeholder="Enter your content here..."
          />
        </div>

        {/* Type-specific fields */}
        {form.type === 'image' && (
          <div>
            <Label>Image URL</Label>
            <Input
              value={form.image_url || ''}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              disabled={!isEditing}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {form.type === 'quiz' && (
          <div className="space-y-4">
            <div>
              <Label>Quiz Question</Label>
              <Input
                value={form.quiz_question || ''}
                onChange={(e) => handleInputChange('quiz_question', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Quiz Data (JSON)</Label>
              <Textarea
                value={form.quiz_data || ''}
                onChange={(e) => handleInputChange('quiz_data', e.target.value)}
                rows={4}
                disabled={!isEditing}
                placeholder='{"question": "...", "options": [...], "correct": 0}'
              />
            </div>
          </div>
        )}

        {form.type === 'math' && (
          <div>
            <Label>Math Formula</Label>
            <Input
              value={form.math_formula || ''}
              onChange={(e) => handleInputChange('math_formula', e.target.value)}
              disabled={!isEditing}
              placeholder="E = mc²"
            />
          </div>
        )}

        {form.type === 'drag-drop' && (
          <div className="space-y-4">
            <div>
              <Label>Drag & Drop Title</Label>
              <Input
                value={form.drag_drop_title || ''}
                onChange={(e) => handleInputChange('drag_drop_title', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea
                value={form.drag_drop_instructions || ''}
                onChange={(e) => handleInputChange('drag_drop_instructions', e.target.value)}
                rows={2}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Items (JSON)</Label>
              <Textarea
                value={form.drag_drop_items || ''}
                onChange={(e) => handleInputChange('drag_drop_items', e.target.value)}
                rows={3}
                disabled={!isEditing}
                placeholder='[{"id": 1, "text": "Item 1"}, ...]'
              />
            </div>
            <div>
              <Label>Categories (JSON)</Label>
              <Textarea
                value={form.drag_drop_categories || ''}
                onChange={(e) => handleInputChange('drag_drop_categories', e.target.value)}
                rows={3}
                disabled={!isEditing}
                placeholder='[{"id": 1, "name": "Category 1"}, ...]'
              />
            </div>
          </div>
        )}

        {/* Advanced Fields Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
            disabled={!isEditing}
          />
          <Label>Show Advanced Fields</Label>
        </div>

        {/* Advanced Fields */}
        {showAdvanced && isEditing && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold">Advanced Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Component Key</Label>
                <Input
                  value={form.component_key || ''}
                  onChange={(e) => handleInputChange('component_key', e.target.value)}
                />
              </div>
              <div>
                <Label>Content Type</Label>
                <Input
                  value={form.content_type || ''}
                  onChange={(e) => handleInputChange('content_type', e.target.value)}
                />
              </div>
              <div>
                <Label>Styling Data (JSON)</Label>
                <Textarea
                  value={form.styling_data || ''}
                  onChange={(e) => handleInputChange('styling_data', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Interactive Data (JSON)</Label>
                <Textarea
                  value={form.interactive_data || ''}
                  onChange={(e) => handleInputChange('interactive_data', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Media Files (JSON)</Label>
                <Textarea
                  value={form.media_files || ''}
                  onChange={(e) => handleInputChange('media_files', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Font Settings (JSON)</Label>
                <Textarea
                  value={form.font_settings || ''}
                  onChange={(e) => handleInputChange('font_settings', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Layout Config (JSON)</Label>
                <Textarea
                  value={form.layout_config || ''}
                  onChange={(e) => handleInputChange('layout_config', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Animation Settings (JSON)</Label>
                <Textarea
                  value={form.animation_settings || ''}
                  onChange={(e) => handleInputChange('animation_settings', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Content Editor</h1>
        <Badge variant="outline" className="text-sm">
          {contentItems.length} Content Items
        </Badge>
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Hierarchical Navigation */}
      <div className="mb-6 space-y-4">
        {/* Course Selection */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">1</span>
            Select Course
          </h2>
          <Select onValueChange={(courseId) => {
            const course = courses.find(c => c.id === courseId);
            setSelectedCourse(course || null);
          }} value={selectedCourse?.id || ''}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a course to edit..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{course.title}</span>
                    <Badge variant={course.is_premium ? "default" : "secondary"} className="ml-2">
                      {course.is_premium ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Selection */}
        {selectedCourse && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">2</span>
              Select Section
            </h2>
            <Select onValueChange={(sectionId) => {
              const section = sections.find(s => s.id === sectionId);
              setSelectedSection(section || null);
            }} value={selectedSection?.id || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a section to edit..." />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{section.title}</span>
                      <Badge variant="outline" className="ml-2">
                        Order: {section.order}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content Block Selection */}
        {selectedSection && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">3</span>
              Select Content Block
            </h2>
            <Select onValueChange={(blockId) => {
              const block = contentBlocks.find(b => b.id === blockId);
              setSelectedBlock(block || null);
            }} value={selectedBlock?.id || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a content block to edit..." />
              </SelectTrigger>
              <SelectContent>
                {contentBlocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{block.title}</span>
                      <Badge variant="outline" className="ml-2">
                        Order: {block.order_index}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content Display and Editing */}
      {selectedCourse && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="course">Course Details</TabsTrigger>
            <TabsTrigger value="section">Section Details</TabsTrigger>
            <TabsTrigger value="block">Content Block</TabsTrigger>
            <TabsTrigger value="content">Content Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 p-2 rounded">📚</span>
                    Course Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Title:</strong> {selectedCourse.title}</p>
                  <p><strong>Slug:</strong> {selectedCourse.slug}</p>
                  <p><strong>Premium:</strong> {selectedCourse.is_premium ? 'Yes' : 'No'}</p>
                  <p><strong>Level:</strong> {selectedCourse.course_level || 'Not set'}</p>
                  <p><strong>Created:</strong> {new Date(selectedCourse.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>

              {/* Section Info Card */}
              {selectedSection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 p-2 rounded">📖</span>
                      Section Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Title:</strong> {selectedSection.title}</p>
                    <p><strong>Slug:</strong> {selectedSection.slug}</p>
                    <p><strong>Order:</strong> {selectedSection.order}</p>
                    <p><strong>Lessons:</strong> {selectedSection.lessons}</p>
                    <p><strong>Created:</strong> {new Date(selectedSection.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              )}

              {/* Block Info Card */}
              {selectedBlock && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 p-2 rounded">📝</span>
                      Block Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Title:</strong> {selectedBlock.title}</p>
                    <p><strong>Order:</strong> {selectedBlock.order_index}</p>
                    <p><strong>Items:</strong> {contentItems.length}</p>
                    <p><strong>Created:</strong> {new Date(selectedBlock.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content Items Summary */}
            {selectedBlock && (
              <Card>
                <CardHeader>
                  <CardTitle>Content Items Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CONTENT_TYPES.map((type) => {
                      const count = contentItems.filter(item => item.type === type.value).length;
                      if (count === 0) return null;
                      const Icon = type.icon;
                      return (
                        <div key={type.value} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold">{count}</p>
                            <p className="text-sm text-gray-600">{type.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="course" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Course: {selectedCourse.title}</span>
                  <div className="flex gap-2">
                    {editingId === selectedCourse.id ? (
                      <>
                        <Button size="sm" onClick={() => saveChanges('course')}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEditing(selectedCourse, 'course')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingId === selectedCourse.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editForm.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Slug</Label>
                        <Input
                          value={editForm.slug || ''}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Thumbnail URL</Label>
                        <Input
                          value={editForm.thumbnail_url || ''}
                          onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Course Level</Label>
                        <Select
                          value={editForm.course_level || ''}
                          onValueChange={(value) => handleInputChange('course_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editForm.is_premium || false}
                          onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
                        />
                        <Label>Premium Course</Label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <p className="text-gray-700">{selectedCourse.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Slug</Label>
                        <p className="text-gray-700">{selectedCourse.slug}</p>
                      </div>
                      <div>
                        <Label>Thumbnail URL</Label>
                        <p className="text-gray-700">{selectedCourse.thumbnail_url || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Course Level</Label>
                        <p className="text-gray-700">{selectedCourse.course_level || 'Not set'}</p>
                      </div>
                      <div>
                        <Label>Premium</Label>
                        <p className="text-gray-700">{selectedCourse.is_premium ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="section" className="space-y-6">
            {selectedSection && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Section: {selectedSection.title}</span>
                    <div className="flex gap-2">
                      {editingId === selectedSection.id ? (
                        <>
                          <Button size="sm" onClick={() => saveChanges('section')}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(selectedSection, 'section')}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Section
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingId === selectedSection.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Slug</Label>
                          <Input
                            value={editForm.slug || ''}
                            onChange={(e) => handleInputChange('slug', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Course Path</Label>
                          <Input
                            value={editForm.course_path || ''}
                            onChange={(e) => handleInputChange('course_path', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Lessons</Label>
                          <Input
                            type="number"
                            value={editForm.lessons || 0}
                            onChange={(e) => handleInputChange('lessons', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={editForm.order || 0}
                            onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Description</Label>
                        <p className="text-gray-700">{selectedSection.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Slug</Label>
                          <p className="text-gray-700">{selectedSection.slug}</p>
                        </div>
                        <div>
                          <Label>Course Path</Label>
                          <p className="text-gray-700">{selectedSection.course_path}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Lessons</Label>
                          <p className="text-gray-700">{selectedSection.lessons}</p>
                        </div>
                        <div>
                          <Label>Order</Label>
                          <p className="text-gray-700">{selectedSection.order}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="block" className="space-y-6">
            {selectedBlock && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Content Block: {selectedBlock.title}</span>
                    <div className="flex gap-2">
                      {editingId === selectedBlock.id ? (
                        <>
                          <Button size="sm" onClick={() => saveChanges('block')}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(selectedBlock, 'block')}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Block
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingId === selectedBlock.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={editForm.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Order Index</Label>
                        <Input
                          type="number"
                          value={editForm.order_index || 0}
                          onChange={(e) => handleInputChange('order_index', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Section ID</Label>
                        <Input
                          value={editForm.section_id || ''}
                          onChange={(e) => handleInputChange('section_id', e.target.value)}
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">This field cannot be changed as it's linked to the section</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <p className="text-gray-700">{selectedBlock.title}</p>
                      </div>
                      <div>
                        <Label>Order Index</Label>
                        <p className="text-gray-700">{selectedBlock.order_index}</p>
                      </div>
                      <div>
                        <Label>Section ID</Label>
                        <p className="text-gray-700">{selectedBlock.section_id}</p>
                      </div>
                      <div>
                        <Label>Created</Label>
                        <p className="text-gray-700">{new Date(selectedBlock.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {selectedBlock && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Content Items in Block: {selectedBlock.title}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {contentItems.map((item) => {
                    const Icon = getContentTypeIcon(item.type);
                    return (
                      <Card key={item.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              <span>{getContentTypeLabel(item.type)}</span>
                              <Badge variant="outline">Order: {item.order_index}</Badge>
                            </div>
                            <div className="flex gap-2">
                              {editingId === item.id ? (
                                <>
                                  <Button size="sm" onClick={() => saveChanges('item')}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startEditing(item, 'item')}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => deleteItem(item.id, 'item')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {renderContentItemForm(item)}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
