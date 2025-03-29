"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Briefcase,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/authStore";
import ProtectedRoute from "@/app/_components/protectedRoute";

function WorkerDashboard() {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Format the date for display
  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Card */}
          <div className="w-full md:w-1/3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user.firstname.charAt(0)}
                    {user.lastname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {user.firstname} {user.lastname}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                  <Badge variant="secondary" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>NIC: {user.nicNo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since: {formattedDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Status
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge
                    variant={
                      user.currentStatus === "on bench"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {user.currentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span>{user.yearsOfExperience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {user.salary.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline">
                  <Link href="/authenticated/common/issues/issuepage">
                    Report an Issue
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/authenticated/common/task/taskpage">
                    View Tasks
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/authenticated/common/project/dashboard">
                    Project Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent actions and updates
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {user.tasks && user.tasks.length > 0 ? (
                    user.tasks.slice(0, 3).map((task, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>
                  Projects you're currently working on
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {user.projects && user.projects.length > 0 ? (
                  <div className="grid gap-4">
                    {user.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active projects</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default WorkerDashboard;
