import { describe, it, expect } from "vitest";
import { eventPath } from "@/lib/routes";

describe("eventPath", () => {
  it("returns the event root without a page", () => {
    expect(eventPath("july-2026")).toBe("/events/july-2026");
  });

  it("appends a page under the event", () => {
    expect(eventPath("july-2026", "agenda")).toBe("/events/july-2026/agenda");
    expect(eventPath("july-2026", "agenda/sub-1/feedback")).toBe("/events/july-2026/agenda/sub-1/feedback");
  });
});
