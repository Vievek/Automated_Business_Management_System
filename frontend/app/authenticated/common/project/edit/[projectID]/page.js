"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectID;
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");
  const [selectedUserToRemove, setSelectedUserToRemove] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
  });
  const [projectMembers, setProjectMembers] = useState([]);

  // Fetch project data and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectRes, usersRes] = await Promise.all([
          customFetch(`/projects/projects/${projectId}`),
          customFetch("/users/users"),
        ]);

        setFormData({
          name: projectRes.name,
          description: projectRes.description || "",
          startDate: projectRes.startDate
            ? new Date(projectRes.startDate).toISOString().split("T")[0]
            : "",
        });
        setProjectMembers(projectRes.members || []);
        setUsers(usersRes.filter((u) => u._id !== user?._id)); // Exclude current user
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user?._id]);

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
      toast.error("You must be logged in to edit a project");
      return;
    }

    try {
      setLoading(true);
      const response = await customFetch(`/projects/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response) {
        toast.success("Project updated successfully");
        router.push(`/authenticated/common/project/projectpage/${projectId}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) {
      toast.warning("Please select a user to add");
      return;
    }

    try {
      setLoading(true);
      await customFetch(
        `/projects/projects/${projectId}/members/${selectedUserToAdd}`,
        {
          method: "PUT",
        }
      );
      toast.success("Member added successfully");
      // Refresh members list
      const projectRes = await customFetch(`/projects/projects/${projectId}`);
      setProjectMembers(projectRes.members || []);
      setSelectedUserToAdd("");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedUserToRemove) {
      toast.warning("Please select a member to remove");
      return;
    }

    try {
      setLoading(true);
      await customFetch(
        `/projects/projects/${projectId}/members/${selectedUserToRemove}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Member removed successfully");
      // Refresh members list
      const projectRes = await customFetch(`/projects/projects/${projectId}`);
      setProjectMembers(projectRes.members || []);
      setSelectedUserToRemove("");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  // Filter out current members from users available to add
  const availableUsers = users.filter(
    (user) => !projectMembers.some((member) => member._id === user._id)
  );

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">Edit Project</h1>

        {/* Section 1: Project Details */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Project Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className={"mb-2"}>
                Project Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description" className={"mb-2"}>
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="startDate" className={"mb-2"}>
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
              />
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
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Section 2: Add Members */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Add Team Members</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label>Select User to Add</Label>
              <Select
                value={selectedUserToAdd}
                onValueChange={setSelectedUserToAdd}
                disabled={loading || availableUsers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.username} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddMember}
              disabled={loading || !selectedUserToAdd}
            >
              Add Member
            </Button>
          </div>
        </div>

        {/* Section 3: Remove Members */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Manage Team Members</h2>
          {projectMembers.length > 0 ? (
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Select Member to Remove</Label>
                <Select
                  value={selectedUserToRemove}
                  onValueChange={setSelectedUserToRemove}
                  disabled={loading || projectMembers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.username} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                disabled={loading || !selectedUserToRemove}
              >
                Remove Member
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">No members to manage</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default EditProjectPage;
