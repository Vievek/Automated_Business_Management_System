"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import AiDialog from "@/app/_components/AiDialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

function NewTaskPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  // Fetch users and projects when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          customFetch("/users/users"),
          customFetch("/projects/projects"),
        ]);
        setUsers(usersResponse);
        setProjects(projectsResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      }
    };

    fetchData();
  }, []);

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
    if (!user) {
      toast.error("You must be logged in to create a task");
      return;
    }

    if (!formData.deadline) {
      toast.error("Please select a deadline");
      return;
    }

    if (!formData.description) {
      toast.error("Please provide a description");
      return;
    }

    try {
      setLoading(true);

      // Prepare the request body
      const requestBody = {
        taskName: formData.taskName,
        description: formData.description,
        assignedTo: formData.assignedTo,
        deadline: formData.deadline,
        status: formData.status,
        assignedBy: user._id,
      };

      // Only include project if it's not empty
      if (formData.project) {
        requestBody.project = formData.project;
      }

      const response = await customFetch("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response) {
        toast.success("Task created successfully");
        router.push("/authenticated/common/task/taskpage");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
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

  const InputPrompt =
    "I will provide an input. Using the input, generate a task name and description in JSON format. The taskName should be a concise title of the task, and description should explain what needs to be done.";
  const DialogTitle = "Generate Task with AI";
  const placeholder = "Describe the task you want to create...";

  // Callback function to receive data from child
  const handleChildData = (data) => {
    try {
      // Parse the JSON string if it's a string
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      setFormData((prev) => ({
        ...prev,
        taskName: parsedData.taskName || prev.taskName,
        description: parsedData.description || prev.description,
      }));

      toast.success("AI-generated content applied to form");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      toast.error("Failed to apply AI-generated content");
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Task</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe the task details..."
            />
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select
              onValueChange={(value) => handleSelectChange("assignedTo", value)}
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/authenticated/common/task/taskpage")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
      <div className="absolute bottom-4 right-4">
        <AiDialog
          inputPrompt={InputPrompt}
          dialogTitle={DialogTitle}
          placeholder={placeholder}
          sendDataToParent={handleChildData}
        />
      </div>
    </ProtectedRoute>
  );
}

export default NewTaskPage;
