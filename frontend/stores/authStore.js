// stores/authStore.js
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

      // Fetch user profile after successful login
      const userData = await customFetch(`/users/profile`, {
        method: "GET",
      });
      console.log(userData);
      if (!userData || !userData._id) {
        console.log("Failed to load user profile");
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
      set({ user: userData, loading: false });
      return userData;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
