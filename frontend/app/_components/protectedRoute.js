"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, fetchUser, loading } = useAuthStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user, fetchUser]);

  useEffect(() => {
    if (!checkingAuth && !loading) {
      if (!user) {
        router.push("/");
      } else if (roles.length > 0 && !roles.includes(user.role)) {
        router.push("/unauthorized");
      }
    }
  }, [user, router, roles, checkingAuth, loading]);

  if (loading || checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
