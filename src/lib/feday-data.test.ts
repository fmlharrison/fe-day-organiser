import { describe, it, expect } from "vitest";
import {
  FE_DAY,
  TALK_TYPES,
  PITCHABLE_TALK_TYPES,
  TYPE_BY_ID,
  AGENDA,
  KIND_META,
  OPEN_AGENDA_SLOTS,
  SLOT_BY_ID,
  LEGACY_SLOTS,
  getOpenSlotsForType,
  formatFeDayTimeDisplay,
} from "@/lib/feday-data";

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

describe("FE_DAY", () => {
  it("exposes the event identity", () => {
    expect(FE_DAY.title).toBe("FE DAY");
    expect(FE_DAY.year).toBe("2026");
    expect(FE_DAY.tagline).toBe("INSERT COIN — SHARE WHAT YOU KNOW");
  });

  it("has non-empty date, time and location strings", () => {
    for (const key of ["date", "time", "loc"] as const) {
      expect(typeof FE_DAY[key]).toBe("string");
      expect(FE_DAY[key].length).toBeGreaterThan(0);
    }
  });

  it("advertises the 10:00-16:00 window", () => {
    expect(FE_DAY.time).toBe("10:00 — 16:00");
    expect(formatFeDayTimeDisplay()).toBe("10:00-16:00");
  });
});

describe("TALK_TYPES", () => {
  it("has exactly three talk types in order", () => {
    expect(TALK_TYPES).toHaveLength(3);
    expect(TALK_TYPES.map((t) => t.id)).toEqual(["lightning", "talk", "workshop"]);
  });

  it("names each type", () => {
    expect(TALK_TYPES.map((t) => t.name)).toEqual(["LIGHTNING TALK", "LONG TALK", "WORKSHOP"]);
  });

  it("uses the canonical durations", () => {
    expect(TALK_TYPES.map((t) => t.dur)).toEqual(["10 MIN", "30 MIN", "60 MIN"]);
  });

  it("gives every type a non-empty description and color", () => {
    for (const type of TALK_TYPES) {
      expect(typeof type.desc).toBe("string");
      expect(type.desc.length).toBeGreaterThan(0);
      expect(typeof type.color).toBe("string");
      expect(type.color.length).toBeGreaterThan(0);
    }
  });
});

describe("PITCHABLE_TALK_TYPES", () => {
  it("excludes workshop from new pitches", () => {
    expect(PITCHABLE_TALK_TYPES.map((t) => t.id)).toEqual(["lightning", "talk"]);
  });
});

describe("TYPE_BY_ID", () => {
  it("maps each id to its TALK_TYPES entry", () => {
    expect(Object.keys(TYPE_BY_ID).sort()).toEqual(["lightning", "talk", "workshop"]);
    for (const type of TALK_TYPES) {
      expect(TYPE_BY_ID[type.id]).toBe(type);
    }
  });
});

describe("AGENDA", () => {
  it("has exactly fifteen rows", () => {
    expect(AGENDA).toHaveLength(15);
  });

  it("runs from 10:00 through to the evening social", () => {
    expect(AGENDA[0].t).toBe("10:00");
    expect(AGENDA.at(-1)?.t).toBe("18:00");
    expect(AGENDA.at(-1)?.title).toBe("Social — Bowling @ All Star Lanes");
  });

  it("is chronological and non-overlapping, with intentional gaps before lunch and the social", () => {
    let gaps = 0;
    for (let i = 0; i < AGENDA.length - 1; i++) {
      expect(AGENDA[i].end <= AGENDA[i + 1].t).toBe(true);
      if (AGENDA[i].end !== AGENDA[i + 1].t) gaps++;
    }
    // 12:20 -> 12:30 pre-lunch buffer; 15:45 -> 18:00 post-closing.
    expect(gaps).toBe(2);
  });

  it("keeps lunch at 12:30 for 90 minutes", () => {
    const lunch = AGENDA.find((row) => row.title === "Lunch");
    expect(lunch?.t).toBe("12:30");
    expect(lunch?.end).toBe("14:00");
    expect(minutesBetween(lunch!.t, lunch!.end)).toBe(90);
    expect(AGENDA.find((row) => row.id === "talk-2")?.end).toBe("12:20");
  });

  it("uses a 20-minute morning break after State of the FE", () => {
    const stateOfFe = AGENDA.find((row) => row.title === "The State of the FE at Cleo");
    const morningBreak = AGENDA.find((row) => row.title === "Morning Break");
    expect(stateOfFe?.end).toBe("11:00");
    expect(morningBreak?.t).toBe("11:00");
    expect(morningBreak?.end).toBe("11:20");
    expect(minutesBetween(morningBreak!.t, morningBreak!.end)).toBe(20);
  });

  it("uses a 15-minute afternoon break between lightning-2 and lightning-3", () => {
    const afternoonBreak = AGENDA.find((row) => row.title === "Afternoon Break");
    expect(afternoonBreak?.t).toBe("14:50");
    expect(afternoonBreak?.end).toBe("15:05");
    expect(minutesBetween(afternoonBreak!.t, afternoonBreak!.end)).toBe(15);
    expect(AGENDA.find((row) => row.id === "lightning-2")?.end).toBe("14:50");
    expect(AGENDA.find((row) => row.id === "lightning-3")?.t).toBe("15:05");
  });

  it("offers three long talks and five lightning slots, no workshop", () => {
    const counts = AGENDA.reduce<Record<string, number>>((acc, row) => {
      acc[row.kind] = (acc[row.kind] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts.talk).toBe(3);
    expect(counts.lightning).toBe(5);
    expect(counts.workshop).toBeUndefined();
  });

  it("puts two long talks after the morning break and before lunch", () => {
    const morningBreakIndex = AGENDA.findIndex((row) => row.title === "Morning Break");
    const talk1Index = AGENDA.findIndex((row) => row.id === "talk-1");
    const talk2Index = AGENDA.findIndex((row) => row.id === "talk-2");
    const lunchIndex = AGENDA.findIndex((row) => row.title === "Lunch");
    expect(AGENDA.find((row) => row.id === "talk-1")?.t).toBe("11:20");
    expect(AGENDA.find((row) => row.id === "talk-1")?.end).toBe("11:50");
    expect(AGENDA.find((row) => row.id === "talk-2")?.t).toBe("11:50");
    expect(AGENDA.find((row) => row.id === "talk-2")?.end).toBe("12:20");
    expect(morningBreakIndex).toBeLessThan(talk1Index);
    expect(talk1Index).toBeLessThan(talk2Index);
    expect(talk2Index).toBeLessThan(lunchIndex);
  });

  it("includes Joe Angus's State of the FE session and drops show & tell", () => {
    const joe = AGENDA.find((row) => row.title === "The State of the FE at Cleo");
    expect(joe?.kind).toBe("fixed");
    expect(AGENDA.some((row) => /show & tell/i.test(row.title))).toBe(false);
  });

  it("uses only known kinds", () => {
    const allowed = ["lightning", "talk", "workshop", "break", "fixed"];
    for (const row of AGENDA) {
      expect(allowed).toContain(row.kind);
    }
  });

  it("gives every row a non-empty title and description", () => {
    for (const row of AGENDA) {
      expect(typeof row.title).toBe("string");
      expect(row.title.length).toBeGreaterThan(0);
      expect(typeof row.desc).toBe("string");
      expect(row.desc.length).toBeGreaterThan(0);
    }
  });
});

describe("KIND_META", () => {
  it("marks lightning and talk as open, workshop as closed", () => {
    expect(KIND_META.lightning.open).toBe(true);
    expect(KIND_META.talk.open).toBe(true);
    expect(KIND_META.workshop.open).toBe(false);
    expect(KIND_META.break.open).toBe(false);
    expect(KIND_META.fixed.open).toBe(false);
  });

  it("labels each kind", () => {
    expect(KIND_META.lightning.label).toBe("LIGHTNING");
    expect(KIND_META.talk.label).toBe("LONG TALK");
    expect(KIND_META.workshop.label).toBe("WORKSHOP");
    expect(KIND_META.break.label).toBe("BREAK");
    expect(KIND_META.fixed.label).toBe("SESSION");
  });
});

describe("open agenda slots", () => {
  it("gives every open row a unique stable id", () => {
    const openRows = AGENDA.filter((row) => KIND_META[row.kind].open);
    expect(OPEN_AGENDA_SLOTS).toHaveLength(openRows.length);
    expect(OPEN_AGENDA_SLOTS).toHaveLength(8);
    const ids = OPEN_AGENDA_SLOTS.map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const row of openRows) {
      expect(row.id).toBeTruthy();
    }
  });

  it("maps open ids through SLOT_BY_ID", () => {
    for (const row of OPEN_AGENDA_SLOTS) {
      expect(SLOT_BY_ID[row.id]).toBe(row);
    }
  });

  it("maps legacy ids through SLOT_BY_ID", () => {
    for (const row of LEGACY_SLOTS) {
      expect(SLOT_BY_ID[row.id]).toBe(row);
    }
  });

  it("matches open slot kinds to getOpenSlotsForType", () => {
    expect(getOpenSlotsForType("talk")).toHaveLength(3);
    expect(getOpenSlotsForType("lightning")).toHaveLength(5);
    expect(getOpenSlotsForType("workshop")).toHaveLength(0);
  });
});
