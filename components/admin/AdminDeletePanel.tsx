"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ChevronRight, ArrowLeft, Search, Folder, FileText, Layers } from "lucide-react";

interface ContentItem {
  id: string;
  content_text?: string;
  type: string;
  created_at: string;
  block_id: string;
}

interface ContentBlock {
  id: string;
  title: string;
  section_id: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}

interface Section {
  id: string;
  title: string;
  order: number;
  created_at: string;
  content_blocks: ContentBlock[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  created_at: string;
  sections: Section[];
}

type ViewMode = 'courses' | 'sections' | 'blocks' | 'items';

const AdminDeletePanel = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);

  // Fetch all data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsForCourse = async (courseId: string) => {
    try {
      const sectionsRes = await fetch(`/api/admin/sections?courseId=${courseId}`);
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchBlocksForSection = async (sectionId: string) => {
    try {
      const blocksRes = await fetch(`/api/admin/content-blocks?sectionId=${sectionId}`);
      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        setContentBlocks(blocksData);
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const fetchItemsForBlock = async (blockId: string) => {
    try {
      const itemsRes = await fetch(`/api/admin/content-items?blockId=${blockId}`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setContentItems(itemsData);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      let endpoint = "";
      let body = { adminPassword };

      switch (type) {
        case "course":
          endpoint = "/api/admin/delete-course";
          body = { ...body, courseId: id };
          break;
        case "section":
          endpoint = "/api/admin/delete-section";
          body = { ...body, sectionId: id };
          break;
        case "contentBlock":
          endpoint = "/api/admin/delete-content-block";
          body = { ...body, contentBlockId: id };
          break;
        case "contentItem":
          endpoint = "/api/admin/delete-content-item";
          body = { ...body, contentItemId: id };
          break;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Deleted successfully!");
        fetchAllData(); // Refresh data
        // Reset navigation if we deleted the current selection
        if (type === "course" && selectedCourse?.id === id) {
          setViewMode('courses');
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedBlock(null);
        } else if (type === "section" && selectedSection?.id === id) {
          setViewMode('sections');
          setSelectedSection(null);
          setSelectedBlock(null);
        } else if (type === "contentBlock" && selectedBlock?.id === id) {
          setViewMode('blocks');
          setSelectedBlock(null);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Error deleting item");
    } finally {
      setDeleteLoading(null);
    }
  };

  const filterData = (data: any[], searchTerm: string) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredData = () => {
    switch (viewMode) {
      case 'courses':
        return filterData(courses, searchTerm);
      case 'sections':
        return filterData(sections, searchTerm);
      case 'blocks':
        return filterData(contentBlocks, searchTerm);
      case 'items':
        return filterData(contentItems, searchTerm);
      default:
        return [];
    }
  };

  const navigateTo = async (mode: ViewMode, item?: any) => {
    setViewMode(mode);
    setSearchTerm("");
    setLoading(true);
    
    try {
      switch (mode) {
        case 'courses':
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedBlock(null);
          setSections([]);
          setContentBlocks([]);
          setContentItems([]);
          break;
        case 'sections':
          setSelectedCourse(item);
          setSelectedSection(null);
          setSelectedBlock(null);
          setContentBlocks([]);
          setContentItems([]);
          await fetchSectionsForCourse(item.id);
          break;
        case 'blocks':
          setSelectedSection(item);
          setSelectedBlock(null);
          setContentItems([]);
          await fetchBlocksForSection(item.id);
          break;
        case 'items':
          setSelectedBlock(item);
          await fetchItemsForBlock(item.id);
          break;
      }
    } catch (error) {
      console.error("Error navigating:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBreadcrumb = () => {
    const breadcrumbs = [
      { name: 'Courses', onClick: () => navigateTo('courses') }
    ];

    if (selectedCourse) {
      breadcrumbs.push({ name: selectedCourse.title, onClick: () => navigateTo('sections', selectedCourse) });
    }
    if (selectedSection) {
      breadcrumbs.push({ name: selectedSection.title, onClick: () => navigateTo('blocks', selectedSection) });
    }
    if (selectedBlock) {
      breadcrumbs.push({ name: selectedBlock.title, onClick: () => navigateTo('items', selectedBlock) });
    }

    return breadcrumbs;
  };

  const renderContent = () => {
    const data = getFilteredData();
    const breadcrumbs = getBreadcrumb();

    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={crumb.onClick}
                className="hover:text-primary transition-colors"
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Content List */}
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {viewMode === 'courses' && <Folder className="h-5 w-5 text-blue-500" />}
                  {viewMode === 'sections' && <Layers className="h-5 w-5 text-green-500" />}
                  {viewMode === 'blocks' && <FileText className="h-5 w-5 text-purple-500" />}
                  {viewMode === 'items' && <FileText className="h-5 w-5 text-orange-500" />}
                  
                  <div>
                    <h3 className="font-medium">
                      {item.title || item.content_text?.substring(0, 50) || "Untitled"}
                      {item.content_text && item.content_text.length > 50 && "..."}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {viewMode === 'courses' && `${item.sections?.length || 0} sections`}
                      {viewMode === 'sections' && `${item.content_blocks?.length || 0} blocks`}
                      {viewMode === 'blocks' && `${item.content_items?.length || 0} items`}
                      {viewMode === 'items' && `Type: ${item.type}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Navigate Button */}
                {viewMode !== 'items' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (viewMode === 'courses') navigateTo('sections', item);
                      else if (viewMode === 'sections') navigateTo('blocks', item);
                      else if (viewMode === 'blocks') navigateTo('items', item);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const type = viewMode === 'courses' ? 'course' : 
                                viewMode === 'sections' ? 'section' : 
                                viewMode === 'blocks' ? 'contentBlock' : 'contentItem';
                    const name = item.title || item.content_text?.substring(0, 30) || "Item";
                    handleDelete(type, item.id, name);
                  }}
                  disabled={deleteLoading === item.id}
                >
                  {deleteLoading === item.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            {searchTerm ? "No items found matching your search." : "No items available."}
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Enter the admin password to access the delete panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    if (adminPassword === "yavheheAa1@") {
                      setIsAuthenticated(true);
                    } else {
                      alert("Invalid password");
                    }
                  }
                }}
              />
            </div>
            <Button
              onClick={() => {
                if (adminPassword === "yavheheAa1@") {
                  setIsAuthenticated(true);
                } else {
                  alert("Invalid password");
                }
              }}
              className="w-full"
            >
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Delete Panel</h1>
          <p className="text-gray-600">Navigate through courses, sections, blocks, and items to delete content</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {viewMode === 'courses' && 'Select a Course'}
              {viewMode === 'sections' && 'Select a Section'}
              {viewMode === 'blocks' && 'Select a Content Block'}
              {viewMode === 'items' && 'Content Items'}
            </CardTitle>
            <CardDescription>
              {viewMode === 'courses' && 'Choose a course to view its sections'}
              {viewMode === 'sections' && 'Choose a section to view its content blocks'}
              {viewMode === 'blocks' && 'Choose a content block to view its items'}
              {viewMode === 'items' && 'View and delete individual content items'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDeletePanel;
