"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

function AiGenerator({
  inputPrompt,
  dialogTitle,
  buttonText,
  sendDataToParent,
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(inputPrompt);

  const formatSRSResponse = (text) => {
    // Initial cleaning
    let cleanedText = text
      .replace(/```(json)?/g, "") // Remove all code block markers
      .replace(/^\s*\{.*?\}\s*$/s, "") // Remove JSON wrapper if present
      .trim();

    // Try to extract JSON content if the response is malformed
    const jsonMatch = cleanedText.match(/\{.*\}/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.response) {
          cleanedText = parsed.response;
        }
      } catch (e) {
        // If JSON parsing fails, continue with text processing
      }
    }

    // SRS-specific cleaning
    cleanedText = cleanedText
      // Remove AI-generated notes and disclaimers
      .replace(/(\*\*)?Note:(\*\*)?.*$/gim, "")
      .replace(/\(?Note:.*$/gim, "")
      .replace(/Disclaimer:.*$/gim, "")

      // Clean up requirement formatting
      .replace(/(SHALL|SHOULD|MAY)\s*:\s*/g, "$1 ")
      .replace(/`REQ-\d+\s*\((High|Medium|Low)\)`/g, "REQ-$1")

      // Remove empty sections and placeholders
      .replace(/## .*?\n\s*\[.*?\]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")

      // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\s+|\s+$/g, "")

      // Fix common markdown formatting issues
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italics
      .replace(/`(.*?)`/g, "$1") // Remove code ticks
      .replace(/^#+\s+/gm, (match) => match.trim()) // Fix heading spaces

      // Remove redundant section headers
      .replace(/## Output Requirements:.*$/gim, "");

    return cleanedText;
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputPrompt,
          format:
            "Return only the SRS content in clean markdown format without any additional commentary, notes, or disclaimers.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from Gemini API");
        console.log(response);
      }

      const responseText = await response.text();
      const formattedResponse = formatSRSResponse(responseText);
      console.log(formattedResponse);

      sendDataToParent(formattedResponse);
      toast.success(" document generated successfully");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error generating SRS:", error);
      toast.error("Failed to generate SRS content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpenDialog(true)}>{buttonText}</Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
            <div className="py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Generating professional SRS document...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    This will generate a clean, formatted document.
                  </p>
                  <Button onClick={handleGenerate} className="w-full" size="lg">
                    Generate Professional
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AiGenerator;
