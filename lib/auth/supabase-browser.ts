"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getAuthConfig } from "@/lib/auth/config";

export function createBrowserAuthClient() {
  const authConfig = getAuthConfig();

  if (!authConfig) {
    return null;
  }

  return createBrowserClient(authConfig.url, authConfig.publishableKey);
}
