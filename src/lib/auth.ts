import { CLEO_EMAIL_DOMAIN } from "@/lib/data/fe-day";
import type { AppUser } from "@/types";
import type { User } from "@supabase/supabase-js";

export function isCleoEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${CLEO_EMAIL_DOMAIN}`);
}

export function userFromSupabase(user: User): AppUser {
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Player";

  return {
    name,
    email: user.email ?? "",
  };
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  domain:
    "Only @meetcleo.com Google accounts can enter. Sign in with your Cleo email.",
  session: "Your session expired. Please sign in again.",
};
