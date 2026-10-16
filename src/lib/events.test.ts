import { describe, it, expect } from "vitest";
import {
  eventBrand,
  eventDocumentTitle,
  eventEdition,
  formatEventDateShort,
  formatEventTimeRange,
  isEventPast,
  todayInLondon,
} from "@/lib/events";
import { julyEvent } from "@/test/fixtures";

const decemberEvent = { ...julyEvent, id: "event-dec-2026", slug: "december-2026", eventDate: "2026-12-01" };

describe("formatEventDateShort", () => {
  it("formats as MON D without a leading zero", () => {
    expect(formatEventDateShort(julyEvent)).toBe("JUL 1");
    expect(formatEventDateShort({ ...julyEvent, eventDate: "2026-11-23" })).toBe("NOV 23");
  });
});

describe("formatEventTimeRange", () => {
  it("joins start and end time", () => {
    expect(formatEventTimeRange(julyEvent)).toBe("10:00-16:00");
  });
});

describe("eventEdition", () => {
  it("labels the event by month and year", () => {
    expect(eventEdition(julyEvent)).toBe("JUL 2026");
    expect(eventEdition(decemberEvent)).toBe("DEC 2026");
  });
});

describe("eventBrand", () => {
  it("combines the title with the month and short year", () => {
    expect(eventBrand(julyEvent)).toBe("FE DAY JUL ’26");
    expect(eventBrand(decemberEvent)).toBe("FE DAY DEC ’26");
  });
});

describe("eventDocumentTitle", () => {
  it("names the event by month and year", () => {
    expect(eventDocumentTitle(decemberEvent)).toBe("FE DAY DEC 2026 · Pitch a Talk");
  });
});

describe("isEventPast", () => {
  it("treats an event as current through its own day", () => {
    expect(isEventPast(julyEvent, "2026-06-30")).toBe(false);
    expect(isEventPast(julyEvent, "2026-07-01")).toBe(false);
    expect(isEventPast(julyEvent, "2026-07-02")).toBe(true);
  });
});

describe("todayInLondon", () => {
  it("rolls over at London midnight during BST", () => {
    expect(todayInLondon(new Date("2026-07-01T22:59:00Z"))).toBe("2026-07-01");
    expect(todayInLondon(new Date("2026-07-01T23:00:00Z"))).toBe("2026-07-02");
  });

  it("matches UTC during GMT", () => {
    expect(todayInLondon(new Date("2026-12-01T23:59:00Z"))).toBe("2026-12-01");
    expect(todayInLondon(new Date("2026-12-02T00:00:00Z"))).toBe("2026-12-02");
  });
});
