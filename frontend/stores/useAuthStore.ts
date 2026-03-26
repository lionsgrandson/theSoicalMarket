// stores/useAuthStore.ts
import { apiClient } from "@/lib/apiClient";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type NestedUser = {
  email?: string;
  [key: string]: unknown;
};

type User = {
  id?: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  brand_profile?: Record<string, unknown>;
  influencer_profile?: Record<string, unknown>;
  user?: NestedUser;
};

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;

  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  rehydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set, get) => ({
    // FIX: was reading localStorage synchronously at module init — causes SSR hydration mismatch
    // Now initialises to null; rehydrate() is called from a useEffect in AuthSessionSync
    token: null,
    refreshToken: null,
    user: null,
    loading: false,

    // FIX: added rehydrate() — call once on mount to populate state from localStorage
    rehydrate: () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      set({ token, refreshToken, user });
    },

    setToken: (token) => {
      // FIX: removed Cookies.set() — NextAuth owns the auth cookie now
      // Keeping only localStorage so apiClient can read it
      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        localStorage.removeItem("access_token");
      }
      set({ token });
    },

    setRefreshToken: (refreshToken) => {
      // FIX: removed Cookies.set() — NextAuth owns the cookie
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
      set({ refreshToken });
    },

    setUser: (user) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
      set({ user });
    },

    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      set({ token: null, refreshToken: null, user: null });
    },

    fetchUser: async () => {
      const token = get().token;
      if (!token) return;

      set({ loading: true });
      try {
        const res = await apiClient("user_service/get_user_info/", { auth: true });
        if (res?.data) {
          set({ user: res.data });
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch (err: unknown) {
        // FIX: was logging out on ANY error — network timeouts and 500s silently signed users out
        // Now only logs out on 401 Unauthorized
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          get().logout();
        }
      } finally {
        set({ loading: false });
      }
    },
  }))
);
