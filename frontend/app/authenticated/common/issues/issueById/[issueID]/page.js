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

export default function IssueDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const response = await customFetch(
          `/issues/issues/${unwrappedParams.issueID}`
        );
        setIssue(response);
      } catch (error) {
        console.error("Error fetching issue:", error);
        toast.error("Failed to load issue");
        router.push("/authenticated/common/issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [unwrappedParams.issueID, router]);

  const getStatusBadge = (noted, resolved) => {
    if (resolved) return <Badge variant="success">Resolved</Badge>;
    if (noted) return <Badge variant="secondary">Noted</Badge>;
    return <Badge variant="destructive">Pending</Badge>;
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

  if (!issue) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p>Issue not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{issue.issueName}</h1>
            <p className="text-muted-foreground">
              Created on {format(new Date(issue.createdAt), "PPP")}
            </p>
          </div>
          <div>{getStatusBadge(issue.notedStatus, issue.resolvedStatus)}</div>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <p className="whitespace-pre-line">{issue.details}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Raised By</h2>
              <p>{issue.raisedBy?.username || "Unknown user"}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Raised To</h2>
              <p>{issue.raisedTo?.username || "Unknown user"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push("/authenticated/common/issues/issuepage")
              }
            >
              Back to Issues
            </Button>
            {user._id === issue.raisedTo._id && <Button>Mark as Noted</Button>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
