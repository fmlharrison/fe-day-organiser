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
  time: "10:00 — 17:00",
  loc: "LION'S SHARE + REMOTE",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
};

export const TALK_TYPES: TalkType[] = [
  {
    id: "lightning",
    name: "LIGHTNING",
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

export const TYPE_BY_ID: Record<TalkTypeId, TalkType> = Object.fromEntries(
  TALK_TYPES.map((t) => [t.id, t]),
) as Record<TalkTypeId, TalkType>;

export type AgendaKind = "lightning" | "talk" | "workshop" | "break" | "fixed";

export const AGENDA: {
  t: string;
  end: string;
  kind: AgendaKind;
  title: string;
  desc: string;
}[] = [
  { t: "10:00", end: "10:30", kind: "fixed", title: "Doors Open + Ice Breaker", desc: "Grab a coffee (or a tea, we don't judge) and a quick warm-up game to get the chapter talking." },
  { t: "10:30", end: "11:00", kind: "fixed", title: "The State of the FE at Cleo", desc: "Joe Angus opens the day with a 30-minute look at where front-end at Cleo is right now — and where it's heading." },
  { t: "11:00", end: "11:30", kind: "talk", title: "Talk Slot #1", desc: "30 minutes to go deep on something you love." },
  { t: "11:30", end: "11:45", kind: "break", title: "Morning Break", desc: "A quick 15 — stretch your legs and refill the mug." },
  { t: "11:45", end: "12:15", kind: "talk", title: "Talk Slot #2", desc: "30 minutes — your stage." },
  { t: "12:15", end: "12:25", kind: "lightning", title: "Lightning Slot #1", desc: "A 10-minute spark before we break for lunch." },
  { t: "12:30", end: "14:00", kind: "break", title: "Lunch", desc: "Fuel up. 90 minutes to eat, chat and recharge." },
  { t: "14:00", end: "14:30", kind: "talk", title: "Talk Slot #3", desc: "30 minutes to teach us something new." },
  { t: "14:30", end: "14:40", kind: "lightning", title: "Lightning Slot #2", desc: "A post-lunch energy spark." },
  { t: "14:40", end: "15:10", kind: "talk", title: "Talk Slot #4", desc: "Our final long-form slot of the day." },
  { t: "15:10", end: "15:20", kind: "lightning", title: "Lightning Slot #3", desc: "Another quick hit." },
  { t: "15:20", end: "15:30", kind: "lightning", title: "Lightning Slot #4", desc: "Last spark before the break." },
  { t: "15:30", end: "15:45", kind: "break", title: "Afternoon Break", desc: "A 15-minute refuel before the home stretch." },
  { t: "15:45", end: "16:45", kind: "workshop", title: "Workshop", desc: "60 minutes, hands on deck — the whole chapter builds something together." },
  { t: "16:45", end: "16:55", kind: "fixed", title: "Closing", desc: "Wrap-up, thank-yous and quick-fire FE Day awards. Then: socials." },
];

export const KIND_META: Record<
  AgendaKind,
  { label: string; color: string; open: boolean }
> = {
  lightning: { label: "LIGHTNING", color: "var(--gold)", open: true },
  talk: { label: "LONG TALK", color: "var(--orange)", open: true },
  workshop: { label: "WORKSHOP", color: "var(--teal)", open: true },
  break: { label: "BREAK", color: "var(--ink-dim)", open: false },
  fixed: { label: "SESSION", color: "#7c6f9e", open: false },
};
