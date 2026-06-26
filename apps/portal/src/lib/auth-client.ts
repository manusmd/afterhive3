"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? "http://localhost:3003/portal/api/auth"
      : `${window.location.origin}/portal/api/auth`,
});
