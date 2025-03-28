"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import AiDialog from "@/app/_components/AiDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreateBacklogPage({ params }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const wrappedParams = use(params);
  const projectId = wrappedParams.projectID;
  const [loading, setLoading] = useState(false);
  const [nextOrderNo, setNextOrderNo] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "To Do",
  });

  // Fetch the next order number when component mounts
  useEffect(() => {
    const fetchNextOrderNo = async () => {
      try {
        const response = await customFetch(
          `/backlogs/project/${projectId}/next-order`
        );
        setNextOrderNo(response.nextOrderNo || 1);
      } catch (error) {
        console.error("Error fetching next order number:", error);
        toast.error("Failed to load sequence data");
      }
    };

    fetchNextOrderNo();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a backlog item");
      return;
    }

    try {
      setLoading(true);
      const response = await customFetch("/backlogs/backlogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          orderNo: nextOrderNo,
          project: projectId,
        }),
      });

      if (response) {
        toast.success("Backlog item created successfully");
        router.push(`/authenticated/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Error creating backlog item:", error);
      toast.error("Failed to create backlog item");
    } finally {
      setLoading(false);
    }
  };

  const InputPrompt =
    "I will provide an input. Using the input, generate a backlog item title and description in JSON format. The title should be a concise task summary, and description should be detailed requirements or acceptance criteria.";
  const DialogTitle = "Generate Backlog Item";
  const placeholder = "Describe the task or feature you want to add...";

  const handleChildData = (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setFormData((prev) => ({
        ...prev,
        title: parsedData.title || prev.title,
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
        <h1 className="text-2xl font-bold mb-6">Create New Backlog Item</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
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
              rows={5}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            This will be added as item #{nextOrderNo} in the backlog
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/projects/${projectId}`)
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Backlog Item"}
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

export default CreateBacklogPage;
