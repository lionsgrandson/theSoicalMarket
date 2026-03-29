"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Session } from "next-auth";

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  refresh_token?: string;
}

export default function AuthSessionSync() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  const { setToken, setRefreshToken, setUser, token: zustandToken, rehydrate, logout } =
    useAuthStore();

  // Rehydrate Zustand from localStorage on first mount
  // This prevents the brief flash of "logged out" state on page load
  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.accessToken) {
      // Only update if token changed — prevents unnecessary re-renders
      if (session.accessToken !== zustandToken) {
        setToken(session.accessToken);
        const rt = session.refreshToken ?? session.refresh_token;
        if (rt) setRefreshToken(rt);
        if (session.user) setUser(session.user as Parameters<typeof setUser>[0]);
      }
    }

    if (status === "unauthenticated" && zustandToken) {
      // Don't clear tokens on auth pages — signup and verification flows use them
      const isAuthRoute =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/auth");
      if (!isAuthRoute) {
        // FIX: this block was previously active but all console.logs have been removed
        logout();
      }
    }
  }, [session, status, setToken, setRefreshToken, setUser, zustandToken, logout, rehydrate]);

  return null;
}
