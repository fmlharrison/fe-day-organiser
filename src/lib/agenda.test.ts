import { describe, it, expect } from "vitest";
import {
  resolveAgendaRow,
  validateAssignment,
  getRemainingOpenSlotCount,
  isPitchingClosed,
  getOrphanedAssignments,
} from "@/lib/agenda";
import { AGENDA, OPEN_AGENDA_SLOTS, getOpenSlotsForType } from "@/lib/feday-data";
import type { AssignedTalk } from "@/lib/agenda";

const talkSlot = AGENDA.find((row) => row.id === "talk-1")!;

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
    expect(resolved.desc).toBe(talkSlot.desc);
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
    const lunch = AGENDA.find((row) => row.title === "Lunch")!;
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
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "That agenda slot doesn't exist." });
  });

  it("rejects legacy slot ids", () => {
    const result = validateAssignment({
      slotId: "workshop-1",
      submissionId: "sub-1",
      submissionType: "workshop",
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "That agenda slot is no longer available." });
  });

  it("rejects type mismatches", () => {
    const result = validateAssignment({
      slotId: "talk-1",
      submissionId: "sub-1",
      submissionType: "lightning",
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: false, formError: "Talk type doesn't match the slot type." });
  });

  it("rejects an already taken slot", () => {
    const result = validateAssignment({
      slotId: "talk-1",
      submissionId: "sub-2",
      submissionType: "talk",
      assignmentsBySlot: { "talk-1": sampleAssignment },
    });
    expect(result).toEqual({ ok: false, formError: "That slot is already taken." });
  });

  it("rejects a submission that is already assigned elsewhere", () => {
    const result = validateAssignment({
      slotId: "talk-2",
      submissionId: "sub-1",
      submissionType: "talk",
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
      assignmentsBySlot: {},
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("getRemainingOpenSlotCount", () => {
  it("returns all open slots when nothing is assigned", () => {
    expect(getRemainingOpenSlotCount({})).toBe(OPEN_AGENDA_SLOTS.length);
  });

  it("subtracts filled open slots from the open total", () => {
    expect(getRemainingOpenSlotCount({ "talk-1": sampleAssignment })).toBe(
      OPEN_AGENDA_SLOTS.length - 1,
    );
  });

  it("ignores assignments to legacy slots", () => {
    expect(
      getRemainingOpenSlotCount({
        "workshop-1": { ...sampleAssignment, slotId: "workshop-1", type: "workshop" },
      }),
    ).toBe(OPEN_AGENDA_SLOTS.length);
  });
});

describe("isPitchingClosed", () => {
  it("returns false when open slots remain", () => {
    expect(isPitchingClosed({})).toBe(false);
    expect(isPitchingClosed({ "talk-1": sampleAssignment })).toBe(false);
  });

  it("returns true when every open slot is assigned", () => {
    const filled = Object.fromEntries(
      OPEN_AGENDA_SLOTS.map((slot, i) => [
        slot.id,
        { ...sampleAssignment, slotId: slot.id, submissionId: `sub-${i}`, type: slot.kind },
      ]),
    );
    expect(isPitchingClosed(filled)).toBe(true);
  });
});

describe("getOrphanedAssignments", () => {
  it("returns assignments on retired slot ids", () => {
    const orphaned = getOrphanedAssignments({
      "talk-1": sampleAssignment,
      "talk-4": { ...sampleAssignment, slotId: "talk-4", submissionId: "sub-2" },
    });
    expect(orphaned).toHaveLength(1);
    expect(orphaned[0]?.slotId).toBe("talk-4");
  });
});

describe("getOpenSlotsForType", () => {
  it("returns three talk slots", () => {
    expect(getOpenSlotsForType("talk")).toHaveLength(3);
  });

  it("returns five lightning slots", () => {
    expect(getOpenSlotsForType("lightning")).toHaveLength(5);
  });

  it("returns no workshop slots", () => {
    expect(getOpenSlotsForType("workshop")).toHaveLength(0);
  });
});
