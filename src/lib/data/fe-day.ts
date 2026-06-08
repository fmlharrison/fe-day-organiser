import type { AgendaItem, KindMeta, TalkType } from "@/types";

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

export const TYPE_BY_ID = Object.fromEntries(
  TALK_TYPES.map((t) => [t.id, t])
) as Record<string, TalkType>;

export const AGENDA: AgendaItem[] = [
  {
    t: "10:00",
    end: "10:30",
    kind: "fixed",
    title: "Doors Open + Ice Breaker",
    desc: "Grab a coffee (or a tea, we don't judge) and a quick warm-up game to get the chapter talking.",
  },
  {
    t: "10:30",
    end: "10:40",
    kind: "lightning",
    title: "Lightning Slot #1",
    desc: "A 10-minute spark to kick things off.",
  },
  {
    t: "10:40",
    end: "11:10",
    kind: "talk",
    title: "Talk Slot #1",
    desc: "30 minutes to go deep on something you love.",
  },
  {
    t: "11:10",
    end: "11:20",
    kind: "lightning",
    title: "Lightning Slot #2",
    desc: "Another quick hit before the break.",
  },
  {
    t: "11:20",
    end: "11:50",
    kind: "break",
    title: "Morning Break",
    desc: "Stretch those legs. Refill the mug. Back in 30.",
  },
  {
    t: "11:50",
    end: "12:20",
    kind: "talk",
    title: "Talk Slot #2",
    desc: "30 minutes — your stage.",
  },
  {
    t: "12:20",
    end: "12:30",
    kind: "lightning",
    title: "Lightning Slot #3",
    desc: "One more spark before lunch.",
  },
  {
    t: "12:30",
    end: "13:00",
    kind: "talk",
    title: "Talk Slot #3",
    desc: "30 minutes to teach us something new.",
  },
  {
    t: "13:00",
    end: "14:00",
    kind: "break",
    title: "Lunch",
    desc: "Fuel up. An hour to eat, chat and recharge.",
  },
  {
    t: "14:00",
    end: "15:00",
    kind: "workshop",
    title: "Workshop",
    desc: "60 minutes, hands on deck — the whole chapter builds something together.",
  },
  {
    t: "15:00",
    end: "15:10",
    kind: "lightning",
    title: "Lightning Slot #4",
    desc: "Post-lunch energy spark.",
  },
  {
    t: "15:10",
    end: "15:40",
    kind: "talk",
    title: "Talk Slot #4",
    desc: "Our final long-form slot of the day.",
  },
  {
    t: "15:40",
    end: "16:10",
    kind: "break",
    title: "Afternoon Break",
    desc: "Last refuel before the home stretch.",
  },
  {
    t: "16:10",
    end: "16:45",
    kind: "fixed",
    title: "Open Demos + Show & Tell",
    desc: "Anyone can jump up and show a side project, a hack or a thing they made.",
  },
  {
    t: "16:45",
    end: "17:00",
    kind: "fixed",
    title: "Closing + FE Day Awards",
    desc: "Wrap-up, thank-yous and entirely-serious awards. Then: socials.",
  },
];

export const KIND_META: Record<string, KindMeta> = {
  lightning: { label: "LIGHTNING", color: "var(--gold)", open: true },
  talk: { label: "LONG TALK", color: "var(--orange)", open: true },
  workshop: { label: "WORKSHOP", color: "var(--teal)", open: true },
  break: { label: "BREAK", color: "var(--ink-dim)", open: false },
  fixed: { label: "SESSION", color: "#7c6f9e", open: false },
};

export const CLEO_EMAIL_DOMAIN = "meetcleo.com";
