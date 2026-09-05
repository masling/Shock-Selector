import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAuthConfig, isAuthConfigured } from "@/lib/auth/config";
import { isVerifiedEmailUser } from "@/lib/auth/identity";

export { isAuthConfigured };

export async function createAuthClient() {
  const authConfig = getAuthConfig();

  if (!authConfig) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    authConfig.url,
    authConfig.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies. Middleware/Route Handlers
            // refresh the session and persist cookie updates.
          }
        },
      },
    },
  );
}

export async function getVerifiedUser() {
  const authClient = await createAuthClient();

  if (!authClient) {
    return null;
  }

  const { data, error } = await authClient.auth.getUser();

  if (error || !isVerifiedEmailUser(data.user)) {
    return null;
  }

  return data.user;
}
