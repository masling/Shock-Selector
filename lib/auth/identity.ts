import type { User } from "@supabase/supabase-js";

type AuthUserLike = Pick<User, "email" | "email_confirmed_at" | "is_anonymous">;

export function isVerifiedEmailUser(user: AuthUserLike | null | undefined): user is User {
  return Boolean(
    user &&
      user.email &&
      !user.is_anonymous &&
      user.email_confirmed_at,
  );
}
