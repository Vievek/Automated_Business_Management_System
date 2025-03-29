"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import AiDialog from "@/app/_components/AiDialog";

function NewProjectPage() {
  const { user, fetchUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await customFetch("/users/users");
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a project");
      return;
    }

    try {
      setLoading(true);
      const response = await customFetch("/projects/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          members: [...selectedMembers, user._id],
        }),
      });

      if (response) {
        toast.success("Project created successfully");
        await fetchUser();
        router.push("/authenticated/common/project/dashboard");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {});

  const InputPrompt =
    "I will provide an input. Using the input, generate a project name and description in JSON format...";
  const DialogTitle = "Prompt to generate project details";
  const placeholder = "Describe your project idea or requirements";

  const handleChildData = (data) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setFormData((prev) => ({
        ...prev,
        name: parsedData.name || prev.name,
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
        <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <Label htmlFor="name" className="mb-3">
              Project Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="mb-3">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>
          <div>
            <Label className="mb-2">Add Members</Label>
            <div className="space-y-2">
              {Object.entries(usersByRole).map(([role, roleUsers]) => (
                <div key={role} className="space-y-1">
                  <div className="text-xs text-muted-foreground px-2 py-1.5">
                    {role}
                  </div>
                  {roleUsers
                    .filter((u) => u._id !== user?._id)
                    .map((user) => (
                      <div key={user._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`user-${user._id}`}
                          checked={selectedMembers.includes(user._id)}
                          onChange={() => handleMemberSelect(user._id)}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`user-${user._id}`}>
                          {user.username} ({user.role})
                        </label>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/authenticated/common/projects")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
        <div className="absolute bottom-4 right-4">
          <AiDialog
            inputPrompt={InputPrompt}
            dialogTitle={DialogTitle}
            placeholder={placeholder}
            sendDataToParent={handleChildData}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default NewProjectPage;
