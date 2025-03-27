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

function NewIssuePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    issueName: "",
    details: "",
    raisedTo: "",
  });

  // Fetch users when component mounts
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

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      raisedTo: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create an issue");
      return;
    }

    try {
      setLoading(true);
      const response = await customFetch("/issues/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          raisedBy: user._id,
        }),
      });

      if (response) {
        toast.success("Issue created successfully");
        router.push("/authenticated/common/issues/issuepage");
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      toast.error("Failed to create issue");
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
    "I will provide an input. Using the input, generate an issue name and details in JSON format. The issueName should be a concise title of the issue, and details should be written in the first-person perspective, describing the issue as if I am experiencing it.";
  const DialogTitle = "Prompt to get response";
  const placeholder = "Enter your prompt here";

  // Callback function to receive data from child
  const handleChildData = (data) => {
    try {
      // Parse the JSON string if it's a string
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      setFormData((prev) => ({
        ...prev,
        issueName: parsedData.issueName || prev.issueName,
        details: parsedData.details || prev.details,
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
        <h1 className="text-2xl font-bold mb-6">Create New Issue</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div>
            <Label htmlFor="issueName">Issue Name</Label>
            <Input
              id="issueName"
              name="issueName"
              value={formData.issueName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="raisedTo">Raised To</Label>
            <Select
              onValueChange={handleSelectChange}
              value={formData.raisedTo}
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/authenticated/common/issues/issuepage")
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
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

export default NewIssuePage;
