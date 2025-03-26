"use client";
import React, { useState, useEffect } from "react";
import { use } from "react";
import ProtectedRoute from "@/app/_components/protectedRoute";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import customFetch from "@/lib/fetch";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await customFetch(
          `/users/users/${unwrappedParams.userID}`
        );
        setUser(response);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to fetch employee details", {
          description: error.message || "Please try again later",
        });
        router.push("/authenticated/hr/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [unwrappedParams.userId, router]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await customFetch(`/users/users/${user._id}`, {
        method: "DELETE",
      });

      toast.success("Employee deleted successfully");
      router.push("/authenticated/hr/dashboard");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete employee", {
        description: error.message || "Please try again later",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={["hr"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Loading Employee Details...</h1>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user) {
    return (
      <ProtectedRoute roles={["hr"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Employee Not Found</h1>
          </div>
          <p>No employee found with the specified ID.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={["hr"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Employee Details</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {user.firstname} {user.lastname}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user.username} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={user.phone} readOnly />
              </div>
              <div className="space-y-2">
                <Label>NIC Number</Label>
                <Input value={user.nicNo} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div>
                  <Badge
                    variant={
                      user.currentStatus === "working on project"
                        ? "default"
                        : user.currentStatus === "on bench"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      user.currentStatus === "working on project"
                        ? "bg-green-100 text-green-800"
                        : user.currentStatus === "on bench"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-purple-100 text-purple-800"
                    }
                  >
                    {user.currentStatus}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input value={`${user.yearsOfExperience} years`} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input value={`$${user.salary.toLocaleString()}`} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 flex-wrap">
          <Button
            variant="outline"
            onClick={() => router.push("/authenticated/hr/dashboard")}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Employee
              </>
            )}
          </Button>
          <Button
            onClick={() =>
              router.push(`/authenticated/hr/editEmployee/${user._id}`)
            }
          >
            Edit Employee
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
