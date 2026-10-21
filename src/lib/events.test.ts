import { describe, it, expect } from "vitest";
import {
  eventBrand,
  eventDocumentTitle,
  eventEdition,
  formatEventDateShort,
  formatEventTimeRange,
  isEventPast,
  todayInLondon,
  trimEventInput,
  validateAgendaItemInput,
  validateEventInput,
  type EventInput,
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

describe("validateEventInput", () => {
  const valid: EventInput = {
    slug: "december-2026",
    title: "FE DAY",
    tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
    eventDate: "2026-12-01",
    startTime: "10:00",
    endTime: "16:00",
    location: "LION'S SHARE + REMOTE",
  };

  it("accepts a complete event", () => {
    expect(validateEventInput(valid)).toEqual({});
  });

  it.each([
    ["", "Give the event a URL slug."],
    ["December 2026", "Use lowercase letters, numbers and single hyphens, e.g. december-2026."],
    ["december--2026", "Use lowercase letters, numbers and single hyphens, e.g. december-2026."],
    ["-december", "Use lowercase letters, numbers and single hyphens, e.g. december-2026."],
    ["new", "That slug is reserved. Pick another."],
  ])("rejects the slug %j", (slug, message) => {
    expect(validateEventInput({ ...valid, slug }).slug).toBe(message);
  });

  it("requires a title, date, times and location", () => {
    const errors = validateEventInput({
      ...valid,
      title: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
    });
    expect(Object.keys(errors).sort()).toEqual(["endTime", "eventDate", "location", "startTime", "title"]);
  });

  it("rejects an impossible date", () => {
    expect(validateEventInput({ ...valid, eventDate: "2026-02-30" }).eventDate).toBeDefined();
  });

  it("requires the event to end after it starts", () => {
    expect(validateEventInput({ ...valid, startTime: "16:00", endTime: "10:00" }).endTime).toBe(
      "The event has to end after it starts.",
    );
    expect(validateEventInput({ ...valid, startTime: "10:00", endTime: "10:00" }).endTime).toBeDefined();
  });

  it("allows an empty tagline but caps its length", () => {
    expect(validateEventInput({ ...valid, tagline: "" })).toEqual({});
    expect(validateEventInput({ ...valid, tagline: "x".repeat(121) }).tagline).toBeDefined();
  });

  it("trims every field", () => {
    expect(trimEventInput({ ...valid, slug: "  december-2026 ", location: " Lion's Share " })).toMatchObject({
      slug: "december-2026",
      location: "Lion's Share",
    });
  });
});

describe("validateAgendaItemInput", () => {
  const valid = { startTime: "11:20", endTime: "11:50", kind: "talk", title: "Talk Slot #1", description: "" };

  it("accepts a complete item with an empty description", () => {
    expect(validateAgendaItemInput(valid)).toEqual({});
  });

  it("rejects an unknown kind", () => {
    expect(validateAgendaItemInput({ ...valid, kind: "party" }).kind).toBeDefined();
  });

  it("requires a title and the end to come after the start", () => {
    const errors = validateAgendaItemInput({ ...valid, title: "", endTime: "11:00" });
    expect(errors.title).toBe("Give it a title.");
    expect(errors.endTime).toBe("It has to end after it starts.");
  });

  it("caps the title and description lengths", () => {
    const errors = validateAgendaItemInput({ ...valid, title: "x".repeat(71), description: "x".repeat(401) });
    expect(Object.keys(errors).sort()).toEqual(["description", "title"]);
  });
});
