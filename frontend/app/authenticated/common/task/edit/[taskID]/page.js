"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function EditTaskPage({ params }) {
  const unwrappedParams = use(params);
  const taskID = unwrappedParams.taskID;
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [date, setDate] = useState();
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    assignedTo: "",
    project: "",
    deadline: "",
    status: "Pending",
  });
  const [isCreator, setIsCreator] = useState(false);
  const [isAssignee, setIsAssignee] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskResponse, usersResponse, projectsResponse] =
          await Promise.all([
            customFetch(`/tasks/${taskID}`),
            customFetch("/users/users"),
            customFetch("/projects/projects"),
          ]);

        // Check user permissions
        const creator = taskResponse.assignedBy._id === user._id;
        const assignee = taskResponse.assignedTo._id === user._id;

        if (!creator && !assignee) {
          toast.error("You don't have permission to edit this task");
          router.push(`/authenticated/common/task/taskById/${taskID}`);
          return;
        }

        setIsCreator(creator);
        setIsAssignee(assignee);
        setUsers(usersResponse);
        setProjects(projectsResponse);

        setFormData({
          taskName: taskResponse.taskName,
          description: taskResponse.description,
          assignedTo: taskResponse.assignedTo._id,
          project: taskResponse.project?._id || "",
          deadline: taskResponse.deadline,
          status: taskResponse.status,
        });

        if (taskResponse.deadline) {
          setDate(new Date(taskResponse.deadline));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load task data");
        router.push("/authenticated/common/task/taskpage");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskID, router, user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    setFormData((prev) => ({
      ...prev,
      deadline: selectedDate ? selectedDate.toISOString() : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare update data based on user role
      const updateData = {
        updatedAt: new Date().toISOString(),
      };

      if (isCreator) {
        updateData.taskName = formData.taskName;
        updateData.description = formData.description;
        updateData.assignedTo = formData.assignedTo;
        if (formData.project) {
          updateData.project = formData.project;
        }
        updateData.deadline = formData.deadline;
      }

      if (isAssignee) {
        updateData.status = formData.status;
      }

      const response = await customFetch(`/tasks/${taskID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response) {
        toast.success("Task updated successfully");
        router.push(`/authenticated/common/task/taskById/${taskID}`);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  // Group users by role
  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});

  if (loading && !formData.taskName) {
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

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          {/* Task Name - Editable by creator */}
          {isCreator && (
            <div>
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                name="taskName"
                value={formData.taskName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Description - Editable by creator */}
          {isCreator && (
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>
          )}

          {/* Assign To - Editable by creator */}
          {isCreator && (
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("assignedTo", value)
                }
                value={formData.assignedTo}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(usersByRole).map(([role, roleUsers]) => (
                    <div key={role}>
                      <div className="text-xs text-muted-foreground px-2 py-1.5">
                        {role}
                      </div>
                      {roleUsers.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Project - Editable by creator */}
          {isCreator && (
            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Select
                onValueChange={(value) => handleSelectChange("project", value)}
                value={formData.project}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Deadline - Editable by creator */}
          {isCreator && (
            <div>
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a deadline</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Status - Editable by assignee */}
          {isAssignee && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => handleSelectChange("status", value)}
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/common/task/taskById/${taskID}`)
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
