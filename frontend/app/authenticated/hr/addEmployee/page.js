"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import customFetch from "@/lib/fetch";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/app/_components/protectedRoute";

function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    salary: "",
    yearsOfExperience: "",
    nicNo: "",
    currentStatus: "on bench",
    role: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await customFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
          yearsOfExperience: Number(formData.yearsOfExperience),
        }),
      });

      toast("success", {
        description: "Employee registered successfully",
      });
      setTimeout(() => {
        router.push("/authenticated/hr/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", error.data);

      let errorMessage = error.message;
      if (error.data?.errors) {
        // Handle validation errors from server
        errorMessage = Object.values(error.data.errors)
          .map((err) => err.message || err)
          .join(", ");
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      toast("Error", {
        description: "Failed to register employee" || errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
          <CardDescription>
            Fill in the details to register a new employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstname">First Name *</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  placeholder="Enter first name"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastname">Last Name *</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  placeholder="Enter last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="nicNo">NIC Number *</Label>
                <Input
                  id="nicNo"
                  name="nicNo"
                  placeholder="Enter NIC number"
                  value={formData.nicNo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Professional Information */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="Enter role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="salary">Salary *</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  placeholder="Enter salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  placeholder="Enter years of experience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="currentStatus">Current Status</Label>
                <Select
                  value={formData.currentStatus}
                  onValueChange={(value) =>
                    handleSelectChange(value, "currentStatus")
                  }
                >
                  <SelectTrigger id="currentStatus">
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
                onClick={() => router.push("/authenticated/hr/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  "Register Employee"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ProtectedRoute>
  );
}

export default AddEmployeePage;
