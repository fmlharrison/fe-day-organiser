import { describe, it, expect } from "vitest";
import {
  TALK_TYPES,
  PITCHABLE_TALK_TYPES,
  TYPE_BY_ID,
  KIND_META,
  formatSlotLabel,
} from "@/lib/feday-data";
import { julyAgenda } from "@/test/fixtures";

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

describe("formatSlotLabel", () => {
  it("combines the item title with its time range", () => {
    const talk1 = julyAgenda.find((item) => item.id === "talk-1")!;
    expect(formatSlotLabel(talk1)).toBe("Talk Slot #1 · 11:20–11:50");
  });
});
