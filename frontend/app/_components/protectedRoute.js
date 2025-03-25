"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, fetchUser, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = user || (await fetchUser());

        if (!currentUser) {
          router.push("/");
        } else if (roles.length > 0 && !roles.includes(currentUser.role)) {
          router.push("/unauthorized"); // Redirect if role doesn't match
        }
      } catch (error) {
        router.push("/");
      }
    };

    checkAuth();
  }, [user, router, fetchUser, roles]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <div>Unauthorized</div>; // Or redirect immediately
  }

  return children;
};

export default ProtectedRoute;
