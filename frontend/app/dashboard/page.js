"use client";
import React from "react";
import AiDialog from "@/app/_components/AiDialog";
import { useState } from "react";
import ProtectedRoute from "../_components/protectedRoute";

function page() {
  const InputPrompt = "give me a paragraph about";
  const DialogTitle = "Prompt to get response";
  const placeholder = "Enter your prompt here";

  const [childData, setChildData] = useState(""); // State in Parent

  // Callback function to receive data from child
  const handleChildData = (data) => {
    setChildData(data);
  };

  return (
    <ProtectedRoute>
      <h1>home</h1>
      <div className="absolute bottom-4 right-4">
        <AiDialog
          inputPrompt={InputPrompt}
          dialogTitle={DialogTitle}
          placeholder={placeholder}
          sendDataToParent={handleChildData}
        />
      </div>

      <div className="mt-4">
        <p>{childData}</p>
      </div>
    </ProtectedRoute>
  );
}

export default page;
