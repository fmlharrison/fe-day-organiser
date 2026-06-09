import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/auth/domain";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export function deriveDisplayName(
  email: string,
  metadata: { full_name?: unknown; name?: unknown } | null | undefined,
): string {
  const fullName = typeof metadata?.full_name === "string" ? metadata.full_name : undefined;
  const name = typeof metadata?.name === "string" ? metadata.name : undefined;
  const localPart = email.split("@")[0] || undefined;
  return fullName ?? name ?? localPart ?? "Player";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedEmail(user.email)) {
    return null;
  }

  const email = user.email!;
  return {
    id: user.id,
    email,
    name: deriveDisplayName(email, user.user_metadata),
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  return user;
}
