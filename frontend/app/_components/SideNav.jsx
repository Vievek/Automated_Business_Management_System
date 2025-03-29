"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  ClipboardList,
  AlertCircle,
  Briefcase,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import useAuthStore from "@/stores/authStore";
import { useRouter } from "next/navigation";

export function SideNav({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  // Determine the role-based path
  let rolePath = "workers";
  if (user.role === "pm" || user.role === "hr" || user.role === "cfo") {
    rolePath = user.role;
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header with user info */}
        <div className="flex items-center gap-3 p-4">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>
              {user.firstname?.charAt(0)}
              {user.lastname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Hi, {user.firstname}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <Separator className="my-2" />
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 mt-4">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start"
            onClick={onClose}
          >
            <Link
              href={`/authenticated/${rolePath}/dashboard`}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start"
            onClick={onClose}
          >
            <Link
              href="/authenticated/common/issues/issuepage"
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Issues
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start"
            onClick={onClose}
          >
            <Link
              href="/authenticated/common/task/taskpage"
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Tasks
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start"
            onClick={onClose}
          >
            <Link
              href="/authenticated/common/project/dashboard"
              className="flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Projects
            </Link>
          </Button>
        </nav>
        <Separator className="my-2" />
        {/* Logout Button */}
        <div className="mt-auto p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              logout();
              router.push("/");
              onClose();
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
