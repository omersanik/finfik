"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Eye, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

      // Fetch sections
      const sectionsRes = await fetch("/api/admin/sections");
      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData);
      }

      // Fetch content blocks
      const blocksRes = await fetch("/api/admin/content-blocks");
      if (blocksRes.ok) {
        const blocksData = await blocksRes.json();
        setContentBlocks(blocksData);
      }

      // Fetch content items
      const itemsRes = await fetch("/api/admin/content-items");
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setContentItems(itemsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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

  const filteredCourses = filterData(courses, searchTerm);
  const filteredSections = filterData(sections, searchTerm);
  const filteredContentBlocks = filterData(contentBlocks, searchTerm);
  const filteredContentItems = filterData(contentItems, searchTerm);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Delete Panel</h1>
        <Button
          variant="outline"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Courses ({filteredCourses.length})
              </CardTitle>
              <CardDescription>
                Delete entire courses and all their content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.sections?.length || 0} sections</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete("course", course.id, course.title)}
                      disabled={deleteLoading === course.id}
                    >
                      {deleteLoading === course.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Sections ({filteredSections.length})
              </CardTitle>
              <CardDescription>
                Delete sections and all their content blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredSections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.content_blocks?.length || 0} blocks</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete("section", section.id, section.title)}
                      disabled={deleteLoading === section.id}
                    >
                      {deleteLoading === section.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Content Blocks ({filteredContentBlocks.length})
              </CardTitle>
              <CardDescription>
                Delete content blocks and all their items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredContentBlocks.map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{block.title}</h3>
                      <p className="text-sm text-gray-500">{block.content_items?.length || 0} items</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete("contentBlock", block.id, block.title)}
                      disabled={deleteLoading === block.id}
                    >
                      {deleteLoading === block.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Content Items ({filteredContentItems.length})
              </CardTitle>
              <CardDescription>
                Delete individual content items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredContentItems.map((item) => (
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
                      {deleteLoading === item.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDeletePanel;
