import ProtectedRoute from "@/app/_components/protectedRoute";
import React from "react";

function page() {
  return (
    <ProtectedRoute roles={["pm"]}>
      <h1>PM Dashboard</h1>
    </ProtectedRoute>
  );
}

export default page;
