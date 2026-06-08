import { redirect } from "next/navigation";
import { TalkFormView } from "@/components/pitch/TalkFormView";
import { userFromSupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TalkTypeId } from "@/types";

type PageProps = {
  searchParams: Promise<{ type?: string }>;
};

function parseInitialType(type?: string): TalkTypeId | undefined {
  if (type && ["lightning", "talk", "workshop"].includes(type)) {
    return type as TalkTypeId;
  }
  return undefined;
}

export default async function PitchPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?error=session");
  }

  const params = await searchParams;

  return (
    <TalkFormView
      user={userFromSupabase(user)}
      initialType={parseInitialType(params.type)}
    />
  );
}
