import { describe, it, expect } from "vitest";
import {
  ATTENDANCE_MODE_IDS,
  attendanceModeColor,
  formatAttendanceMode,
  isAttendanceMode,
  partitionAttendees,
  type AttendanceRecord,
} from "@/lib/attendance";

const sampleAttendees: AttendanceRecord[] = [
  {
    userId: "u1",
    attendeeName: "Ada Pixel",
    attendeeEmail: "ada@meetcleo.com",
    mode: "in_person",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    userId: "u2",
    attendeeName: "Bea Byte",
    attendeeEmail: "bea@meetcleo.com",
    mode: "remote",
    updatedAt: "2026-06-02T10:00:00.000Z",
  },
];

describe("attendance", () => {
  describe("isAttendanceMode", () => {
    it("accepts in_person and remote", () => {
      expect(isAttendanceMode("in_person")).toBe(true);
      expect(isAttendanceMode("remote")).toBe(true);
    });

    it("rejects unknown modes", () => {
      expect(isAttendanceMode("hybrid")).toBe(false);
      expect(isAttendanceMode("")).toBe(false);
    });

    it("covers every configured mode id", () => {
      for (const id of ATTENDANCE_MODE_IDS) {
        expect(isAttendanceMode(id)).toBe(true);
      }
    });
  });

  describe("formatAttendanceMode", () => {
    it("maps modes to display labels", () => {
      expect(formatAttendanceMode("in_person")).toBe("IN PERSON");
      expect(formatAttendanceMode("remote")).toBe("REMOTE");
    });
  });

  describe("attendanceModeColor", () => {
    it("returns a theme color for each mode", () => {
      expect(attendanceModeColor("in_person")).toBe("var(--teal)");
      expect(attendanceModeColor("remote")).toBe("var(--gold)");
    });
  });

  describe("partitionAttendees", () => {
    it("returns null mine and empty others when no one has RSVP'd", () => {
      expect(partitionAttendees([], "u1")).toEqual({ mine: null, others: [] });
    });

    it("returns only mine when the current user is the sole attendee", () => {
      const result = partitionAttendees([sampleAttendees[0]], "u1");
      expect(result.mine).toEqual(sampleAttendees[0]);
      expect(result.others).toEqual([]);
    });

    it("splits the current user from everyone else", () => {
      const result = partitionAttendees(sampleAttendees, "u1");
      expect(result.mine).toEqual(sampleAttendees[0]);
      expect(result.others).toEqual([sampleAttendees[1]]);
    });

    it("returns null mine when the current user has not RSVP'd", () => {
      const result = partitionAttendees(sampleAttendees, "u3");
      expect(result.mine).toBeNull();
      expect(result.others).toEqual(sampleAttendees);
    });
  });
});
