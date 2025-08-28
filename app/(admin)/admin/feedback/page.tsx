"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { 
  MessageSquare, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  User,
  Mail,
  Calendar,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  email?: string;
  created_at: string;
  admin_notes?: string;
  reviewed_at?: string;
  users: {
    name: string;
    email: string;
  };
}



const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800 border-gray-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function AdminFeedbackPage() {
  const { userId } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    if (userId) {
      fetchFeedback();
    }
  }, [userId]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/admin/feedback");
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch {
      setError("Failed to fetch feedback");
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackId: selectedFeedback.id,
          status: updateStatus,
          adminNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback");
      }

      const data = await response.json();
      
      // Update local state
      setFeedback(prev => 
        prev.map(item => 
          item.id === selectedFeedback.id 
            ? { ...item, ...data.feedback }
            : item
        )
      );

      toast.success("Feedback updated successfully");
      setIsUpdateDialogOpen(false);
      setSelectedFeedback(null);
      setUpdateStatus("");
      setAdminNotes("");
    } catch {
      toast.error("Failed to update feedback");
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "reviewed": return <Eye className="w-4 h-4" />;
      case "in_progress": return <AlertCircle className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      case "closed": return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading feedback...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Beta Feedback Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and review all beta user feedback submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{feedback.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {feedback.filter(f => f.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {feedback.filter(f => f.status === "in_progress").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {feedback.filter(f => f.status === "resolved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="ui">UI/UX Feedback</SelectItem>
                <SelectItem value="content">Content Feedback</SelectItem>
                <SelectItem value="performance">Performance Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No feedback found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
                     filteredFeedback.map((item) => {
             return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                                         <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                         <MessageSquare className="w-5 h-5 text-white" />
                       </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{item.users.name}</span>
                          <Mail className="w-4 h-4 ml-2" />
                          <span>{item.users.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={cn("", priorityColors[item.priority as keyof typeof priorityColors])}>
                        {item.priority}
                      </Badge>
                      <Badge className={cn("", statusColors[item.status as keyof typeof statusColors])}>
                        {getStatusIcon(item.status)}
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      {item.reviewed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Reviewed: {new Date(item.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                                                         <DialogTitle className="flex items-center gap-2">
                               <MessageSquare className="w-5 h-5" />
                               {item.title}
                             </DialogTitle>
                            <DialogDescription>
                              Feedback from {item.users.name} ({item.users.email})
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Category</label>
                                <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Priority</label>
                                <Badge className={cn("mt-1", priorityColors[item.priority as keyof typeof priorityColors])}>
                                  {item.priority}
                                </Badge>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>

                            {item.email && (
                              <div>
                                <label className="text-sm font-medium">Contact Email</label>
                                <p className="text-sm text-muted-foreground mt-1">{item.email}</p>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium">Submitted</label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            </div>

                            {item.admin_notes && (
                              <div>
                                <label className="text-sm font-medium">Admin Notes</label>
                                <p className="text-sm text-muted-foreground mt-1">{item.admin_notes}</p>
                              </div>
                            )}

                            <div className="pt-4 border-t">
                              <Button
                                onClick={() => {
                                  setSelectedFeedback(item);
                                  setUpdateStatus(item.status);
                                  setAdminNotes(item.admin_notes || "");
                                  setIsUpdateDialogOpen(true);
                                }}
                                className="w-full"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Update Status & Notes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Feedback Status</DialogTitle>
            <DialogDescription>
              Update the status and add admin notes for this feedback.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                placeholder="Add your notes here..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateFeedback}>
                Update Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
