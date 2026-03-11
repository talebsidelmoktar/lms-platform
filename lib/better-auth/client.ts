"use client";

import { createAuthClient } from "better-auth/client";
import { phoneNumberClient } from "better-auth/client/plugins";

const createClient = () =>
  createAuthClient({
    baseURL: new URL("/api/auth", window.location.origin).toString(),
    plugins: [phoneNumberClient()],
  });

export type BetterAuthClient = ReturnType<typeof createClient>;

let cachedClient: BetterAuthClient | null = null;

export function getAuthClient() {
  if (cachedClient) return cachedClient;

  if (typeof window === "undefined") {
    throw new Error("Better Auth client can only be initialized in the browser.");
  }

  cachedClient = createClient();

  return cachedClient;
}
