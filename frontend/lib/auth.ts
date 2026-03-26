import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/useAuthStore";

export async function signup(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  signup_method?: string;
  signed_up_as?: string;
  state?: string;
}) {
  return apiClient("user_service/signup/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return apiClient("user_service/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return apiClient("user_service/forgot-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}) {
  return apiClient("user_service/reset-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: { token: string }) {
  return apiClient("user_service/verify-email/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// convenience after login/signup: store token + user
interface SignupResponse {
  status: string;
  code: number;
  data: {
    Message: string;
    refresh_token: string;
    access_token: string;
    user?: Record<string, unknown>; // Add proper user type if returned
  };
  error: Record<string, unknown>;
  meta: {
    timestamp: string;
  };
}

export function setAuthFromResponse(res: SignupResponse) {
  const store = useAuthStore.getState();

  if (res?.data?.access_token) {
    console.log("🔐 Setting access token:", res.data.access_token.substring(0, 20) + "...");
    store.setToken(res.data.access_token);
  }

  if (res?.data?.refresh_token) {
    console.log("🔄 Setting refresh token:", res.data.refresh_token.substring(0, 20) + "...");
    store.setRefreshToken(res.data.refresh_token);
  }

  if (res?.data?.user) {
    console.log("👤 Setting user:", res.data.user);
    store.setUser(res.data.user);
  }

  // Verify token was saved
  const savedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  console.log("✅ Token saved in localStorage:", savedToken ? "YES" : "NO");
}
