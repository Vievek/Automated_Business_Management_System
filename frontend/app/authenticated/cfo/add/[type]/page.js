"use client";
import React, { useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import ProtectedRoute from "@/app/_components/protectedRoute";
import { format } from "date-fns";
import AiDialog from "@/app/_components/AiDialog";

export default function AddTransactionPage({ params }) {
  const unwrappedParams = use(params);
  const type = unwrappedParams.type;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString(),
    projectId: null,
  });
  const [projects, setProjects] = useState([]);

  // Validate transaction type
  const isValidType = type === "income" || type === "expense";
  const apiEndpoint = `/${type}`;

  // Fetch projects on mount
  React.useEffect(() => {
    if (!isValidType) {
      toast.error("Invalid transaction type");
      router.push("/authenticated/cfo/dashboard");
      return;
    }

    const fetchProjects = async () => {
      try {
        const projectsData = await customFetch("/projects/projects");
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, [type, router, isValidType]);

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response) {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`
        );
        router.push(`/authenticated/cfo/dashboard`);
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      toast.error(`Failed to add ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // AI Dialog configuration
  const InputPrompt =
    "I will provide an input about a financial transaction. Using the input, generate a detailed description in JSON format. The description should explain the transaction in clear terms, including purpose, parties involved (if any), and any other relevant details.max 20 words Format: { description: 'detailed description here' }";
  const DialogTitle = "Generate Transaction Description";
  const placeholder =
    "Describe the transaction (e.g., 'Payment for website design services from XYZ Company')";

  // Callback function to receive data from AI dialog
  const handleAiGeneratedData = (data) => {
    try {
      // Parse the JSON string if it's a string
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      setFormData((prev) => ({
        ...prev,
        description: parsedData.description || prev.description,
      }));

      toast.success("AI-generated description applied");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      toast.error("Failed to apply AI-generated description");
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
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

          {/* Description with AI assistant */}
          <div className="relative">
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
              onClick={() => router.push("/authenticated/cfo/dashboard")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Adding..."
                : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          </div>
        </form>
      </div>

      {/* AI Dialog Floating Button */}
      <div className="absolute bottom-4 right-4">
        <AiDialog
          inputPrompt={InputPrompt}
          dialogTitle={DialogTitle}
          placeholder={placeholder}
          sendDataToParent={handleAiGeneratedData}
        />
      </div>
    </ProtectedRoute>
  );
}
