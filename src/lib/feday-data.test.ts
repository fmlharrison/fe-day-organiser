import { describe, it, expect } from "vitest";
import { FE_DAY, TALK_TYPES, TYPE_BY_ID, AGENDA, KIND_META } from "@/lib/feday-data";

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
});

describe("TALK_TYPES", () => {
  it("has exactly three talk types in order", () => {
    expect(TALK_TYPES).toHaveLength(3);
    expect(TALK_TYPES.map((t) => t.id)).toEqual(["lightning", "talk", "workshop"]);
  });

  it("names each type", () => {
    expect(TALK_TYPES.map((t) => t.name)).toEqual(["LIGHTNING", "LONG TALK", "WORKSHOP"]);
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

  it("runs from 10:00 to 16:55", () => {
    expect(AGENDA[0].t).toBe("10:00");
    expect(AGENDA.at(-1)?.end).toBe("16:55");
  });

  it("is chronological and non-overlapping, with one intentional gap", () => {
    // Times are zero-padded HH:MM, so lexical comparison is chronological.
    let gaps = 0;
    for (let i = 0; i < AGENDA.length - 1; i++) {
      expect(AGENDA[i].end <= AGENDA[i + 1].t).toBe(true);
      if (AGENDA[i].end !== AGENDA[i + 1].t) gaps++;
    }
    // The only non-contiguous boundary is the 12:25 -> 12:30 pre-lunch buffer.
    expect(gaps).toBe(1);
  });

  it("keeps a 5-minute buffer before lunch", () => {
    const lunchIndex = AGENDA.findIndex((row) => row.title === "Lunch");
    expect(lunchIndex).toBeGreaterThan(0);
    expect(AGENDA[lunchIndex].t).toBe("12:30");
    expect(AGENDA[lunchIndex - 1].end).toBe("12:25");
  });

  it("offers four long talks, four lightning slots and one workshop", () => {
    const counts = AGENDA.reduce<Record<string, number>>((acc, row) => {
      acc[row.kind] = (acc[row.kind] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts.talk).toBe(4);
    expect(counts.lightning).toBe(4);
    expect(counts.workshop).toBe(1);
  });

  it("runs the workshop near the end, after the afternoon break", () => {
    const workshopIndex = AGENDA.findIndex((row) => row.kind === "workshop");
    const afternoonBreakIndex = AGENDA.findIndex((row) => row.title === "Afternoon Break");
    expect(workshopIndex).toBeGreaterThan(afternoonBreakIndex);
    // Only the closing follows the workshop.
    expect(workshopIndex).toBe(AGENDA.length - 2);
    expect(AGENDA.at(-1)?.kind).toBe("fixed");
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
  it("marks talk kinds as open and others as closed", () => {
    expect(KIND_META.lightning.open).toBe(true);
    expect(KIND_META.talk.open).toBe(true);
    expect(KIND_META.workshop.open).toBe(true);
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
