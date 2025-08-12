"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Save, X, Trash2, Plus, Eye } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  slug: string;
  thumbnail_url?: string;
  is_premium: boolean;
  created_at: string;
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
  description: string;
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
  created_at: string;
}

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

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch sections when course changes
  useEffect(() => {
    if (selectedCourse) {
      fetchSections(selectedCourse.id);
      setSelectedSection(null);
      setSelectedBlock(null);
      setContentBlocks([]);
      setContentItems([]);
    }
  }, [selectedCourse]);

  // Fetch content blocks when section changes
  useEffect(() => {
    if (selectedSection) {
      fetchContentBlocks(selectedSection.id);
      setSelectedBlock(null);
      setContentItems([]);
    }
  }, [selectedSection]);

  // Fetch content items when block changes
  useEffect(() => {
    if (selectedBlock) {
      fetchContentItems(selectedBlock.id);
    }
  }, [selectedBlock]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/sections?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error fetching sections');
    }
  };

  const fetchContentBlocks = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/admin/blocks?sectionId=${sectionId}`);
      if (response.ok) {
        const data = await response.json();
        setContentBlocks(data);
      }
    } catch (error) {
      console.error('Error fetching content blocks:', error);
      setMessage('Error fetching content blocks');
    }
  };

  const fetchContentItems = async (blockId: string) => {
    try {
      const response = await fetch(`/api/admin/content-items?blockId=${blockId}`);
      if (response.ok) {
        const data = await response.json();
        setContentItems(data);
      }
    } catch (error) {
      console.error('Error fetching content items:', error);
      setMessage('Error fetching content items');
    }
  };

  const startEditing = (item: any, type: string) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
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

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setMessage(`${type} updated successfully!`);
        setEditingId(null);
        setEditForm({});
        fetchAllData(); // Refresh data
      } else {
        const errorData = await response.json();
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
        fetchAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Error deleting item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Content Editor</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Hierarchical Navigation */}
      <div className="mb-6 space-y-4">
        {/* Course Selection */}
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-3">1. Select Course</h2>
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
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section Selection */}
        {selectedCourse && (
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">2. Select Section</h2>
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
                    {section.title} (Order: {section.order})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content Block Selection */}
        {selectedSection && (
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-semibold mb-3">3. Select Content Block</h2>
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
                    {block.title} (Order: {block.order_index})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content Display and Editing */}
      {selectedCourse && (
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course: {selectedCourse.name}</span>
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
                    <Label>Name</Label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
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
                  <div>
                    <Label>Premium Course</Label>
                    <Select
                      value={editForm.is_premium?.toString() || 'false'}
                      onValueChange={(value) => handleInputChange('is_premium', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Description:</strong> {selectedCourse.description}</p>
                  <p><strong>Slug:</strong> {selectedCourse.slug}</p>
                  <p><strong>Premium:</strong> {selectedCourse.is_premium ? 'Yes' : 'No'}</p>
                  <p><strong>Created:</strong> {new Date(selectedCourse.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

                  {/* Section Info */}
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
                      />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input
                        value={editForm.slug || ''}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                      />
                    </div>
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
                    <div>
                      <Label>Course Path</Label>
                      <Input
                        value={editForm.course_path || ''}
                        onChange={(e) => handleInputChange('course_path', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Description:</strong> {selectedSection.description}</p>
                    <p><strong>Slug:</strong> {selectedSection.slug}</p>
                    <p><strong>Lessons:</strong> {selectedSection.lessons}</p>
                    <p><strong>Order:</strong> {selectedSection.order}</p>
                    <p><strong>Course Path:</strong> {selectedSection.course_path}</p>
                    <p><strong>Created:</strong> {new Date(selectedSection.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Block Info */}
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
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
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
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Description:</strong> {selectedBlock.description}</p>
                    <p><strong>Order Index:</strong> {selectedBlock.order_index}</p>
                    <p><strong>Section ID:</strong> {selectedBlock.section_id}</p>
                    <p><strong>Created:</strong> {new Date(selectedBlock.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

                  {/* Content Items */}
          {selectedBlock && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Items in this Block</h3>
              <div className="grid gap-4">
                {contentItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{item.type} - {item.order_index}</span>
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
                            <Button size="sm" variant="outline" onClick={() => startEditing(item, 'item')}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Item
                            </Button>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {editingId === item.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={editForm.type || ''}
                              onValueChange={(value) => handleInputChange('type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="chart">Chart</SelectItem>
                                <SelectItem value="animation">Animation</SelectItem>
                                <SelectItem value="calculator">Calculator</SelectItem>
                                <SelectItem value="math">Math Formula</SelectItem>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="drag-drop">Drag & Drop</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Content Text</Label>
                            <Textarea
                              value={editForm.content_text || ''}
                              onChange={(e) => handleInputChange('content_text', e.target.value)}
                              rows={4}
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
                            <Label>Image URL</Label>
                            <Input
                              value={editForm.image_url || ''}
                              onChange={(e) => handleInputChange('image_url', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Quiz Data</Label>
                            <Textarea
                              value={editForm.quiz_data || ''}
                              onChange={(e) => handleInputChange('quiz_data', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Quiz Question</Label>
                            <Input
                              value={editForm.quiz_question || ''}
                              onChange={(e) => handleInputChange('quiz_question', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Math Formula</Label>
                            <Input
                              value={editForm.math_formula || ''}
                              onChange={(e) => handleInputChange('math_formula', e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p><strong>Type:</strong> {item.type}</p>
                          <p><strong>Order Index:</strong> {item.order_index}</p>
                          {item.content_text && (
                            <div>
                              <strong>Content Preview:</strong>
                              <div className="mt-2 p-2 bg-gray-100 rounded text-sm max-h-20 overflow-y-auto">
                                {item.content_text.substring(0, 200)}...
                              </div>
                            </div>
                          )}
                          <p><strong>Created:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
