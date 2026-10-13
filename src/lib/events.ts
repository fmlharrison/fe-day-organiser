import type { AgendaKind } from "@/lib/feday-data";

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  /** ISO date, YYYY-MM-DD. */
  eventDate: string;
  /** HH:MM, 24-hour. */
  startTime: string;
  endTime: string;
  location: string;
};

export type AgendaItem = {
  id: string;
  startTime: string;
  endTime: string;
  kind: AgendaKind;
  title: string;
  description: string;
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dateParts(event: EventRecord): { year: string; month: string; day: number } {
  const [year, month, day] = event.eventDate.split("-");
  return { year, month: MONTHS[Number(month) - 1], day: Number(day) };
}

export function formatEventDateShort(event: EventRecord): string {
  const { month, day } = dateParts(event);
  return `${month} ${day}`;
}

export function formatEventTimeRange(event: EventRecord): string {
  return `${event.startTime}-${event.endTime}`;
}

// There can be several FE Days a year, so events are labelled by month + year.
export function eventEdition(event: EventRecord): string {
  const { year, month } = dateParts(event);
  return `${month} ${year}`;
}

export function eventBrand(event: EventRecord): string {
  const { year, month } = dateParts(event);
  return `${event.title} ${month} ’${year.slice(-2)}`;
}

export function todayInLondon(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, matching the events.event_date column.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
