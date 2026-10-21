import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  deleteEq: vi.fn(),
  eventsDelete: vi.fn(),
  eventsInsert: vi.fn(),
  getAgendaItems: vi.fn(),
  getSessionUser: vi.fn(),
  isOrganiser: vi.fn(),
  itemsInsert: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
  revalidatePath: vi.fn(),
  single: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/auth/user", () => ({ getSessionUser: mocks.getSessionUser }));
vi.mock("@/lib/submissions", () => ({ isOrganiser: mocks.isOrganiser }));
vi.mock("@/lib/events.server", () => ({ getAgendaItems: mocks.getAgendaItems }));

import { createEvent, type NewEventInput } from "@/app/events/new/actions";
import { julyAgenda, julyEvent } from "@/test/fixtures";

const input: NewEventInput = {
  slug: "december-2026",
  title: "FE DAY",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
  eventDate: "2026-12-01",
  startTime: "10:00",
  endTime: "16:00",
  location: "LION'S SHARE + REMOTE",
  copyAgendaFromEventId: julyEvent.id,
};

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOrganiser.mockResolvedValue(true);
    mocks.getSessionUser.mockResolvedValue({ id: "u1", email: "felix@meetcleo.com", name: "Felix" });
    mocks.getAgendaItems.mockResolvedValue(julyAgenda);
    mocks.single.mockResolvedValue({ data: { id: "event-dec-2026" }, error: null });
    mocks.eventsInsert.mockReturnValue({ select: () => ({ single: mocks.single }) });
    mocks.itemsInsert.mockResolvedValue({ error: null });
    mocks.deleteEq.mockResolvedValue({ error: null });
    mocks.eventsDelete.mockReturnValue({ eq: mocks.deleteEq });
    mocks.createClient.mockResolvedValue({
      from: (table: string) =>
        table === "events"
          ? { insert: mocks.eventsInsert, delete: mocks.eventsDelete }
          : { insert: mocks.itemsInsert },
    });
  });

  it("creates the event, copies the agenda and goes to the new event's admin page", async () => {
    await expect(createEvent(input)).rejects.toThrow("NEXT_REDIRECT /events/december-2026/admin");

    expect(mocks.eventsInsert).toHaveBeenCalledWith({
      slug: "december-2026",
      title: "FE DAY",
      tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
      event_date: "2026-12-01",
      start_time: "10:00",
      end_time: "16:00",
      location: "LION'S SHARE + REMOTE",
      created_by: "u1",
    });
    expect(mocks.getAgendaItems).toHaveBeenCalledWith(julyEvent.id);
    const copied = mocks.itemsInsert.mock.calls[0][0];
    expect(copied).toHaveLength(julyAgenda.length);
    expect(copied[0]).toEqual({
      event_id: "event-dec-2026",
      start_time: "10:00",
      end_time: "10:30",
      kind: "fixed",
      title: "Doors Open + Ice Breaker",
      description: julyAgenda[0].description,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/events");
  });

  it("starts with an empty agenda when no source is picked", async () => {
    await expect(createEvent({ ...input, copyAgendaFromEventId: "" })).rejects.toThrow("NEXT_REDIRECT");

    expect(mocks.getAgendaItems).not.toHaveBeenCalled();
    expect(mocks.itemsInsert).not.toHaveBeenCalled();
  });

  it("deletes the new event if copying the agenda fails", async () => {
    mocks.itemsInsert.mockResolvedValue({ error: { message: "boom" } });

    const result = await createEvent(input);

    expect(result).toMatchObject({ ok: false, errors: {} });
    expect(result.formError).toMatch(/Couldn't copy the agenda/);
    expect(mocks.deleteEq).toHaveBeenCalledWith("id", "event-dec-2026");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("reports a slug that's already taken against the slug field", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: "23505" } });

    const result = await createEvent(input);

    expect(result).toEqual({ ok: false, errors: { slug: "Another event already uses that slug." } });
    expect(mocks.itemsInsert).not.toHaveBeenCalled();
  });

  it("returns validation errors without touching the database", async () => {
    const result = await createEvent({ ...input, slug: "Not A Slug" });

    expect(result.errors.slug).toBeDefined();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("only lets organisers create events", async () => {
    mocks.isOrganiser.mockResolvedValue(false);

    const result = await createEvent(input);

    expect(result.formError).toBe("Only organisers can create events.");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
