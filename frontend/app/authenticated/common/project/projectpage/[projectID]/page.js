"use client";
import React, { useState, useEffect, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import { format } from "date-fns";
import ProtectedRoute from "@/app/_components/protectedRoute";
import useAuthStore from "@/stores/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, FileSearch, FileDigit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

function ProjectNotesPage({ params }) {
  const router = useRouter();
  const wrappedParams = use(params);
  const projectId = wrappedParams.projectID;
  const { user, fetchUser } = useAuthStore();
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [backlogs, setBacklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        try {
          await fetchUser();
          return;
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }

      try {
        setLoading(true);
        const [projectRes, notesRes, backlogsRes] = await Promise.all([
          customFetch(`/projects/projects/${projectId}`),
          customFetch(`/notes/project/${projectId}`),
          customFetch(`/backlogs/project/${projectId}`),
        ]);

        setProject(projectRes);
        setNotes(notesRes || []);
        setBacklogs(backlogsRes || []);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, fetchUser, projectId]);

  const showDeleteConfirmation = () => {
    toast.custom(
      (t) => (
        <div className="bg-background border rounded-lg p-4 shadow-lg w-full max-w-md">
          <h3 className="font-medium mb-2">Confirm Deletion</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleDeleteProject();
                toast.dismiss(t);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await customFetch(`/projects/projects/${projectId}`, {
        method: "DELETE",
      });
      toast.success("Project deleted successfully");
      router.push("/authenticated/common/project/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      (note.title &&
        note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (note.content &&
        note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (note.createdBy?.username &&
        note.createdBy.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const filteredBacklogs = backlogs.filter(
    (backlog) =>
      (backlog.title &&
        backlog.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (backlog.description &&
        backlog.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderNoteAccordion = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <AccordionItem key={`skeleton-${i}`} value={`skeleton-${i}`}>
            <AccordionTrigger>
              <Skeleton className="h-6 w-3/4" />
            </AccordionTrigger>
            <AccordionContent>
              <Skeleton className="h-20 w-full" />
            </AccordionContent>
          </AccordionItem>
        ));
    }

    if (filteredNotes.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No notes found
        </div>
      );
    }

    return filteredNotes.map((note) => (
      <AccordionItem key={note._id} value={note._id}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center space-x-4">
            <span className="font-medium">{note.title}</span>
            <span className="text-sm text-muted-foreground">
              Created by: {note.createdBy?.username || "Unknown"}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{note.content}</p>
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  const renderBacklogAccordion = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, i) => (
          <AccordionItem
            key={`skeleton-backlog-${i}`}
            value={`skeleton-backlog-${i}`}
          >
            <AccordionTrigger>
              <Skeleton className="h-6 w-3/4" />
            </AccordionTrigger>
            <AccordionContent>
              <Skeleton className="h-20 w-full" />
            </AccordionContent>
          </AccordionItem>
        ));
    }

    if (filteredBacklogs.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No backlogs found
        </div>
      );
    }

    return filteredBacklogs.map((backlog) => (
      <AccordionItem key={backlog._id} value={backlog._id}>
        <AccordionTrigger>
          <div className="flex items-center space-x-4">
            <span className="font-medium">{backlog.title}</span>
            <Badge
              variant={backlog.status === "completed" ? "success" : "outline"}
            >
              {backlog.status}
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">{backlog.description}</p>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Due:{" "}
              {backlog.dueDate
                ? format(new Date(backlog.dueDate), "PPP")
                : "No due date"}
            </span>
            <span>
              Assigned to: {backlog.assignedTo?.username || "Unassigned"}
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {project?.name || "Project Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {project?.description || "Loading project details..."}
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${activeTab}...`}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Project Documents Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Project Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() =>
                router.push(`/authenticated/common/project/qna/${projectId}`)
              }
            >
              <FileSearch className="h-8 w-8 mb-2" />
              <h3 className="font-medium">Questions and Answers</h3>
            </Card>
            <Card
              className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() =>
                router.push(`/authenticated/common/project/srs/${projectId}`)
              }
            >
              <FileText className="h-8 w-8 mb-2" />
              <h3 className="font-medium">SRS Documentation</h3>
            </Card>
            <Card
              className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() =>
                router.push(`/authenticated/projects/${projectId}/quotation`)
              }
            >
              <FileDigit className="h-8 w-8 mb-2" />
              <h3 className="font-medium">Project Quotation</h3>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="notes" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="backlogs">Backlogs</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Link
                href={`/authenticated/common/${activeTab}/add/${projectId}/${user._id}`}
              >
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Add {activeTab === "notes" ? "Note" : "Backlog"}
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="notes">
            <div className="border rounded-lg p-4">
              <Accordion type="multiple" className="w-full">
                {renderNoteAccordion()}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="backlogs">
            <div className="border rounded-lg p-4">
              <Accordion type="multiple" className="w-full">
                {renderBacklogAccordion()}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>

        {/* Project members section */}
        {project?.members?.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Members</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {project.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-3 p-3 border rounded-lg w-full max-w-xs cursor-pointer hover:bg-accent"
                  onClick={() =>
                    router.push(`/authenticated/users/${member._id}`)
                  }
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {member.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.firstname} {member.lastname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{member.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <Button
            variant="ghost"
            onClick={() =>
              router.push("/authenticated/common/project/dashboard")
            }
            disabled={isDeleting}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/authenticated/common/project/edit/${projectId}`)
            }
            disabled={isDeleting}
          >
            Edit Project
          </Button>
          <Button
            variant="destructive"
            onClick={showDeleteConfirmation}
            disabled={isDeleting || loading} // Disable if either loading state is true
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ProjectNotesPage;
