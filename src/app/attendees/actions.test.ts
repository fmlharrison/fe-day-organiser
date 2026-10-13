import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getCurrentEvent: vi.fn(),
  getSessionUser: vi.fn(),
  revalidatePath: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/user", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/events.server", () => ({ getCurrentEvent: mocks.getCurrentEvent }));

import { setAttendance } from "@/app/attendees/actions";
import { julyEvent } from "@/test/fixtures";

describe("setAttendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionUser.mockResolvedValue({ id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" });
    mocks.getCurrentEvent.mockResolvedValue(julyEvent);
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("upserts one RSVP per user per event", async () => {
    const result = await setAttendance("remote");

    expect(result).toEqual({ ok: true, mode: "remote" });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: julyEvent.id, user_id: "u1", mode: "remote" }),
      { onConflict: "event_id,user_id" },
    );
  });

  it("rejects the RSVP when there is no current event", async () => {
    mocks.getCurrentEvent.mockResolvedValue(null);

    const result = await setAttendance("remote");

    expect(result).toMatchObject({ ok: false });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
