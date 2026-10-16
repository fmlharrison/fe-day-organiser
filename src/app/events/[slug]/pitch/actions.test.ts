import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getAgendaAssignments: vi.fn(),
  getAgendaItems: vi.fn(),
  getEventBySlug: vi.fn(),
  getSessionUser: vi.fn(),
  insert: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/user", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/events.server", () => ({
  getAgendaItems: mocks.getAgendaItems,
  getEventBySlug: mocks.getEventBySlug,
}));
vi.mock("@/lib/agenda", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agenda")>()),
  getAgendaAssignments: mocks.getAgendaAssignments,
}));

import { submitTalk } from "@/app/events/[slug]/pitch/actions";
import { julyAgenda, julyEvent } from "@/test/fixtures";

const input = {
  type: "talk",
  title: "Deleting 40% Of Our CSS",
  description: "A story about shipping less CSS and surviving.",
  name: "Ada Pixel",
  team: "Web Platform",
};

describe("submitTalk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionUser.mockResolvedValue({ id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" });
    mocks.getEventBySlug.mockResolvedValue(julyEvent);
    mocks.getAgendaItems.mockResolvedValue(julyAgenda);
    mocks.getAgendaAssignments.mockResolvedValue({});
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockReturnValue({ insert: mocks.insert });
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("saves the pitch against the event", async () => {
    const result = await submitTalk("july-2026", input);

    expect(result.ok).toBe(true);
    expect(mocks.getAgendaAssignments).toHaveBeenCalledWith(julyEvent.id);
    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ event_id: julyEvent.id, user_id: "u1", title: input.title }),
    );
    expect(mocks.getEventBySlug).toHaveBeenCalledWith("july-2026");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/events/july-2026", "layout");
  });

  it("rejects the pitch when the event doesn't exist", async () => {
    mocks.getEventBySlug.mockResolvedValue(null);

    const result = await submitTalk("july-2026", input);

    expect(result).toMatchObject({ ok: false, errors: {} });
    expect(result).toHaveProperty("formError");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
