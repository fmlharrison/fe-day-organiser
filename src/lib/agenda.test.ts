import { describe, it, expect } from "vitest";
import {
  getOpenSlots,
  resolveAgendaRow,
  validateAssignment,
  getRemainingOpenSlotCount,
  isPitchingClosed,
} from "@/lib/agenda";
import type { AssignedTalk } from "@/lib/agenda";
import type { TalkTypeId } from "@/lib/feday-data";
import { julyAgenda } from "@/test/fixtures";

const items = julyAgenda;
const openSlots = getOpenSlots(items);
const talkSlot = items.find((row) => row.id === "talk-1")!;

const sampleAssignment: AssignedTalk = {
  slotId: "talk-1",
  submissionId: "sub-1",
  title: "Deleting 40% Of Our CSS",
  description: "A story about shipping less CSS.",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk",
};

describe("resolveAgendaRow", () => {
  it("keeps placeholder content for an open unassigned slot", () => {
    const resolved = resolveAgendaRow(talkSlot, undefined, true);
    expect(resolved.title).toBe("Talk Slot #1");
    expect(resolved.desc).toBe(talkSlot.description);
    expect(resolved.showClaimLink).toBe(true);
    expect(resolved.speaker).toBeUndefined();
  });

  it("shows submission details for a filled open slot", () => {
    const resolved = resolveAgendaRow(talkSlot, sampleAssignment, true);
    expect(resolved.title).toBe("Deleting 40% Of Our CSS");
    expect(resolved.desc).toBe("A story about shipping less CSS.");
    expect(resolved.speaker).toBe("Ada Pixel, Web Platform");
    expect(resolved.showClaimLink).toBe(false);
    expect(resolved.isFilled).toBe(true);
  });

  it("never shows a claim link on closed rows", () => {
    const lunch = items.find((row) => row.title === "Lunch")!;
    const resolved = resolveAgendaRow(lunch, undefined, false);
    expect(resolved.showClaimLink).toBe(false);
    expect(resolved.title).toBe("Lunch");
  });
});

describe("validateAssignment", () => {
  it("rejects unknown slot ids", () => {
    const result = validateAssignment({
      slotId: "missing",
      submissionId: "sub-1",
      submissionType: "talk",
      items,
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "That agenda slot doesn't exist." });
  });

  it("rejects agenda items that aren't open for talks", () => {
    const result = validateAssignment({
      slotId: "lunch",
      submissionId: "sub-1",
      submissionType: "talk",
      items,
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "That agenda slot isn't open for talks." });
  });

  it("rejects type mismatches", () => {
    const result = validateAssignment({
      slotId: "talk-1",
      submissionId: "sub-1",
      submissionType: "lightning",
      items,
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "Talk type doesn't match the slot type." });
  });

  it("rejects an already taken slot", () => {
    const result = validateAssignment({
      slotId: "talk-1",
      submissionId: "sub-2",
      submissionType: "talk",
      items,
      assignmentsBySlot: { "talk-1": sampleAssignment },
    });
    expect(result).toEqual({ ok: false, formError: "That slot is already taken." });
  });

  it("rejects a submission that is already assigned elsewhere", () => {
    const result = validateAssignment({
      slotId: "talk-2",
      submissionId: "sub-1",
      submissionType: "talk",
      items,
      assignmentsBySlot: { "talk-1": sampleAssignment },
    });
    expect(result).toEqual({
      ok: false,
      formError: "This submission is already on the agenda. Remove it first to reassign.",
    });
  });

  it("accepts a valid assignment", () => {
    const result = validateAssignment({
      slotId: "talk-1",
      submissionId: "sub-1",
      submissionType: "talk",
      items,
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("getOpenSlots", () => {
  it("returns the eight talk and lightning slots", () => {
    expect(openSlots.map((slot) => slot.id)).toEqual([
      "talk-1",
      "talk-2",
      "talk-3",
      "lightning-1",
      "lightning-2",
      "lightning-3",
      "lightning-4",
      "lightning-5",
    ]);
  });

  it("excludes workshop items", () => {
    const workshop = { ...talkSlot, id: "workshop-1", kind: "workshop" as const };
    expect(getOpenSlots([workshop])).toEqual([]);
  });
});

describe("getRemainingOpenSlotCount", () => {
  it("returns all open slots when nothing is assigned", () => {
    expect(getRemainingOpenSlotCount(items, {})).toBe(8);
  });

  it("subtracts filled open slots from the open total", () => {
    expect(getRemainingOpenSlotCount(items, { "talk-1": sampleAssignment })).toBe(7);
  });
});

describe("isPitchingClosed", () => {
  it("returns false when open slots remain", () => {
    expect(isPitchingClosed(items, {})).toBe(false);
    expect(isPitchingClosed(items, { "talk-1": sampleAssignment })).toBe(false);
  });

  it("returns true when every open slot is assigned", () => {
    const filled = Object.fromEntries(
      openSlots.map((slot, i) => [
        slot.id,
        { ...sampleAssignment, slotId: slot.id, submissionId: `sub-${i}`, type: slot.kind as TalkTypeId },
      ]),
    );
    expect(isPitchingClosed(items, filled)).toBe(true);
  });
});
