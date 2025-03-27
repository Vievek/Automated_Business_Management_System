"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import { format } from "date-fns";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function IssuesPage() {
  const { user, fetchUser } = useAuthStore();
  const [issues, setIssues] = useState({ toMe: [], byMe: [] });
  const [loading, setLoading] = useState(true);

  console.log("1. Initial render - user state:", user);

  useEffect(() => {
    console.log("2. useEffect triggered - current user:", user);

    const loadData = async () => {
      if (!user) {
        console.log("3. No user found - fetching user...");
        try {
          await fetchUser();
        } catch (error) {
          console.error("Error fetching user:", error);
        }
        return;
      }

      try {
        console.log("4. Fetching issues for user ID:", user._id);
        setLoading(true);

        const [toMeResponse, byMeResponse] = await Promise.all([
          customFetch(`/issues/issues/raisedTo/${user._id}`),
          customFetch(`/issues/issues/raisedBy/${user._id}`),
        ]);

        console.log(
          "5. API responses - toMe:",
          toMeResponse,
          "byMe:",
          byMeResponse
        );

        setIssues({
          toMe: toMeResponse || [],
          byMe: byMeResponse || [],
        });
      } catch (error) {
        console.error("6. Error fetching issues:", error);
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
        console.log("7. Finished loading issues");
      }
    };

    loadData();
  }, [user, fetchUser]); // Added fetchUser to dependencies

  const getStatusBadge = (noted, resolved) => {
    console.log("Rendering status badge for:", { noted, resolved });
    if (resolved) return <Badge variant="success">Resolved</Badge>;
    if (noted) return <Badge variant="secondary">Noted</Badge>;
    return <Badge variant="destructive">Pending</Badge>;
  };

  const renderTable = (data, type) => {
    console.log(`Rendering ${type} table with ${data.length} items`);

    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Skeleton className="h-12 w-full" />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            {type === "toMe"
              ? "No issues raised to you"
              : "You haven't raised any issues"}
          </TableCell>
        </TableRow>
      );
    }

    return data.map((issue) => (
      <TableRow key={issue._id}>
        <TableCell>{issue.issueName}</TableCell>
        <TableCell>{issue.details}</TableCell>
        <TableCell>
          {type === "toMe" ? issue.raisedBy.username : issue.raisedTo.username}
        </TableCell>
        <TableCell>
          {getStatusBadge(issue.notedStatus, issue.resolvedStatus)}
        </TableCell>
        <TableCell>{format(new Date(issue.createdAt), "PPP")}</TableCell>
      </TableRow>
    ));
  };

  console.log("8. Component render - current state:", { issues, loading });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Issue Tracking</h1>

        <Tabs defaultValue="raisedToMe">
          <TabsList>
            <TabsTrigger value="raisedToMe">Raised To Me</TabsTrigger>
            <TabsTrigger value="raisedByMe">Raised By Me</TabsTrigger>
          </TabsList>

          <TabsContent value="raisedToMe">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTable(issues.toMe, "toMe")}</TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="raisedByMe">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Raised To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderTable(issues.byMe, "byMe")}</TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
      <Link
        href="/authenticated/common/issues/newIssue"
        className="fixed bottom-4 right-4"
      >
        <Button>New Issue</Button>
      </Link>
    </ProtectedRoute>
  );
}

export default IssuesPage;
