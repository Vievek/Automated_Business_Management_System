"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import { Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TransactionDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const { type, id } = unwrappedParams;
  const router = useRouter();
  const { user } = useAuthStore();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Validate transaction type
  const isValidType = type === "income" || type === "expense";
  const apiEndpoint = `/${type}/${id}`;

  useEffect(() => {
    if (!isValidType) {
      toast.error("Invalid transaction type");
      router.push("/authenticated/cfo/dashboard");
      return;
    }

    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await customFetch(apiEndpoint);
        setTransaction(response);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast.error(`Failed to load ${type}`);
        router.push("/authenticated/cfo/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [type, id, router, apiEndpoint, isValidType]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await customFetch(apiEndpoint, {
        method: "DELETE",
      });
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
      );
      router.push("/authenticated/cfo/dashboard");
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
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

  if (!transaction) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p>Transaction not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-10">
              {type.charAt(0).toUpperCase() + type.slice(1)} Details
            </h1>
            <div className="text-muted-foreground space-y-1">
              <p>Created on {format(new Date(transaction.date), "PPPp")}</p>
              {transaction.updatedAt &&
                transaction.updatedAt !== transaction.date && (
                  <p>
                    Last updated on{" "}
                    {format(new Date(transaction.updatedAt), "PPPp")}
                  </p>
                )}
            </div>
          </div>
          <Badge variant={type === "income" ? "success" : "destructive"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Amount</h2>
            <p className="text-2xl font-bold">
              ₹{transaction.amount.toLocaleString()}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="whitespace-pre-line">{transaction.description}</p>
          </div>

          {transaction.projectId && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Project</h2>
              <p>
                {transaction.projectId?.name || "Project details not available"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/authenticated/cfo/dashboard")}
            >
              Back to Transactions
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                router.push(`/authenticated/cfo/edit/${type}/${id}`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this{" "}
              {type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
