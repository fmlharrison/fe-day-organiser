"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/user";
import {
  isEventInputValid,
  trimEventInput,
  validateEventInput,
  type EventFormResult,
  type EventFormValues,
} from "@/lib/events";
import { getAgendaItems } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";
import { isOrganiser } from "@/lib/submissions";
import { createClient } from "@/lib/supabase/server";

const UNIQUE_VIOLATION = "23505";

export async function createEvent(input: EventFormValues): Promise<EventFormResult> {
  if (!(await isOrganiser())) {
    return { ok: false, errors: {}, formError: "Only organisers can create events." };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, errors: {}, formError: "Your session expired. Please sign in again." };
  }

  const event = trimEventInput(input);
  const errors = validateEventInput(event);
  if (!isEventInputValid(errors)) {
    return { ok: false, errors };
  }

  // Load the agenda to copy before creating anything, so a failed read
  // can't leave an event behind with half an agenda.
  const agendaToCopy = input.copyAgendaFromEventId
    ? await getAgendaItems(input.copyAgendaFromEventId)
    : [];

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("events")
    .insert({
      slug: event.slug,
      title: event.title,
      tagline: event.tagline,
      event_date: event.eventDate,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    return { ok: false, errors: { slug: "Another event already uses that slug." } };
  }
  if (error || !created) {
    return { ok: false, errors: {}, formError: "Couldn't create the event. Please try again." };
  }

  if (agendaToCopy.length > 0) {
    const { error: copyError } = await supabase.from("agenda_items").insert(
      agendaToCopy.map((item) => ({
        event_id: created.id,
        start_time: item.startTime,
        end_time: item.endTime,
        kind: item.kind,
        title: item.title,
        description: item.description,
      })),
    );

    if (copyError) {
      await supabase.from("events").delete().eq("id", created.id);
      return {
        ok: false,
        errors: {},
        formError: "Couldn't copy the agenda, so the event wasn't created. Please try again.",
      };
    }
  }

  revalidatePath("/events");
  redirect(eventPath(event.slug, "admin"));
}
