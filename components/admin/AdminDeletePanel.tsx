"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, AlertTriangle, ChevronRight, Search, Folder, FileText, Layers } from "lucide-react";

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

const AdminDeletePanel = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  // Fetch all data
  useEffect(() => {
    if (isAuthenticated) {
      fetchCourses();
    }
  }, [isAuthenticated]);

  // Fetch sections when course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchSectionsForCourse(selectedCourseId);
      setSelectedSectionId("");
      setSelectedBlockId("");
      setContentBlocks([]);
      setContentItems([]);
    } else {
      setSections([]);
      setSelectedSectionId("");
      setSelectedBlockId("");
      setContentBlocks([]);
      setContentItems([]);
    }
  }, [selectedCourseId]);

  // Fetch blocks when section changes
  useEffect(() => {
    if (selectedSectionId) {
      fetchBlocksForSection(selectedSectionId);
      setSelectedBlockId("");
      setContentItems([]);
    } else {
      setContentBlocks([]);
      setSelectedBlockId("");
      setContentItems([]);
    }
  }, [selectedSectionId]);

  // Fetch items when block changes
  useEffect(() => {
    if (selectedBlockId) {
      fetchItemsForBlock(selectedBlockId);
    } else {
      setContentItems([]);
    }
  }, [selectedBlockId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesRes = await fetch("/api/courses");
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
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
        // Refresh data based on what was deleted
        if (type === "course") {
          setSelectedCourseId("");
          fetchCourses();
        } else if (type === "section") {
          setSelectedSectionId("");
          if (selectedCourseId) {
            fetchSectionsForCourse(selectedCourseId);
          }
        } else if (type === "contentBlock") {
          setSelectedBlockId("");
          if (selectedSectionId) {
            fetchBlocksForSection(selectedSectionId);
          }
        } else if (type === "contentItem") {
          if (selectedBlockId) {
            fetchItemsForBlock(selectedBlockId);
          }
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

  const getSelectedCourse = () => courses.find(c => c.id === selectedCourseId);
  const getSelectedSection = () => sections.find(s => s.id === selectedSectionId);
  const getSelectedBlock = () => contentBlocks.find(b => b.id === selectedBlockId);

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
          <p className="text-gray-600">Select courses, sections, blocks, and items to delete content</p>
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
        <div className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                Select Course
              </CardTitle>
              <CardDescription>
                Choose a course to view its sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Section Selection */}
          {selectedCourseId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-green-500" />
                  Select Section
                </CardTitle>
                <CardDescription>
                  Choose a section to view its content blocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Content Block Selection */}
          {selectedSectionId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Select Content Block
                </CardTitle>
                <CardDescription>
                  Choose a content block to view its items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedBlockId} onValueChange={setSelectedBlockId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a content block..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contentBlocks.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Content Items */}
          {selectedBlockId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Content Items
                </CardTitle>
                <CardDescription>
                  View and delete individual content items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {item.content_text?.substring(0, 50) || "No content"}
                            {item.content_text && item.content_text.length > 50 && "..."}
                          </h3>
                          <Badge variant="secondary">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete("contentItem", item.id, item.content_text?.substring(0, 30) || "Content Item")}
                        disabled={deleteLoading === item.id}
                      >
                        {deleteLoading === item.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                  {contentItems.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No content items found in this block.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Buttons for Selected Items */}
          {selectedCourseId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Delete Options
                </CardTitle>
                <CardDescription>
                  Delete the currently selected items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getSelectedCourse() && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Delete Course: {getSelectedCourse()?.title}</h3>
                      <p className="text-sm text-gray-500">This will delete the entire course and all its content</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete("course", selectedCourseId, getSelectedCourse()?.title || "")}
                      disabled={deleteLoading === selectedCourseId}
                    >
                      {deleteLoading === selectedCourseId ? "Deleting..." : "Delete Course"}
                    </Button>
                  </div>
                )}

                {getSelectedSection() && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Delete Section: {getSelectedSection()?.title}</h3>
                      <p className="text-sm text-gray-500">This will delete the section and all its content blocks</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete("section", selectedSectionId, getSelectedSection()?.title || "")}
                      disabled={deleteLoading === selectedSectionId}
                    >
                      {deleteLoading === selectedSectionId ? "Deleting..." : "Delete Section"}
                    </Button>
                  </div>
                )}

                {getSelectedBlock() && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Delete Content Block: {getSelectedBlock()?.title}</h3>
                      <p className="text-sm text-gray-500">This will delete the content block and all its items</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete("contentBlock", selectedBlockId, getSelectedBlock()?.title || "")}
                      disabled={deleteLoading === selectedBlockId}
                    >
                      {deleteLoading === selectedBlockId ? "Deleting..." : "Delete Block"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDeletePanel;
