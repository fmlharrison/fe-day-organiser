import { createClient } from "@/lib/supabase/server";
import type { TalkTypeId } from "@/lib/feday-data";

export type TalkSubmissionRow = {
  id: string;
  created_at: string;
  submitter_name: string;
  submitter_email: string;
  team: string;
  type: TalkTypeId;
  title: string;
  description: string;
};

// RLS scopes the organisers SELECT to the caller's own row, so a non-empty
// result means the current user is an organiser — no email argument needed.
export async function isOrganiser(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("organisers").select("email").limit(1);
  return (data?.length ?? 0) > 0;
}

export async function getMySubmissions(): Promise<TalkSubmissionRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Explicit user_id filter so organisers see only their own rows here,
  // despite the organiser-select-all RLS policy on talk_submissions.
  const { data } = await supabase
    .from("talk_submissions")
    .select("id, created_at, submitter_name, submitter_email, team, type, title, description")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as TalkSubmissionRow[];
}

// Relies on the organiser select-all RLS policy; only ever called from the
// organiser-gated admin page.
export async function getAllSubmissions(): Promise<TalkSubmissionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("talk_submissions")
    .select("id, created_at, submitter_name, submitter_email, team, type, title, description")
    .order("created_at", { ascending: false });

  return (data ?? []) as TalkSubmissionRow[];
}
