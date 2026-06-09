import { describe, it, expect } from "vitest";
import {
  resolveAgendaRow,
  validateAssignment,
  getRemainingOpenSlotCount,
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

  it("subtracts filled slots from the open total", () => {
    expect(getRemainingOpenSlotCount({ "talk-1": sampleAssignment })).toBe(
      OPEN_AGENDA_SLOTS.length - 1,
    );
  });
});

describe("getOpenSlotsForType", () => {
  it("returns four talk slots", () => {
    expect(getOpenSlotsForType("talk")).toHaveLength(4);
  });

  it("returns four lightning slots", () => {
    expect(getOpenSlotsForType("lightning")).toHaveLength(4);
  });

  it("returns one workshop slot", () => {
    expect(getOpenSlotsForType("workshop")).toHaveLength(1);
  });
});
