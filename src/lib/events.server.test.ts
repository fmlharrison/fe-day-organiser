import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { getCurrentEvent } from "@/lib/events.server";

const julyRow = {
  id: "event-july-2026",
  slug: "july-2026",
  title: "FE DAY",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
  event_date: "2026-07-01",
  start_time: "10:00:00",
  end_time: "16:00:00",
  location: "LION'S SHARE + REMOTE",
};
const decemberRow = { ...julyRow, id: "event-dec-2026", slug: "december-2026", event_date: "2026-12-01" };

describe("getCurrentEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      select: () => query,
      gte: mocks.gte,
      lt: mocks.lt,
      order: () => query,
      limit: () => query,
      maybeSingle: mocks.maybeSingle,
    };
    mocks.gte.mockReturnValue(query);
    mocks.lt.mockReturnValue(query);
    mocks.from.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("returns the next upcoming event, with times trimmed to HH:MM", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: decemberRow, error: null });

    const event = await getCurrentEvent();

    expect(mocks.from).toHaveBeenCalledWith("events");
    expect(mocks.gte).toHaveBeenCalledWith("event_date", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    expect(mocks.lt).not.toHaveBeenCalled();
    expect(event).toMatchObject({ slug: "december-2026", eventDate: "2026-12-01", startTime: "10:00", endTime: "16:00" });
  });

  it("falls back to the most recent past event when none are upcoming", async () => {
    mocks.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: julyRow, error: null });

    const event = await getCurrentEvent();

    expect(mocks.lt).toHaveBeenCalledWith("event_date", expect.any(String));
    expect(event?.slug).toBe("july-2026");
  });

  it("returns null when there are no events", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    expect(await getCurrentEvent()).toBeNull();
  });

  it("throws when the query fails", async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error("boom") });

    await expect(getCurrentEvent()).rejects.toThrow("boom");
  });
});
