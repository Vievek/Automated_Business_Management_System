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
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";

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

  const generateProjectPDF = () => {
    if (!project) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 7;

    // Header
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(`Project: ${project.name}`, pageWidth / 2, 20, {
      align: "center",
    });
    doc.setLineWidth(0.5).line(margin, 25, pageWidth - margin, 25);

    let y = 35;

    const addRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      const labelLines = doc.splitTextToSize(label + ":", 40);
      doc.text(labelLines, margin, y);

      doc.setFont("helvetica", "normal");
      const valueLines = doc.splitTextToSize(value || "N/A", maxWidth - 50);

      const neededHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight;

      if (y + neededHeight > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(valueLines, margin + 50, y);
      y += neededHeight + 5;
    };

    const addSectionHeader = (text) => {
      y += 10;
      doc.setFont("helvetica", "bold").setFontSize(14);
      doc.text(text, margin, y);
      y += 10;
      doc.setFontSize(10);
    };

    // Project Details
    addRow("Project Name", project.name);
    addRow("Description", project.description);
    // addRow(
    //   "Start Date",
    //   project.startDate ? format(new Date(project.startDate), "PPP") : "N/A"
    // );
    // addRow(
    //   "End Date",
    //   project.endDate ? format(new Date(project.endDate), "PPP") : "N/A"
    // );
    // addRow("Status", project.status);

    // Project Notes
    if (notes.length > 0) {
      addSectionHeader("Project Notes");
      notes.forEach((note, index) => {
        addRow(`Note ${index + 1} - ${note.title}`, note.content);
        if (note.tags?.length > 0) {
          doc.text(`Tags: ${note.tags.join(", ")}`, margin + 50, y);
          y += lineHeight;
        }
        y += 5;
      });
    }

    // Project Backlogs
    if (backlogs.length > 0) {
      addSectionHeader("Project Backlogs");
      backlogs.forEach((backlog, index) => {
        addRow(`Backlog ${index + 1} - ${backlog.title}`, backlog.description);
        addRow("Status", backlog.status);
        addRow(
          "Due Date",
          backlog.dueDate
            ? format(new Date(backlog.dueDate), "PPP")
            : "No due date"
        );
        addRow("Assigned To", backlog.assignedTo?.username || "Unassigned");
        y += 5;
      });
    }

    // Project Members
    if (project.members?.length > 0) {
      addSectionHeader("Project Members");
      project.members.forEach((member, index) => {
        addRow(
          `Member ${index + 1}`,
          `${member.firstname} ${member.lastname} (@${member.username})`
        );
      });
    }

    // Footer
    doc.setFontSize(10).setTextColor(150);
    doc.text(`Generated on ${format(new Date(), "PPPpp")}`, margin, 285);

    // Save the PDF
    doc.save(`project-${project.name}-report.pdf`);
  };

  const generateNotePDF = (note) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 7;

    // Header
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(`Project Note: ${note.title}`, pageWidth / 2, 20, {
      align: "center",
    });
    doc.setLineWidth(0.5).line(margin, 25, pageWidth - margin, 25);

    let y = 35;

    const addRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      const labelLines = doc.splitTextToSize(label + ":", 40);
      doc.text(labelLines, margin, y);

      doc.setFont("helvetica", "normal");
      const valueLines = doc.splitTextToSize(value || "N/A", maxWidth - 50);

      const neededHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight;

      if (y + neededHeight > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(valueLines, margin + 50, y);
      y += neededHeight + 5;
    };

    // Note Details
    addRow("Title", note.title);
    addRow("Content", note.content);
    addRow("Created By", note.createdBy?.username || "Unknown");

    if (note.tags?.length > 0) {
      addRow("Tags", note.tags.join(", "));
    }

    // Footer
    doc.setFontSize(10).setTextColor(150);
    doc.text(`Project: ${project?.name || "N/A"}`, margin, 285);

    // Save the PDF
    doc.save(`note-${note.title}.pdf`);
  };

  const generateBacklogPDF = (backlog) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 7;

    // Header
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text(`Project Backlog: ${backlog.title}`, pageWidth / 2, 20, {
      align: "center",
    });
    doc.setLineWidth(0.5).line(margin, 25, pageWidth - margin, 25);

    let y = 35;

    const addRow = (label, value) => {
      doc.setFont("helvetica", "bold");
      const labelLines = doc.splitTextToSize(label + ":", 40);
      doc.text(labelLines, margin, y);

      doc.setFont("helvetica", "normal");
      const valueLines = doc.splitTextToSize(value || "N/A", maxWidth - 50);

      const neededHeight =
        Math.max(labelLines.length, valueLines.length) * lineHeight;

      if (y + neededHeight > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text(valueLines, margin + 50, y);
      y += neededHeight + 5;
    };

    // Backlog Details
    addRow("Title", backlog.title);
    addRow("Description", backlog.description);
    addRow("Status", backlog.status);
    addRow(
      "Due Date",
      backlog.dueDate ? format(new Date(backlog.dueDate), "PPP") : "No due date"
    );
    addRow("Assigned To", backlog.assignedTo?.username || "Unassigned");
    addRow("Created At", format(new Date(backlog.createdAt), "PPPpp"));

    // Footer
    doc.setFontSize(10).setTextColor(150);
    doc.text(`Project: ${project?.name || "N/A"}`, margin, 285);

    // Save the PDF
    doc.save(`backlog-${backlog.title}.pdf`);
  };

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
      window.location.href = "/authenticated/common/project/dashboard";
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
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                generateNotePDF(note);
              }}
              title="Download Note as PDF"
            >
              <Download className="mr-1 h-4 w-4" />
              Export Note
            </Button>
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
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                generateBacklogPDF(backlog);
              }}
              title="Download Backlog as PDF"
            >
              <Download className="mr-1 h-4 w-4" />
              Export Backlog
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    ));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-6 flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {project?.name || "Project Dashboard"}
            </h1>
            <p className="text-muted-foreground mb-2">
              {project?.description || "Loading project details..."}
            </p>
          </div>
          <div className="flex items-center gap-4 ">
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
            <Button
              variant="outline"
              onClick={generateProjectPDF}
              disabled={!project || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Project
            </Button>
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
            onClick={() => {
              window.location.href = "/authenticated/common/project/dashboard";
            }}
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
