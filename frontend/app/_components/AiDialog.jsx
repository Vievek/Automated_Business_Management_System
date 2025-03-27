"use client";
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";

function AiDialog({ inputPrompt, dialogTitle, placeholder, sendDataToParent }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    console.log(textareaRef.current.value);

    const InputPrompt = inputPrompt + textareaRef.current.value + "";
    console.log(InputPrompt);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: InputPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from Gemini API");
      }
      const responseText = await response.text();
      const MockJsonResponse = responseText
        .replace("```json", "")
        .replace("```", "");
      console.log(JSON.parse(MockJsonResponse));
      // const data = await response.json();
      // setGeminiResponse(data.response);
      const responseJson = JSON.parse(MockJsonResponse);
      setGeminiResponse(responseJson.response);
      sendDataToParent(responseJson.response);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      setGeminiResponse("Error fetching response.");
    }
    setLoading(false);
    setOpenDialog(false);
  };

  return (
    <>
      <Button onClick={() => setOpenDialog(true)}>Prompt</Button>
      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder={placeholder}
                className="my-4"
                ref={textareaRef}
                required
              />
              <section className="flex justify-end gap-2">
                <Button
                  onClick={() => setOpenDialog(false)}
                  variant={"outline"}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Generating from AI
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </section>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AiDialog;
