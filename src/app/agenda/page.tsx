import { redirect } from "next/navigation";
import { AgendaView } from "@/components/agenda/AgendaView";
import { userFromSupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TalkSubmission, TalkTypeId } from "@/types";

type PageProps = {
  searchParams: Promise<{
    submitted?: string;
    type?: string;
    title?: string;
    name?: string;
    team?: string;
  }>;
};

function parseSuccessSubmission(
  params: Awaited<PageProps["searchParams"]>
): TalkSubmission | null {
  if (params.submitted !== "1" || !params.type || !params.title) return null;

  const type = params.type as TalkTypeId;
  if (!["lightning", "talk", "workshop"].includes(type)) return null;

  return {
    type,
    title: params.title,
    description: "",
    submitter_name: params.name ?? "",
    team: params.team ?? "",
  };
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?error=session");
  }

  const params = await searchParams;
  const successSubmission = parseSuccessSubmission(params);

  return (
    <AgendaView
      user={userFromSupabase(user)}
      successSubmission={successSubmission}
    />
  );
}
