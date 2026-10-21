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

export function eventDocumentTitle(event: EventRecord): string {
  return `${event.title} ${eventEdition(event)} · Pitch a Talk`;
}

export function isEventPast(event: EventRecord, today: string): boolean {
  return event.eventDate < today;
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

export type EventInput = {
  slug: string;
  title: string;
  tagline: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type EventValidationErrors = Partial<Record<keyof EventInput, string>>;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
// Static routes under /events that an event slug would shadow.
const RESERVED_SLUGS = new Set(["new"]);

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function trimEventInput(input: EventInput): EventInput {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    tagline: input.tagline.trim(),
    eventDate: input.eventDate.trim(),
    startTime: input.startTime.trim(),
    endTime: input.endTime.trim(),
    location: input.location.trim(),
  };
}

// Mirrors the check constraints on public.events (migration 0006).
export function validateEventInput(input: EventInput): EventValidationErrors {
  const errors: EventValidationErrors = {};

  if (!input.slug) {
    errors.slug = "Give the event a URL slug.";
  } else if (input.slug.length > 40 || !SLUG_PATTERN.test(input.slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens, e.g. december-2026.";
  } else if (RESERVED_SLUGS.has(input.slug)) {
    errors.slug = "That slug is reserved. Pick another.";
  }

  if (!input.title) {
    errors.title = "Give the event a title.";
  } else if (input.title.length > 40) {
    errors.title = "Keep the title under 40 characters.";
  }

  if (input.tagline.length > 120) {
    errors.tagline = "Keep the tagline under 120 characters.";
  }

  if (!isIsoDate(input.eventDate)) {
    errors.eventDate = "Pick the event date.";
  }

  if (!TIME_PATTERN.test(input.startTime)) {
    errors.startTime = "Pick a start time.";
  }
  if (!TIME_PATTERN.test(input.endTime)) {
    errors.endTime = "Pick an end time.";
  } else if (TIME_PATTERN.test(input.startTime) && input.endTime <= input.startTime) {
    errors.endTime = "The event has to end after it starts.";
  }

  if (!input.location) {
    errors.location = "Say where it's happening.";
  } else if (input.location.length > 60) {
    errors.location = "Keep the location under 60 characters.";
  }

  return errors;
}

export function isEventInputValid(errors: EventValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
