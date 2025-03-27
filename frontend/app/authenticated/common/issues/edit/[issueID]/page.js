"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditIssuePage({ params }) {
  const unwrappedParams = use(params);
  const issueID = unwrappedParams.issueID;
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    issueName: "",
    details: "",
    notedStatus: false,
    resolvedStatus: false,
  });
  const [isCreator, setIsCreator] = useState(false);
  const [isRecipient, setIsRecipient] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const response = await customFetch(`/issues/issues/${issueID}`);

        // Check user permissions
        const creator = response.raisedBy._id === user._id;
        const recipient = response.raisedTo._id === user._id;

        if (!creator && !recipient) {
          toast.error("You don't have permission to edit this issue");
          router.push(`/authenticated/common/issues/${issueID}`);
          return;
        }

        setIsCreator(creator);
        setIsRecipient(recipient);

        setFormData({
          issueName: response.issueName,
          details: response.details,
          notedStatus: response.notedStatus,
          resolvedStatus: response.resolvedStatus,
        });
      } catch (error) {
        console.error("Error fetching issue:", error);
        toast.error("Failed to load issue");
        router.push("/authenticated/common/issues/issuepage");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueID, router, user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name) => (checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare update data based on user role
      const updateData = {
        issueName: formData.issueName,
        details: formData.details,
        updatedAt: new Date().toISOString(),
      };

      // Only include status fields if user is recipient
      if (isRecipient) {
        updateData.notedStatus = formData.notedStatus;
        updateData.resolvedStatus = formData.resolvedStatus;
      }

      const response = await customFetch(`/issues/issues/${issueID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response) {
        toast.success("Issue updated successfully");
        router.push(`/authenticated/common/issues/issueById/${issueID}`);
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      toast.error("Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.issueName) {
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
        <h1 className="text-2xl font-bold mb-6">Edit Issue</h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          {/* Issue Name - Editable by creator */}
          {isCreator && (
            <div>
              <Label htmlFor="issueName" className={"mb-2"}>
                Issue Name
              </Label>
              <Input
                id="issueName"
                name="issueName"
                value={formData.issueName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="details" className={"mb-2"}>
              Details
            </Label>
            <Textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>

          {/* Status Checkboxes - Editable by recipient */}
          {isRecipient && (
            <div className="space-y-2">
              <Label className={"mb-2"}>Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notedStatus"
                  checked={formData.notedStatus}
                  onCheckedChange={handleCheckboxChange("notedStatus")}
                />
                <label
                  htmlFor="notedStatus"
                  className="text-sm font-medium leading-none "
                >
                  Noted
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resolvedStatus"
                  checked={formData.resolvedStatus}
                  onCheckedChange={handleCheckboxChange("resolvedStatus")}
                />
                <label
                  htmlFor="resolvedStatus"
                  className="text-sm font-medium leading-none"
                >
                  Resolved
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/common/issues/issueById/${issueID}`)
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Issue"}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
