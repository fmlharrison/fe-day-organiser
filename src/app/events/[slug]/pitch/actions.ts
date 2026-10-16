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
import { getAgendaAssignments, isPitchingClosed } from "@/lib/agenda";
import { getAgendaItems, getEventBySlug } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";
import { isEventPast, todayInLondon } from "@/lib/events";

export async function submitTalk(
  eventSlug: string,
  input: TalkSubmissionInput,
): Promise<SubmitResult> {
  const errors = validateSubmission(input);
  if (!isValid(errors)) {
    return { ok: false, errors };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, errors: {}, formError: "Your session expired. Please sign in again." };
  }

  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return { ok: false, errors: {}, formError: "That event doesn't exist." };
  }

  const isPast = isEventPast(event, todayInLondon());
  if (isPast) {
    return { ok: false, errors: {}, formError: "This event has wrapped — pitching is closed." };
  }

  const [items, assignments] = await Promise.all([
    getAgendaItems(event.id),
    getAgendaAssignments(event.id),
  ]);
  if (isPitchingClosed({ isPast, items, assignmentsBySlot: assignments })) {
    return {
      ok: false,
      errors: {},
      formError: "All talk slots are filled — pitching is closed.",
    };
  }

  const supabase = await createClient();
  // submitter_email and user_id come from the session, never the form input.
  const { error } = await supabase.from("talk_submissions").insert({
    event_id: event.id,
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

  revalidatePath(eventPath(event.slug), "layout");

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
