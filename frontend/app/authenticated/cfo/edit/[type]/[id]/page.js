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
import { format } from "date-fns";

export default function EditTransactionPage({ params }) {
  const unwrappedParams = use(params);
  const { type, id } = unwrappedParams;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString(),
    projectId: null,
  });
  const [projects, setProjects] = useState([]);

  // Validate transaction type
  const isValidType = type === "income" || type === "expense";
  const apiEndpoint = `/${type}/${id}`;

  useEffect(() => {
    if (!isValidType) {
      toast.error("Invalid transaction type");
      router.push("/authenticated/cfo/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch transaction data
        const transaction = await customFetch(apiEndpoint);

        // Fetch available projects (if needed)
        const projectsData = await customFetch("/projects/projects");
        setProjects(projectsData);

        setFormData({
          amount: transaction.amount.toString(),
          description: transaction.description,
          date: transaction.date,
          projectId: transaction.projectId?._id || null,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load ${type} data`);
        router.push("/authenticated/cfo/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, router, apiEndpoint, isValidType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        // Keep projectId as null if not selected
        projectId: formData.projectId || null,
      };

      const response = await customFetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response) {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`
        );
        router.push(`/authenticated/cfo/transaction/${type}/${id}`);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      toast.error(`Failed to update ${type}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.amount) {
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
        <h1 className="text-2xl font-bold mb-6">
          Edit {type.charAt(0).toUpperCase() + type.slice(1)}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="mb-2">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="mb-2">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              value={format(new Date(formData.date), "yyyy-MM-dd'T'HH:mm")}
              onChange={handleChange}
              required
            />
          </div>

          {/* Project Selection */}
          <div>
            <Label htmlFor="projectId" className="mb-2">
              Project (Optional)
            </Label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId || ""}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- Select Project --</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/cfo/transactions/${type}/${id}`)
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Updating..."
                : `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
