import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getEventBySlug: vi.fn(),
  getSessionUser: vi.fn(),
  revalidatePath: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/user", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/events.server", () => ({ getEventBySlug: mocks.getEventBySlug }));

import { setAttendance } from "@/app/events/[slug]/attendees/actions";
import { julyEvent } from "@/test/fixtures";

// July 2026 is upcoming at this moment; individual tests move the clock past it.
const BEFORE_JULY = new Date("2026-06-15T12:00:00Z");
const AFTER_JULY = new Date("2026-07-02T12:00:00Z");

describe("setAttendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(BEFORE_JULY);
    mocks.getSessionUser.mockResolvedValue({ id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" });
    mocks.getEventBySlug.mockResolvedValue(julyEvent);
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("upserts one RSVP per user per event", async () => {
    const result = await setAttendance("july-2026", "remote");

    expect(result).toEqual({ ok: true, mode: "remote" });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: julyEvent.id, user_id: "u1", mode: "remote" }),
      { onConflict: "event_id,user_id" },
    );
  });

  it("rejects the RSVP when the event doesn't exist", async () => {
    mocks.getEventBySlug.mockResolvedValue(null);

    const result = await setAttendance("july-2026", "remote");

    expect(result).toMatchObject({ ok: false });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("rejects the RSVP once the event has passed", async () => {
    vi.setSystemTime(AFTER_JULY);

    const result = await setAttendance("july-2026", "remote");

    expect(result).toEqual({ ok: false, formError: "This event has wrapped — RSVPs are closed." });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
