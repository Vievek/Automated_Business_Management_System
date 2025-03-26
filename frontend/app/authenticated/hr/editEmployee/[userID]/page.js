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
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditEmployeePage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    salary: "",
    yearsOfExperience: "",
    nicNo: "",
    currentStatus: "",
    role: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await customFetch(
          `/users/users/${unwrappedParams.userID}`
        );
        setUser(response);
        setFormData({
          username: response.username,
          firstname: response.firstname,
          lastname: response.lastname,
          phone: response.phone,
          email: response.email,
          salary: response.salary.toString(),
          yearsOfExperience: response.yearsOfExperience.toString(),
          nicNo: response.nicNo,
          currentStatus: response.currentStatus,
          role: response.role,
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await customFetch(`/users/users/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
          yearsOfExperience: Number(formData.yearsOfExperience),
        }),
      });

      toast.success("Employee updated successfully");
      router.push(`/authenticated/hr/employee/${user._id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update employee", {
        description: error.message || "Please try again later",
      });
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold">Edit Employee</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              Edit {user.firstname} {user.lastname}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstname">First Name</Label>
                  <Input
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">Last Name</Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nicNo">NIC Number</Label>
                  <Input
                    id="nicNo"
                    name="nicNo"
                    value={formData.nicNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStatus">Current Status</Label>
                  <Select
                    value={formData.currentStatus}
                    onValueChange={(value) =>
                      handleSelectChange(value, "currentStatus")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working on project">
                        Working on project
                      </SelectItem>
                      <SelectItem value="on bench">On bench</SelectItem>
                      <SelectItem value="chief">Chief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/authenticated/hr/employee/${user._id}`)
                  }
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
