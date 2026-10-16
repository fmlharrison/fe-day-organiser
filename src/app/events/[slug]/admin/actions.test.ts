import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
  getAgendaAssignments: vi.fn(),
  getAgendaItems: vi.fn(),
  getEventBySlug: vi.fn(),
  getSessionUser: vi.fn(),
  insert: vi.fn(),
  isOrganiser: vi.fn(),
  maybeSingle: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/user", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/submissions", () => ({ isOrganiser: mocks.isOrganiser }));
vi.mock("@/lib/events.server", () => ({
  getAgendaItems: mocks.getAgendaItems,
  getEventBySlug: mocks.getEventBySlug,
}));
vi.mock("@/lib/agenda", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/agenda")>()),
  getAgendaAssignments: mocks.getAgendaAssignments,
}));

import { assignSubmissionToSlot } from "@/app/events/[slug]/admin/actions";
import { julyAgenda, julyEvent } from "@/test/fixtures";

describe("assignSubmissionToSlot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOrganiser.mockResolvedValue(true);
    mocks.getSessionUser.mockResolvedValue({ id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" });
    mocks.getEventBySlug.mockResolvedValue(julyEvent);
    mocks.getAgendaItems.mockResolvedValue(julyAgenda);
    mocks.getAgendaAssignments.mockResolvedValue({});
    mocks.maybeSingle.mockResolvedValue({ data: { id: "sub-1", type: "talk" }, error: null });
    const query = { select: () => query, eq: mocks.eq, maybeSingle: mocks.maybeSingle };
    mocks.eq.mockReturnValue(query);
    mocks.insert.mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) =>
      table === "agenda_assignments" ? { insert: mocks.insert } : query,
    );
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("looks the submission up within the event and records the event on the assignment", async () => {
    const result = await assignSubmissionToSlot("july-2026", "sub-1", "talk-1");

    expect(result).toEqual({ ok: true });
    expect(mocks.eq).toHaveBeenCalledWith("event_id", julyEvent.id);
    expect(mocks.getAgendaAssignments).toHaveBeenCalledWith(julyEvent.id);
    expect(mocks.insert).toHaveBeenCalledWith({
      event_id: julyEvent.id,
      agenda_item_id: "talk-1",
      submission_id: "sub-1",
      assigned_by: "u1",
    });
  });

  it("rejects a submission that isn't part of the event", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await assignSubmissionToSlot("july-2026", "sub-from-another-event", "talk-1");

    expect(result).toEqual({ ok: false, formError: "Couldn't find that submission." });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
