"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import { format } from "date-fns";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";

// Define authorized roles who can assign tasks and see "Assigned By Me" tab
const AUTHORIZED_ROLES = ["ceo", "cfo", "hr", "team lead", "pm"];

function TasksPage() {
  const { user, fetchUser } = useAuthStore();
  const [tasks, setTasks] = useState({ assignedToMe: [], assignedByMe: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const generateTaskPDF = (task) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Task Report", 105, 20, null, null, "center");

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Body content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    let y = 35;

    const addRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${value || "N/A"}`, 60, y);
      y += 10;
    };

    addRow("Task Name", task.taskName);
    // addRow("Description", task.description);
    addRow("Assigned By", task.assignedBy?.username);
    addRow("Assigned To", task.assignedTo?.username);
    addRow("Project", task.project?.name);
    addRow("Status", task.status);
    addRow("Deadline", format(new Date(task.deadline), "PPP"));

    // Add some space before additional details
    y += 10;

    // Additional details section
    doc.setFont("helvetica", "bold");
    doc.text("Additional Details:", 20, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    const descriptionLines = doc.splitTextToSize(
      task.description || "No description provided",
      170
    );
    doc.text(descriptionLines, 20, y);
    y += descriptionLines.length * 7;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Generated by Task Management System", 20, 280);

    doc.save(`task-${task._id}.pdf`);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        try {
          await fetchUser();
        } catch (error) {
          console.error("Error fetching user:", error);
        }
        return;
      }

      // Check if user has authorized role
      setIsAuthorized(AUTHORIZED_ROLES.includes(user.role));

      try {
        setLoading(true);
        const [assignedToMeResponse, assignedByMeResponse] = await Promise.all([
          customFetch(`/tasks/assignedTo/${user._id}`),
          isAuthorized
            ? customFetch(`/tasks/assignedBy/${user._id}`)
            : Promise.resolve([]),
        ]);

        setTasks({
          assignedToMe: assignedToMeResponse || [],
          assignedByMe: assignedByMeResponse || [],
        });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, fetchUser, isAuthorized]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const allTasks = [...tasks.assignedToMe, ...tasks.assignedByMe];
    const results = allTasks.filter(
      (task) =>
        task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedBy?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        task.assignedTo?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        task.project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, tasks]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="destructive">Pending</Badge>;
      case "In Progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderTable = (data, showAssignedBy = true) => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7}>
            <Skeleton className="h-12 w-full" />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            No tasks found
          </TableCell>
        </TableRow>
      );
    }

    return data.map((task) => (
      <TableRow key={task._id}>
        <TableCell>{task.taskName}</TableCell>
        <TableCell className="max-w-[300px] truncate">
          {task.description}
        </TableCell>
        <TableCell>
          {showAssignedBy
            ? task.assignedBy?.username
            : task.assignedTo?.username}
        </TableCell>
        <TableCell>{task.project?.name || "No project"}</TableCell>
        <TableCell>{getStatusBadge(task.status)}</TableCell>
        <TableCell>
          {task.deadline
            ? format(new Date(task.deadline), "PPP")
            : "No deadline"}
        </TableCell>
        <TableCell>
          <Link href={`/authenticated/common/task/taskById/${task._id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            title="Download Task PDF"
            onClick={() => generateTaskPDF(task)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Management</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {searchQuery ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Related User</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTable(
                  searchResults,
                  searchQuery.includes(
                    tasks.assignedByMe.some((task) =>
                      task.assignedBy?.username
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Tabs defaultValue="assignedToMe">
            <TabsList>
              <TabsTrigger value="assignedToMe">Assigned To Me</TabsTrigger>
              {isAuthorized && (
                <TabsTrigger value="assignedByMe">Assigned By Me</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="assignedToMe">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTable(tasks.assignedToMe, true)}</TableBody>
              </Table>
            </TabsContent>

            {isAuthorized && (
              <TabsContent value="assignedByMe">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTable(tasks.assignedByMe, false)}
                  </TableBody>
                </Table>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
      {isAuthorized && (
        <Link
          href="/authenticated/common/task/newTask"
          className="fixed bottom-4 right-4"
        >
          <Button>New Task</Button>
        </Link>
      )}
    </ProtectedRoute>
  );
}

export default TasksPage;
