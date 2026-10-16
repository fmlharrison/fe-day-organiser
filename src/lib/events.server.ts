import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayInLondon, type AgendaItem, type EventRecord } from "@/lib/events";
import type { AgendaKind } from "@/lib/feday-data";

const EVENT_COLUMNS = "id, slug, title, tagline, event_date, start_time, end_time, location";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
};

type AgendaItemRow = {
  id: string;
  start_time: string;
  end_time: string;
  kind: AgendaKind;
  title: string;
  description: string;
};

// Postgres `time` columns come back as HH:MM:SS.
function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    eventDate: row.event_date,
    startTime: toHourMinute(row.start_time),
    endTime: toHourMinute(row.end_time),
    location: row.location,
  };
}

function mapAgendaItemRow(row: AgendaItemRow): AgendaItem {
  return {
    id: row.id,
    startTime: toHourMinute(row.start_time),
    endTime: toHourMinute(row.end_time),
    kind: row.kind,
    title: row.title,
    description: row.description,
  };
}

/** The next event on or after today (London time), otherwise the most recent past one. */
export const getCurrentEvent = cache(async (): Promise<EventRecord | null> => {
  const supabase = await createClient();
  const today = todayInLondon();

  const upcoming = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (upcoming.error) throw upcoming.error;
  if (upcoming.data) return mapEventRow(upcoming.data as EventRow);

  const latest = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .lt("event_date", today)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest.error) throw latest.error;
  return latest.data ? mapEventRow(latest.data as EventRow) : null;
});

export const getEventBySlug = cache(async (slug: string): Promise<EventRecord | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEventRow(data as EventRow) : null;
});

export async function requireEvent(slug: string): Promise<EventRecord> {
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return event;
}

export async function listEvents(): Promise<EventRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .order("event_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapEventRow(row as EventRow));
}

export async function requireCurrentEvent(): Promise<EventRecord> {
  const event = await getCurrentEvent();
  if (!event) notFound();
  return event;
}

export const getAgendaItems = cache(async (eventId: string): Promise<AgendaItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agenda_items")
    .select("id, start_time, end_time, kind, title, description")
    .eq("event_id", eventId)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapAgendaItemRow(row as AgendaItemRow));
});
