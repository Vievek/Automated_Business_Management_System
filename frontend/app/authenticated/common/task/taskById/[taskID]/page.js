"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import { Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TaskDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const taskID = unwrappedParams.taskID;
  const router = useRouter();
  const { user } = useAuthStore();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await customFetch(`/tasks/${taskID}`);
        setTask(response);
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Failed to load task");
        router.push("/authenticated/common/task/taskpage");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskID, router]);

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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await customFetch(`/tasks/${taskID}`, {
        method: "DELETE",
      });
      toast.success("Task deleted successfully");
      router.push("/authenticated/common/task/taskpage");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p>Task not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-10">{task.taskName}</h1>
          </div>
          <div>{getStatusBadge(task.status)}</div>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">{task.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Assigned By</h2>
              <p>{task.assignedBy?.username || "Unknown user"}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Assigned To</h2>
              <p>{task.assignedTo?.username || "Unknown user"}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Project</h2>
              <p>{task.project?.name || "No project"}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Deadline</h2>
            <p>
              {task.deadline
                ? format(new Date(task.deadline), "PPPp")
                : "No deadline set"}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/authenticated/common/task/taskpage")}
            >
              Back to Tasks
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/common/task/edit/${taskID}`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            {/* Delete Button - Only shown to the task creator */}
            {user._id === task.assignedBy._id && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
