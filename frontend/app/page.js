"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, fetchUser, login, loading, error } = useAuthStore();
  const router = useRouter();

  // Function to handle redirection based on role
  const redirectUser = (role) => {
    const roleRoutes = {
      pm: "/authenticated/pm/dashboard",
      hr: "/authenticated/hr/dashboard",
    };
    router.push(roleRoutes[role] || "/dashboard");
  };
  //Check if the user is already authenticated when the page loads
  // useEffect(() => {
  //   async function checkAuth() {
  //     try {
  //       const loggedInUser = await fetchUser();
  //       if (loggedInUser?.role) {
  //         redirectUser(loggedInUser.role);
  //       }
  //     } catch (error) {
  //       console.error("User not authenticated:", error);
  //     }
  //   }
  //   checkAuth();
  // }, [router, fetchUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      redirectUser(user.role);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
