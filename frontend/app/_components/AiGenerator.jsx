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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from Gemini API");
      }

      const responseText = await response.text();
      const jsonResponse = responseText
        .replace("```json", "")
        .replace("```", "");
      const parsedResponse = JSON.parse(jsonResponse);

      sendDataToParent(parsedResponse.response);
      toast.success("SRS content generated successfully");
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <div className="py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                  <p>Generating SRS document...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>Click the button below to generate your SRS document.</p>
                  <Button onClick={handleGenerate} className="w-full">
                    Generate SRS
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
