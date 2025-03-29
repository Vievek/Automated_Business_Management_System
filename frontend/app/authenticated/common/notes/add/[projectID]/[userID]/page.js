"use client";
import React, { useState, use } from "react";
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

function CreateNotePage({ params }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const wrappedParams = use(params);
  const projectId = wrappedParams.projectID;
  const userId = wrappedParams.userID;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a note");
      return;
    }

    try {
      setLoading(true);
      const response = await customFetch("/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          project: projectId,
          createdBy: userId,
        }),
      });

      if (response) {
        toast.success("Note created successfully");
        router.push(`/authenticated/common/project/projectpage/${projectId}`);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const InputPrompt =
    "I will provide an input. Using the input, generate a note title and content in JSON format. The title should be a concise summary, and content should be detailed notes in markdown format.";
  const DialogTitle = "Generate Note Content";
  const placeholder = "Describe what you want to note about...";

  const handleChildData = (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setFormData((prev) => ({
        ...prev,
        title: parsedData.title || prev.title,
        content: parsedData.content || prev.content,
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
        <h1 className="text-2xl font-bold mb-6">Create New Note</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <Label htmlFor="title">Note Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/authenticated/common/project/projectpage/${projectId}`
                )
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Note"}
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

export default CreateNotePage;
