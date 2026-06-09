"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/user";
import {
  isValid,
  validateSubmission,
  type SubmitResult,
  type TalkSubmissionInput,
} from "@/lib/validation";
import type { TalkTypeId } from "@/lib/feday-data";

export async function submitTalk(input: TalkSubmissionInput): Promise<SubmitResult> {
  const errors = validateSubmission(input);
  if (!isValid(errors)) {
    return { ok: false, errors };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, errors: {}, formError: "Your session expired. Please sign in again." };
  }

  const supabase = await createClient();
  // submitter_email and user_id come from the session, never the form input.
  const { error } = await supabase.from("talk_submissions").insert({
    user_id: user.id,
    submitter_name: input.name.trim(),
    submitter_email: user.email,
    team: input.team.trim(),
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
  });

  if (error) {
    return { ok: false, errors: {}, formError: "Couldn't save your pitch. Please try again." };
  }

  revalidatePath("/my-pitches");

  return {
    ok: true,
    submission: {
      type: input.type as TalkTypeId,
      title: input.title.trim(),
      name: input.name.trim(),
      team: input.team.trim(),
    },
  };
}
