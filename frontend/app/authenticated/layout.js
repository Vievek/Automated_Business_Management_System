"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { SideNav } from "@/app/_components/SideNav";

function Layout({ children }) {
  const { user } = useAuthStore();
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  if (!user) {
    return <div>Please log in to access this page</div>;
  }

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Header with menu button */}
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSideNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-4 font-medium">
            {user.role === "pm"
              ? "Project Manager"
              : user.role === "hr"
              ? "HR Manager"
              : user.role === "cfo"
              ? "CFO"
              : "Worker"}{" "}
            Dashboard
          </div>
        </div>
      </header>
      {/* Side Navigation */}
      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      {/* Overlay when side nav is open */}
      {isSideNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsSideNavOpen(false)}
        />
      )}
      {/* Main Content */}
      <main className="flex-1 self-center flex flex-col items-center  container py-4 w-full">
        <div className="w-full max-w-4xl px-4">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
