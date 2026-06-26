"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? "http://localhost:3002/app/api/auth"
      : `${window.location.origin}/app/api/auth`,
});
