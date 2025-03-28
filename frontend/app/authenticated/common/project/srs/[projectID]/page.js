"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X, ArrowLeft, FileText } from "lucide-react";
import AiGenerator from "@/app/_components/AiGenerator";

function ProjectSRSPage({ params }) {
  const { projectID: projectId } = params;
  const router = useRouter();
  const { user } = useAuthStore();
  const [srsDocument, setSrsDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState([]);

  // Fetch SRS document and questions with answers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const srsRes = await customFetch(
          `/srs-documents/projects/${projectId}`
        );
        const questionsRes = await customFetch(
          `/questions/project/${projectId}`
        );
        const questionsWithAnswers = await Promise.all(
          questionsRes?.map(async (question) => {
            const answers = await customFetch(
              `/questions/${question.id}/answers`
            );
            return {
              ...question,
              answers: answers || [],
            };
          }) || []
        );

        setSrsDocument(srsRes);
        setQuestionsWithAnswers(questionsWithAnswers);
        setContent(srsRes?.content || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load SRS data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleSave = async () => {
    try {
      const response = await customFetch("/srs-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          projectId,
        }),
      });

      setSrsDocument(response);
      setEditing(false);
      toast.success("SRS Document saved successfully");
    } catch (error) {
      console.error("Error saving SRS:", error);
      toast.error("Failed to save SRS Document");
    }
  };

  const getInputPrompt = () => {
    const qaContent =
      questionsWithAnswers.length > 0
        ? `## Project Requirements Information\n\n` +
          questionsWithAnswers
            .map(
              (q) =>
                `### ${q.text}\n\n` +
                (q.answers.length > 0
                  ? q.answers.map((a) => `- ${a.text}`).join("\n") + "\n"
                  : "No answers provided yet\n")
            )
            .join("\n")
        : "No requirements information available yet\n";

    return `
    Generate a professional Software Requirements Specification document following IEEE 830 standards.
    Carefully analyze the following project information and create a comprehensive SRS document:

    ${qaContent}

    # Required SRS Document Structure

    Format the document exactly as follows using Markdown:

    # Software Requirements Specification

    ## 1. Introduction
    ### 1.1 Purpose
    [Concise paragraph explaining the document's purpose and objectives]

    ### 1.2 Document Conventions
    - **SHALL:** Mandatory requirement
    - **SHOULD:** Recommended requirement  
    - **MAY:** Optional requirement
    - \`Code formatting\` for technical terms
    - Requirements numbered as \`REQ-XXX (Priority)\`

    ### 1.3 Intended Audience
    - List all stakeholder roles
    - Describe each audience's interest

    ### 1.4 Product Scope
    [High-level description of the system and its capabilities]

    ## 2. Overall Description
    ### 2.1 Product Perspective
    [System context and environment]

    ### 2.2 Product Functions
    - Primary function 1
    - Primary function 2
    - Primary function 3

    ### 2.3 User Characteristics
    [Description of all user types]

    ### 2.4 Constraints
    - Technical constraints
    - Business constraints
    - Regulatory constraints

    ## 3. System Features
    ### 3.1 Feature: [Feature Name]
    - **Description:** [Detailed feature description]
    - **Stimulus/Response Sequences:**
      - [User action] → [System response]
    - **Functional Requirements:**
      - \`REQ-100 (High)\`: The system SHALL [requirement]
      - \`REQ-101 (Medium)\`: The system SHOULD [requirement]

    [Repeat for each major feature]

    ## 4. External Interface Requirements
    ### 4.1 User Interfaces
    [UI standards and requirements]

    ### 4.2 Hardware Interfaces
    [Hardware requirements]

    ### 4.3 Software Interfaces
    [API and integration requirements]

    ### 4.4 Communications Interfaces
    [Network protocols and standards]

    ## 5. Non-Functional Requirements
    ### 5.1 Performance Requirements
    [Response times, throughput, etc.]

    ### 5.2 Safety Requirements
    [Safety-critical aspects]

    ### 5.3 Security Requirements  
    [Authentication, data protection, etc.]

    ### 5.4 Software Quality Attributes
    [Maintainability, scalability, etc.]

    ## Output Requirements:
    - Use perfect Markdown formatting
    - Maintain consistent heading hierarchy (#, ##, ###)
    - Ensure all requirements are testable
    - Include all sections even if placeholder text is needed
    - Do not include any AI generation notes
    - Make the document ready for immediate professional use
    `;
  };

  const DialogTitle = "Generate SRS Document";
  const buttonText = "Generate with AI";

  const handleGenerateSRS = (aiResponse) => {
    setContent(aiResponse);
    toast.success("SRS document generated successfully");
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
            <h1 className="text-2xl font-bold">
              Software Requirements Specification
            </h1>
          </div>

          {srsDocument && (
            <Badge variant="outline" className="px-3 py-1">
              Version: {srsDocument.version}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading SRS Document...</div>
        ) : (
          <>
            {!srsDocument && questionsWithAnswers.length > 0 && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Generate SRS from Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      We found {questionsWithAnswers.length} questions with
                      answers that can be used to generate an initial SRS
                      document
                    </p>
                  </div>
                  <div className="fixed bottom-4 right-4">
                    <AiGenerator
                      inputPrompt={getInputPrompt()}
                      dialogTitle={DialogTitle}
                      buttonText={buttonText}
                      sendDataToParent={handleGenerateSRS}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 flex justify-end gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Check className="mr-2 h-4 w-4" />
                    Save Document
                  </Button>
                </>
              ) : (
                <>
                  {!srsDocument && questionsWithAnswers.length === 0 && (
                    <div className="fixed bottom-4 right-4">
                      <AiGenerator
                        inputPrompt={getInputPrompt()}
                        dialogTitle={DialogTitle}
                        buttonText={buttonText}
                        sendDataToParent={handleGenerateSRS}
                      />
                    </div>
                  )}
                  {content && (
                    <Button onClick={() => setEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Document
                    </Button>
                  )}
                </>
              )}
            </div>

            {editing ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Write your SRS document content here..."
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none p-6 border rounded-lg bg-white dark:bg-gray-900">
                {content ? (
                  <pre className="whitespace-pre-wrap">{content}</pre>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium">
                      No SRS Document Found
                    </h3>
                    <p className="mt-2">
                      {questionsWithAnswers.length > 0
                        ? "Generate a new SRS document using the button above"
                        : "Add some questions and answers first, or generate a basic SRS document"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default ProjectSRSPage;
