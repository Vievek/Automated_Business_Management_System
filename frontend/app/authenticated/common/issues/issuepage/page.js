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
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function IssuesPage() {
  const { user, fetchUser } = useAuthStore();
  const [issues, setIssues] = useState({ toMe: [], byMe: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        try {
          await fetchUser();
        } catch (error) {
          console.error("Error fetching user:", error);
        }
        return;
      }

      try {
        setLoading(true);
        const [toMeResponse, byMeResponse] = await Promise.all([
          customFetch(`/issues/issues/raisedTo/${user._id}`),
          customFetch(`/issues/issues/raisedBy/${user._id}`),
        ]);

        setIssues({
          toMe: toMeResponse || [],
          byMe: byMeResponse || [],
        });
      } catch (error) {
        console.error("Error fetching issues:", error);
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, fetchUser]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const allIssues = [...issues.toMe, ...issues.byMe];
    const results = allIssues.filter(
      (issue) =>
        issue.issueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.raisedBy?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        issue.raisedTo?.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, issues]);

  const getStatusBadge = (noted, resolved) => {
    if (resolved) return <Badge variant="success">Resolved</Badge>;
    if (noted) return <Badge variant="secondary">Noted</Badge>;
    return <Badge variant="destructive">Pending</Badge>;
  };

  const renderTable = (data, showRaisedBy = true) => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <Skeleton className="h-12 w-full" />
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            No issues found
          </TableCell>
        </TableRow>
      );
    }

    return data.map((issue) => (
      <TableRow key={issue._id}>
        <TableCell>{issue.issueName}</TableCell>
        <TableCell className="max-w-[400px] whitespace-normal break-words">
          {issue.details}
        </TableCell>
        <TableCell>
          {showRaisedBy ? issue.raisedBy?.username : issue.raisedTo?.username}
        </TableCell>
        <TableCell>
          {getStatusBadge(issue.notedStatus, issue.resolvedStatus)}
        </TableCell>
        <TableCell>{format(new Date(issue.createdAt), "PPP")}</TableCell>
        <TableCell>
          <Link href={`/authenticated/common/issues/issueById/${issue._id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Issue Tracking</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search issues..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {searchQuery ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Search Results for "{searchQuery}"
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Related User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTable(
                  searchResults,
                  searchQuery.includes(
                    issues.toMe.some((issue) =>
                      issue.raisedBy?.username
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTable(issues.toMe, true)}</TableBody>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderTable(issues.byMe, false)}</TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
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
