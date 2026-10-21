"use server";

import { revalidatePath } from "next/cache";
import { getAgendaAssignments } from "@/lib/agenda";
import {
  isAgendaItemInputValid,
  isEventInputValid,
  trimAgendaItemInput,
  trimEventInput,
  validateAgendaItemInput,
  validateEventInput,
  type AgendaItemInput,
  type AgendaItemResult,
  type EventFormResult,
  type EventInput,
  type EventRecord,
} from "@/lib/events";
import { getAgendaItems, getEventBySlug } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";
import { isOrganiser } from "@/lib/submissions";
import { createClient } from "@/lib/supabase/server";

const FOREIGN_KEY_VIOLATION = "23503";

type OrganiserEvent = { event: EventRecord } | { formError: string };

async function loadEventForOrganiser(eventSlug: string): Promise<OrganiserEvent> {
  if (!(await isOrganiser())) {
    return { formError: "Only organisers can edit events." };
  }
  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return { formError: "That event doesn't exist." };
  }
  return { event };
}

function toAgendaItemRow(input: AgendaItemInput) {
  return {
    start_time: input.startTime,
    end_time: input.endTime,
    kind: input.kind,
    title: input.title,
    description: input.description,
  };
}

export async function updateEvent(eventSlug: string, input: EventInput): Promise<EventFormResult> {
  const loaded = await loadEventForOrganiser(eventSlug);
  if ("formError" in loaded) return { ok: false, errors: {}, formError: loaded.formError };
  const { event } = loaded;

  // The slug is part of every link to the event, so it never changes here.
  const details = { ...trimEventInput(input), slug: event.slug };
  const errors = validateEventInput(details);
  if (!isEventInputValid(errors)) {
    return { ok: false, errors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      title: details.title,
      tagline: details.tagline,
      event_date: details.eventDate,
      start_time: details.startTime,
      end_time: details.endTime,
      location: details.location,
    })
    .eq("id", event.id);

  if (error) {
    return { ok: false, errors: {}, formError: "Couldn't save the event. Please try again." };
  }

  revalidatePath("/events");
  revalidatePath(eventPath(event.slug), "layout");
  return { ok: true };
}

export async function addAgendaItem(
  eventSlug: string,
  input: AgendaItemInput,
): Promise<AgendaItemResult> {
  const loaded = await loadEventForOrganiser(eventSlug);
  if ("formError" in loaded) return { ok: false, errors: {}, formError: loaded.formError };
  const { event } = loaded;

  const item = trimAgendaItemInput(input);
  const errors = validateAgendaItemInput(item);
  if (!isAgendaItemInputValid(errors)) {
    return { ok: false, errors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_items")
    .insert({ event_id: event.id, ...toAgendaItemRow(item) });

  if (error) {
    return { ok: false, errors: {}, formError: "Couldn't add the agenda item. Please try again." };
  }

  revalidatePath(eventPath(event.slug), "layout");
  return { ok: true };
}

export async function updateAgendaItem(
  eventSlug: string,
  itemId: string,
  input: AgendaItemInput,
): Promise<AgendaItemResult> {
  const loaded = await loadEventForOrganiser(eventSlug);
  if ("formError" in loaded) return { ok: false, errors: {}, formError: loaded.formError };
  const { event } = loaded;

  const item = trimAgendaItemInput(input);
  const errors = validateAgendaItemInput(item);
  if (!isAgendaItemInputValid(errors)) {
    return { ok: false, errors };
  }

  const [items, assignments] = await Promise.all([
    getAgendaItems(event.id),
    getAgendaAssignments(event.id),
  ]);
  const existing = items.find((candidate) => candidate.id === itemId);
  if (!existing) {
    return { ok: false, errors: {}, formError: "That agenda item no longer exists." };
  }
  // The assigned talk's type has to keep matching its slot.
  if (assignments[itemId] && existing.kind !== item.kind) {
    return {
      ok: false,
      errors: { kind: "A talk is assigned to this slot. Unassign it before changing the type." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_items")
    .update(toAgendaItemRow(item))
    .eq("id", itemId)
    .eq("event_id", event.id);

  if (error) {
    return { ok: false, errors: {}, formError: "Couldn't save the agenda item. Please try again." };
  }

  revalidatePath(eventPath(event.slug), "layout");
  return { ok: true };
}

export async function deleteAgendaItem(eventSlug: string, itemId: string): Promise<AgendaItemResult> {
  const loaded = await loadEventForOrganiser(eventSlug);
  if ("formError" in loaded) return { ok: false, errors: {}, formError: loaded.formError };
  const { event } = loaded;

  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_items")
    .delete()
    .eq("id", itemId)
    .eq("event_id", event.id);

  // agenda_assignments restricts deleting a slot that has a talk in it.
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return { ok: false, errors: {}, formError: "A talk is assigned to this slot. Unassign the talk first." };
  }
  if (error) {
    return { ok: false, errors: {}, formError: "Couldn't delete the agenda item. Please try again." };
  }

  revalidatePath(eventPath(event.slug), "layout");
  return { ok: true };
}
