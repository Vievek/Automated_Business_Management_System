"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { SideNav } from "@/app/_components/SideNav";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Layout({ children }) {
  const { user, loading, fetchUser } = useAuthStore();
  const { setTheme } = useTheme();
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  // Add this useEffect to fetch user on mount
  useEffect(() => {
    if (!user) {
      fetchUser().catch(() => {
        // Handle error if needed
      });
    }
  }, [user, fetchUser]);

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

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
        <div className="absolute right-4 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
