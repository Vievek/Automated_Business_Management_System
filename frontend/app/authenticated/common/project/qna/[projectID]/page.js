"use client";
import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import customFetch from "@/lib/fetch";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, Edit, Check, X, ArrowLeft } from "lucide-react";
import AiDialog from "@/app/_components/AiDialog";

function ProjectQnAPage({ params }) {
  const wrappedParams = use(params);
  const projectId = wrappedParams.projectID;
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Fetch questions and answers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const questionsRes = await customFetch(
          `/questions/project/${projectId}`
        );

        if (questionsRes && questionsRes.length > 0) {
          // Fetch answers for all questions in parallel
          const answersPromises = questionsRes.map((question) =>
            customFetch(`/answers/questions/${question._id}/answers`)
          );

          const answersResults = await Promise.all(answersPromises);

          // Create answers map
          const answersMap = {};
          questionsRes.forEach((question, index) => {
            answersMap[question._id] = answersResults[index] || [];
          });

          setQuestions(questionsRes);
          setAnswers(answersMap);
        } else {
          setQuestions([]);
          setAnswers({});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load Q&A data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Filter questions based on search
  const filteredQuestions = questions.filter(
    (question) =>
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answers[question._id]?.some((answer) =>
        answer.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Create new question
  const handleCreateQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await customFetch("/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newQuestion,
          project: projectId,
        }),
      });

      setQuestions([...questions, response]);
      setAnswers((prev) => ({ ...prev, [response._id]: [] }));
      setNewQuestion("");
      toast.success("Question added successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to add question");
    }
  };

  // Update question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion.content.trim()) return;

    try {
      const response = await customFetch(`/questions/${editingQuestion._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editingQuestion.content,
        }),
      });

      setQuestions(
        questions.map((q) => (q._id === editingQuestion._id ? response : q))
      );
      setEditingQuestion(null);
      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      await customFetch(`/questions/${questionId}`, {
        method: "DELETE",
      });

      setQuestions(questions.filter((q) => q._id !== questionId));
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Create new answer
  const handleCreateAnswer = async (questionId) => {
    if (!newAnswer.trim()) return;

    try {
      const response = await customFetch("/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newAnswer,
          question: questionId,
        }),
      });

      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), response],
      }));
      setNewAnswer("");
      toast.success("Answer added successfully");
    } catch (error) {
      console.error("Error creating answer:", error);
      toast.error("Failed to add answer");
    }
  };

  // Update answer
  const handleUpdateAnswer = async () => {
    if (!editingAnswer.content.trim()) return;

    try {
      const response = await customFetch(`/answers/${editingAnswer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editingAnswer.content,
        }),
      });

      setAnswers((prev) => ({
        ...prev,
        [editingAnswer.question]: prev[editingAnswer.question].map((a) =>
          a._id === editingAnswer._id ? response : a
        ),
      }));
      setEditingAnswer(null);
      toast.success("Answer updated successfully");
    } catch (error) {
      console.error("Error updating answer:", error);
      toast.error("Failed to update answer");
    }
  };

  // Delete answer
  const handleDeleteAnswer = async (answerId, questionId) => {
    try {
      await customFetch(`/answers/${answerId}`, {
        method: "DELETE",
      });

      setAnswers((prev) => ({
        ...prev,
        [questionId]: prev[questionId].filter((a) => a._id !== answerId),
      }));
      toast.success("Answer deleted successfully");
    } catch (error) {
      console.error("Error deleting answer:", error);
      toast.error("Failed to delete answer");
    }
  };

  // AI Configuration
  const InputPrompt = `
  I need you to generate a comprehensive list of questions for requirements engineering based on the project information I provide. 
  The questions should cover all aspects of requirements gathering including functional, non-functional, technical, and business requirements.
  max 40 questions

  Return the questions as a JSON array of strings. Example format:
  [
    "What are the primary objectives of this project?",
    "Who are the main stakeholders?",
    "What are the key functional requirements?",
    "What performance benchmarks need to be met?"
  ]

  Generate as many detailed, professional questions as possible. Focus on questions that will:
  1. Clarify the project scope and objectives
  2. Identify all user roles and their needs
  3. Uncover technical constraints and dependencies
  4. Reveal business rules and processes
  5. Discover potential risks and mitigation strategies
  6. Identify performance and security requirements
  7. Clarify compliance and regulatory needs
  8. Determine reporting and analytics requirements
  9. Identify integration points with other systems
  10. Clarify data requirements and flows
  `;

  const DialogTitle = "Generate Requirements Questions";
  const placeholder = "Enter project details to generate relevant questions...";

  // AI-generated questions
  const handleGenerateQuestions = async (aiResponse) => {
    try {
      // Parse AI response
      const generatedQuestions =
        typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;

      // Handle both array and object responses
      let questionsArray = [];
      if (Array.isArray(generatedQuestions)) {
        questionsArray = generatedQuestions;
      } else if (
        typeof generatedQuestions === "object" &&
        generatedQuestions !== null
      ) {
        // If response is an object, extract all values and flatten
        questionsArray = Object.values(generatedQuestions).flat();
      } else {
        throw new Error("AI response format not recognized");
      }

      // Validate we have actual questions
      if (
        !questionsArray.length ||
        !questionsArray.every((q) => typeof q === "string")
      ) {
        throw new Error("No valid questions found in AI response");
      }

      // Create questions in bulk
      const creationPromises = questionsArray.map((question) =>
        customFetch("/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: question,
            project: projectId,
          }),
        }).catch((err) => {
          console.error("Failed to create question:", question, err);
          return null; // Continue with other questions if one fails
        })
      );

      const results = await Promise.all(creationPromises);
      const successfulQuestions = results.filter((q) => q !== null);

      // Update state with new questions and initialize empty answers for them
      setQuestions((prev) => [...prev, ...successfulQuestions]);
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        successfulQuestions.forEach((q) => {
          if (q && q._id) {
            newAnswers[q._id] = [];
          }
        });
        return newAnswers;
      });

      toast.success(
        `${successfulQuestions.length} questions generated successfully`
      );
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(`Failed to generate questions: ${error.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Project Q&A</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Add new question */}
        <div className="mb-6 space-y-2">
          <Textarea
            placeholder="Ask a new question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreateQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Questions list */}
        <Accordion type="multiple" className="w-full">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? "Loading questions..." : "No questions found"}
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <AccordionItem key={question._id} value={question._id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    {editingQuestion?._id === question._id ? (
                      <Input
                        value={editingQuestion.content}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            content: e.target.value,
                          })
                        }
                        className="mr-4"
                      />
                    ) : (
                      <span className="font-medium">{question.content}</span>
                    )}
                    <div className="flex space-x-2">
                      {editingQuestion?._id === question._id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleUpdateQuestion}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingQuestion(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Answers list */}
                  <div className="space-y-4 pl-6 border-l-2 border-muted">
                    {(answers[question._id] || []).map((answer) => (
                      <div key={answer._id} className="pt-4">
                        {editingAnswer?._id === answer._id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingAnswer.content}
                              onChange={(e) =>
                                setEditingAnswer({
                                  ...editingAnswer,
                                  content: e.target.value,
                                })
                              }
                            />
                            <div className="flex space-x-2 justify-end">
                              <Button size="sm" onClick={handleUpdateAnswer}>
                                <Check className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAnswer(null)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <p>{answer.content}</p>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingAnswer(answer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteAnswer(answer._id, question._id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add new answer */}
                    <div className="pt-4 space-y-2">
                      <Textarea
                        placeholder="Write your answer..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleCreateAnswer(question._id)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Answer
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>

        <div className="fixed bottom-4 left-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Button>
        </div>

        {/* AI Generate Questions Button (shown when no questions exist) */}
        {questions.length === 0 && !loading && (
          <div className="fixed bottom-4 right-4">
            <AiDialog
              inputPrompt={InputPrompt}
              dialogTitle={DialogTitle}
              placeholder={placeholder}
              sendDataToParent={handleGenerateQuestions}
              buttonText="Generate Initial Questions"
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default ProjectQnAPage;
