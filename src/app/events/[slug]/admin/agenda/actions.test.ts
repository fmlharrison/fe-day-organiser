import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  eq: vi.fn(),
  getAgendaAssignments: vi.fn(),
  getAgendaItems: vi.fn(),
  getEventBySlug: vi.fn(),
  insert: vi.fn(),
  isOrganiser: vi.fn(),
  result: { error: null as { code?: string; message?: string } | null },
  revalidatePath: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/submissions", () => ({ isOrganiser: mocks.isOrganiser }));
vi.mock("@/lib/events.server", () => ({
  getAgendaItems: mocks.getAgendaItems,
  getEventBySlug: mocks.getEventBySlug,
}));
vi.mock("@/lib/agenda", () => ({ getAgendaAssignments: mocks.getAgendaAssignments }));

import {
  addAgendaItem,
  deleteAgendaItem,
  updateAgendaItem,
  updateEvent,
} from "@/app/events/[slug]/admin/agenda/actions";
import { julyAgenda, julyEvent } from "@/test/fixtures";

const talkSlot = { startTime: "11:20", endTime: "11:50", kind: "talk", title: "Talk Slot #1", description: "" };
const assignedTalk = {
  slotId: "talk-1",
  submissionId: "sub-1",
  title: "Type-safe CSS",
  description: "",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk" as const,
};

describe("agenda editor actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.result.error = null;
    mocks.isOrganiser.mockResolvedValue(true);
    mocks.getEventBySlug.mockResolvedValue(julyEvent);
    mocks.getAgendaItems.mockResolvedValue(julyAgenda);
    mocks.getAgendaAssignments.mockResolvedValue({});
    // Every query chain resolves to the shared result once awaited.
    const chain = {
      eq: mocks.eq,
      then: (resolve: (value: unknown) => void) => resolve(mocks.result),
    };
    mocks.eq.mockReturnValue(chain);
    mocks.insert.mockImplementation(() => chain);
    mocks.update.mockImplementation(() => chain);
    mocks.delete.mockImplementation(() => chain);
    mocks.createClient.mockResolvedValue({
      from: () => ({ insert: mocks.insert, update: mocks.update, delete: mocks.delete }),
    });
  });

  it("rejects non-organisers before touching the database", async () => {
    mocks.isOrganiser.mockResolvedValue(false);

    const result = await addAgendaItem("july-2026", talkSlot);

    expect(result).toEqual({ ok: false, errors: {}, formError: "Only organisers can edit events." });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  describe("updateEvent", () => {
    it("saves the details but never the slug", async () => {
      const result = await updateEvent("july-2026", {
        slug: "hijacked",
        title: "FE DAY",
        tagline: "",
        eventDate: "2026-07-02",
        startTime: "09:30",
        endTime: "16:00",
        location: "THE BIG ROOM",
      });

      expect(result).toEqual({ ok: true });
      expect(mocks.update).toHaveBeenCalledWith({
        title: "FE DAY",
        tagline: "",
        event_date: "2026-07-02",
        start_time: "09:30",
        end_time: "16:00",
        location: "THE BIG ROOM",
      });
      expect(mocks.eq).toHaveBeenCalledWith("id", julyEvent.id);
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/events/july-2026", "layout");
    });
  });

  describe("addAgendaItem", () => {
    it("adds the item to the event", async () => {
      const result = await addAgendaItem("july-2026", { ...talkSlot, title: "  Talk Slot #4  " });

      expect(result).toEqual({ ok: true });
      expect(mocks.insert).toHaveBeenCalledWith({
        event_id: julyEvent.id,
        start_time: "11:20",
        end_time: "11:50",
        kind: "talk",
        title: "Talk Slot #4",
        description: "",
      });
    });

    it("returns validation errors", async () => {
      const result = await addAgendaItem("july-2026", { ...talkSlot, endTime: "11:00" });

      expect(result).toMatchObject({ ok: false, errors: { endTime: expect.any(String) } });
      expect(mocks.insert).not.toHaveBeenCalled();
    });
  });

  describe("updateAgendaItem", () => {
    it("updates the item within the event", async () => {
      const result = await updateAgendaItem("july-2026", "talk-1", { ...talkSlot, title: "Keynote" });

      expect(result).toEqual({ ok: true });
      expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ title: "Keynote" }));
      expect(mocks.eq).toHaveBeenCalledWith("id", "talk-1");
      expect(mocks.eq).toHaveBeenCalledWith("event_id", julyEvent.id);
    });

    it("won't change the type of a slot with a talk assigned", async () => {
      mocks.getAgendaAssignments.mockResolvedValue({ "talk-1": assignedTalk });

      const result = await updateAgendaItem("july-2026", "talk-1", { ...talkSlot, kind: "lightning" });

      expect(result).toMatchObject({ ok: false, errors: { kind: expect.stringMatching(/Unassign/) } });
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it("still lets you retime a slot with a talk assigned", async () => {
      mocks.getAgendaAssignments.mockResolvedValue({ "talk-1": assignedTalk });

      const result = await updateAgendaItem("july-2026", "talk-1", { ...talkSlot, startTime: "11:30", endTime: "12:00" });

      expect(result).toEqual({ ok: true });
    });

    it("reports an item that isn't in the event", async () => {
      const result = await updateAgendaItem("july-2026", "elsewhere", talkSlot);

      expect(result).toMatchObject({ ok: false, formError: "That agenda item no longer exists." });
      expect(mocks.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteAgendaItem", () => {
    it("deletes the item within the event", async () => {
      const result = await deleteAgendaItem("july-2026", "lunch");

      expect(result).toEqual({ ok: true });
      expect(mocks.eq).toHaveBeenCalledWith("id", "lunch");
      expect(mocks.eq).toHaveBeenCalledWith("event_id", julyEvent.id);
    });

    it("explains when a talk is still assigned to the slot", async () => {
      mocks.result.error = { code: "23503" };

      const result = await deleteAgendaItem("july-2026", "talk-1");

      expect(result).toEqual({
        ok: false,
        errors: {},
        formError: "A talk is assigned to this slot. Unassign the talk first.",
      });
    });
  });
});
