import type { AgendaItem } from "@/lib/events";

export type TalkTypeId = "lightning" | "talk" | "workshop";

export type TalkType = {
  id: TalkTypeId;
  name: string;
  dur: string;
  color: string;
  desc: string;
};

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

export function formatSlotLabel(item: AgendaItem): string {
  return `${item.title} · ${item.startTime}–${item.endTime}`;
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
