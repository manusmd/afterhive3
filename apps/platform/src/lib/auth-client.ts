"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? "http://localhost:3001/platform/api/auth"
      : `${window.location.origin}/platform/api/auth`,
});
