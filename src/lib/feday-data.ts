export type TalkTypeId = "lightning" | "talk" | "workshop";

export type TalkType = {
  id: TalkTypeId;
  name: string;
  dur: string;
  color: string;
  desc: string;
};

export const FE_DAY = {
  title: "FE DAY",
  year: "2026",
  date: "WED · JULY 1 · 2026",
  time: "10:30 — 16:00",
  loc: "LION'S SHARE + REMOTE",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
};

export function formatFeDayTimeDisplay(): string {
  return FE_DAY.time.replace(/\s—\s/g, "–");
}

export const TALK_TYPES: TalkType[] = [
  {
    id: "lightning",
    name: "LIGHTNING TALK",
    dur: "10 MIN",
    color: "var(--gold)",
    desc: "A quick spark. One idea, one demo, one hot take — in and out before the timer runs down.",
  },
  {
    id: "talk",
    name: "LONG TALK",
    dur: "30 MIN",
    color: "var(--orange)",
    desc: "Room to go deep. Tell a story, teach a thing, walk through how you shipped it.",
  },
  {
    id: "workshop",
    name: "WORKSHOP",
    dur: "60 MIN",
    color: "var(--teal)",
    desc: "Hands on deck. The whole crew builds, breaks or tries something together — live.",
  },
];

export const PITCHABLE_TALK_TYPES = TALK_TYPES.filter((t) => t.id !== "workshop");

export const PITCHABLE_TALK_TYPE_IDS = PITCHABLE_TALK_TYPES.map((t) => t.id);

export const TYPE_BY_ID: Record<TalkTypeId, TalkType> = Object.fromEntries(
  TALK_TYPES.map((t) => [t.id, t]),
) as Record<TalkTypeId, TalkType>;

export type AgendaKind = "lightning" | "talk" | "workshop" | "break" | "fixed";

export type AgendaRow = {
  id?: string;
  t: string;
  end: string;
  kind: AgendaKind;
  title: string;
  desc: string;
};

export const AGENDA: AgendaRow[] = [
  { t: "10:30", end: "11:00", kind: "fixed", title: "Doors Open + Ice Breaker", desc: "Grab a coffee (or a tea, we don't judge) and a quick warm-up game to get the chapter talking." },
  { t: "11:00", end: "11:30", kind: "fixed", title: "The State of the FE at Cleo", desc: "Joe Angus opens the day with a 30-minute look at where front-end at Cleo is right now — and where it's heading." },
  { t: "11:30", end: "11:50", kind: "break", title: "Morning Break", desc: "A 20-minute stretch — legs, mug, repeat." },
  { id: "lightning-1", t: "11:50", end: "12:00", kind: "lightning", title: "Lightning Slot #1", desc: "A 10-minute spark before we break for lunch." },
  { id: "talk-1", t: "12:00", end: "12:30", kind: "talk", title: "Talk Slot #1", desc: "30 minutes to go deep on something you love." },
  { t: "12:30", end: "14:00", kind: "break", title: "Lunch", desc: "Fuel up. 90 minutes to eat, chat and recharge." },
  { id: "talk-2", t: "14:00", end: "14:30", kind: "talk", title: "Talk Slot #2", desc: "30 minutes — your stage." },
  { id: "lightning-2", t: "14:30", end: "14:40", kind: "lightning", title: "Lightning Slot #2", desc: "A post-lunch energy spark." },
  { t: "14:40", end: "15:05", kind: "break", title: "Afternoon Break", desc: "A 25-minute refuel before the final stretch." },
  { id: "talk-3", t: "15:05", end: "15:35", kind: "talk", title: "Talk Slot #3", desc: "30 minutes to teach us something new." },
  { id: "lightning-3", t: "15:35", end: "15:45", kind: "lightning", title: "Lightning Slot #3", desc: "Last spark of the day." },
  { t: "15:45", end: "15:55", kind: "fixed", title: "Closing", desc: "Wrap-up, thank-yous and quick-fire FE Day awards." },
  { t: "18:00", end: "20:00", kind: "fixed", title: "Social — Bowling @ All Star Lanes", desc: "Brick Lane, 6–8pm. A game of bowling, 2 drinks each and some nibbles — head over after closing wraps up." },
];

/** Retired slot ids kept for assignment label lookup (not shown on the agenda). */
export const LEGACY_SLOTS: (AgendaRow & { id: string })[] = [
  { id: "talk-4", t: "14:40", end: "15:10", kind: "talk", title: "Talk Slot #4 (removed)", desc: "This slot is no longer on the agenda." },
  { id: "lightning-4", t: "15:20", end: "15:30", kind: "lightning", title: "Lightning Slot #4 (removed)", desc: "This slot is no longer on the agenda." },
  { id: "workshop-1", t: "15:45", end: "16:45", kind: "workshop", title: "Workshop (removed)", desc: "This slot is no longer on the agenda." },
];

export const OPEN_AGENDA_SLOTS = AGENDA.filter(
  (row): row is AgendaRow & { id: string } => typeof row.id === "string",
);

export const OPEN_SLOT_IDS = new Set(OPEN_AGENDA_SLOTS.map((row) => row.id));

export const SLOT_BY_ID: Record<string, AgendaRow & { id: string }> = Object.fromEntries(
  [...OPEN_AGENDA_SLOTS, ...LEGACY_SLOTS].map((row) => [row.id, row]),
);

export function getOpenSlotsForType(type: TalkTypeId): (AgendaRow & { id: string })[] {
  return OPEN_AGENDA_SLOTS.filter((row) => row.kind === type);
}

export function formatSlotLabel(row: AgendaRow): string {
  return `${row.title} · ${row.t}–${row.end}`;
}

export const KIND_META: Record<
  AgendaKind,
  { label: string; color: string; open: boolean }
> = {
  lightning: { label: "LIGHTNING", color: "var(--gold)", open: true },
  talk: { label: "LONG TALK", color: "var(--orange)", open: true },
  workshop: { label: "WORKSHOP", color: "var(--teal)", open: false },
  break: { label: "BREAK", color: "var(--ink-dim)", open: false },
  fixed: { label: "SESSION", color: "#7c6f9e", open: false },
};
