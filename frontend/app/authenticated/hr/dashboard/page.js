"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/app/_components/protectedRoute";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import customFetch from "@/lib/fetch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

function HRDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    currentStatus: "",
    workingProject: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timer);
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      let response;
      if (searchQuery) {
        // Use search endpoint if there's a search query
        response = await customFetch(
          `/users/search?query=${encodeURIComponent(searchQuery)}`
        );
      } else {
        // Use filtered endpoint if no search query
        const queryParams = new URLSearchParams();
        if (filters.role) queryParams.append("role", filters.role);
        if (filters.currentStatus)
          queryParams.append("currentStatus", filters.currentStatus);
        if (filters.workingProject)
          queryParams.append("workingProject", filters.workingProject);

        response = await customFetch(
          `/users/filtered-users?${queryParams.toString()}`
        );
      }

      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const finalValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewUser = (userId) => {
    router.push(`/authenticated/hr/employee/${userId}`);
  };

  return (
    <ProtectedRoute roles={["hr"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <Link href="/authenticated/hr/addEmployee">
            <Button>Add New Employee</Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search employees by name, email, or username..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters Section - Only show when not searching */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="Filter by role"
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="workingProject">Working Project</Label>
              <Input
                id="workingProject"
                placeholder="Filter by project"
                value={filters.workingProject}
                onChange={(e) =>
                  handleFilterChange("workingProject", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="currentStatus">Current Status</Label>
              <Select
                value={filters.currentStatus || "all"}
                onValueChange={(value) =>
                  handleFilterChange("currentStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="working on project">
                    Working on project
                  </SelectItem>
                  <SelectItem value="on bench">On bench</SelectItem>
                  <SelectItem value="chief">Chief</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {searchQuery
                      ? "No employees found matching your search"
                      : "No employees found matching your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstname} {user.lastname}
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.currentStatus === "working on project"
                            ? "bg-green-100 text-green-800"
                            : user.currentStatus === "on bench"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {user.currentStatus}
                      </span>
                    </TableCell>
                    <TableCell>{user.yearsOfExperience} years</TableCell>
                    <TableCell>${user.salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user._id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default HRDashboardPage;
