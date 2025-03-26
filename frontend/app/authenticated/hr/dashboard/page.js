import ProtectedRoute from "@/app/_components/protectedRoute";
import React from "react";

function page() {
  return (
    <ProtectedRoute roles={["hr"]}>
      <h1>HR Dashboard</h1>
    </ProtectedRoute>
  );
}

export default page;
