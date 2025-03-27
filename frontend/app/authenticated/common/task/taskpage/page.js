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
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function TasksPage() {
  const { user, fetchUser } = useAuthStore();
  const [tasks, setTasks] = useState({ assignedToMe: [], assignedByMe: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

      try {
        setLoading(true);
        const [assignedToMeResponse, assignedByMeResponse] = await Promise.all([
          customFetch(`/tasks/assignedTo/${user._id}`),
          customFetch(`/tasks/assignedBy/${user._id}`),
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
  }, [user, fetchUser]);

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
        <TableCell className="max-w-[300px] whitespace-normal break-words">
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
              <TabsTrigger value="assignedByMe">Assigned By Me</TabsTrigger>
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
                <TableBody>{renderTable(tasks.assignedByMe, false)}</TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Link
        href="/authenticated/common/task/newTask"
        className="fixed bottom-4 right-4"
      >
        <Button>New Task</Button>
      </Link>
    </ProtectedRoute>
  );
}

export default TasksPage;
