"use client";
import React from "react";
import useAuthStore from "@/stores/authStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/app/_components/protectedRoute";

// Define authorized roles who can create new projects
const AUTHORIZED_ROLES = ["ceo", "cfo", "hr", "team lead", "pm"];

function ProjectsPage() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        try {
          await fetchUser();
          console.log("User data:", user);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
      // Check if user has authorized role after user data is loaded
      if (user && user.role) {
        setIsAuthorized(AUTHORIZED_ROLES.includes(user.role));
      }
      setLoading(false);
    };

    loadUser();
  }, [user, fetchUser]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            {isAuthorized && <Skeleton className="h-10 w-32" />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={`skeleton-${i}`}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground">
              Select a project to view its dashboard
            </p>
          </div>
          {isAuthorized && (
            <Link href="/authenticated/common/project/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>

        {!user?.projects || user.projects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No projects found</h2>
            <p className="text-muted-foreground mb-6">
              {isAuthorized
                ? "You haven't created any projects yet"
                : "You haven't been added to any projects yet"}
            </p>
            {isAuthorized && (
              <Link href="/authenticated/common/project/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.projects.map((project) => (
              <Card
                key={project._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {project.members?.length || 0} members
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created:{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/authenticated/common/project/projectpage/${project._id}`}
                    >
                      <Button variant="outline">View Project</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default ProjectsPage;
