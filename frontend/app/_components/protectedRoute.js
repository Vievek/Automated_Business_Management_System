"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, fetchUser, loading } = useAuthStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true); // Prevents extra re-renders

  useEffect(() => {
    console.log("in protected routes ", user);
    const checkAuth = async () => {
      if (!user) {
        await fetchUser(); // Fetch only if user is null
      }
      setCheckingAuth(false); // Mark authentication check as complete
    };

    checkAuth();
  }, []); // Run only on mount

  useEffect(() => {
    if (!checkingAuth) {
      if (!user) {
        router.push("/");
      } else if (roles.length > 0 && !roles.includes(user.role)) {
        router.push("/unauthorized");
      }
    }
  }, [user, router, roles, checkingAuth]);

  if (loading || checkingAuth) {
    return <div>Loading...</div>;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <div>Unauthorized</div>; // Fallback in case redirect didn't happen
  }

  return children;
};

export default ProtectedRoute;
