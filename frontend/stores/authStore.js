import { create } from "zustand";
import customFetch from "@/lib/fetch";

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await customFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const userData = await customFetch(`/users/profile`);
      if (!userData || !userData._id) {
        throw new Error("Failed to load user profile");
      }
      set({ user: userData, loading: false });
      return userData;
    } catch (error) {
      set({ error: error.message || "Login failed", loading: false });
      throw error;
    }
  },

  logout: async () => {
    await customFetch("/users/logout", { method: "POST" });
    set({ user: null });
  },

  fetchUser: async () => {
    set({ loading: true });
    try {
      const userData = await customFetch("/users/profile");
      if (!userData) throw new Error("Failed to fetch user data");

      const userWithProjects = {
        ...userData,
        projects: userData.projects || [],
      };

      set({ user: userWithProjects, loading: false });
      return userWithProjects;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  refreshUserProjects: async () => {
    try {
      const userData = await customFetch("/users/profile");
      if (!userData) return;

      set((state) => ({
        user: {
          ...state.user,
          projects: userData.projects || [],
        },
      }));
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  },
}));

export default useAuthStore;
