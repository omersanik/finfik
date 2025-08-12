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
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [message, setMessage] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const coursesResponse = await fetch('/api/courses');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Fetch sections
      const sectionsResponse = await fetch('/api/admin/sections?all=true');
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);
      }

      // Fetch content blocks
      const blocksResponse = await fetch('/api/admin/blocks');
      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        setContentBlocks(blocksData);
      }

      // Fetch content items
      const itemsResponse = await fetch('/api/admin/content-items');
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setContentItems(itemsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data');
    } finally {
      setLoading(false);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="blocks">Content Blocks</TabsTrigger>
          <TabsTrigger value="items">Content Items</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.name}</span>
                    <div className="flex gap-2">
                      {editingId === course.id ? (
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
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEditing(course, 'course')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteItem(course.id, 'course')}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingId === course.id ? (
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
                      <p><strong>Description:</strong> {course.description}</p>
                      <p><strong>Slug:</strong> {course.slug}</p>
                      <p><strong>Premium:</strong> {course.is_premium ? 'Yes' : 'No'}</p>
                      <p><strong>Created:</strong> {new Date(course.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{section.title}</span>
                    <div className="flex gap-2">
                      {editingId === section.id ? (
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
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEditing(section, 'section')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteItem(section.id, 'section')}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingId === section.id ? (
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
                      <p><strong>Description:</strong> {section.description}</p>
                      <p><strong>Slug:</strong> {section.slug}</p>
                      <p><strong>Lessons:</strong> {section.lessons}</p>
                      <p><strong>Order:</strong> {section.order}</p>
                      <p><strong>Course Path:</strong> {section.course_path}</p>
                      <p><strong>Created:</strong> {new Date(section.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Blocks Tab */}
        <TabsContent value="blocks" className="space-y-4">
          <div className="grid gap-4">
            {contentBlocks.map((block) => (
              <Card key={block.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{block.title}</span>
                    <div className="flex gap-2">
                      {editingId === block.id ? (
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
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEditing(block, 'block')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteItem(block.id, 'block')}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingId === block.id ? (
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
                      <p><strong>Description:</strong> {block.description}</p>
                      <p><strong>Order Index:</strong> {block.order_index}</p>
                      <p><strong>Section ID:</strong> {block.section_id}</p>
                      <p><strong>Created:</strong> {new Date(block.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Content Items Tab */}
        <TabsContent value="items" className="space-y-4">
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
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEditing(item, 'item')}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id, 'item')}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
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
                        <Label>Block ID</Label>
                        <Input
                          value={editForm.block_id || ''}
                          onChange={(e) => handleInputChange('block_id', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Section ID</Label>
                        <Input
                          value={editForm.section_id || ''}
                          onChange={(e) => handleInputChange('section_id', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Course ID</Label>
                        <Input
                          value={editForm.course_id || ''}
                          onChange={(e) => handleInputChange('course_id', e.target.value)}
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
                      <p><strong>Block ID:</strong> {item.block_id}</p>
                      <p><strong>Section ID:</strong> {item.section_id}</p>
                      <p><strong>Course ID:</strong> {item.course_id}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
