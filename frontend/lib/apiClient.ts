/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/apiClient.ts
import { buildApiUrl } from "@/lib/backendUrls";

export interface ApiOptions extends RequestInit {
  auth?: boolean;
  raw?: boolean;
}

export async function apiClient<T = any>(
  endpoint: string,
  { auth = false, headers, raw = false, ...options }: ApiOptions = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...options,
  });

  if (raw) return res as unknown as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "API error";
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
