"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, fetchUser, login, loading, error } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle redirection based on role
  const redirectUser = (role) => {
    const roleRoutes = {
      pm: "/authenticated/common/project/dashboard",
      hr: "/authenticated/hr/dashboard",
      cfo: "/authenticated/cfo/dashboard",
    };
    router.push(roleRoutes[role] || "/authenticated/workers/dashboard");
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10" // Space for icon
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
