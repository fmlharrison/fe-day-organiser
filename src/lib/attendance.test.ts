import { describe, it, expect } from "vitest";
import {
  ATTENDANCE_MODE_IDS,
  attendanceModeColor,
  formatAttendanceMode,
  isAttendanceMode,
} from "@/lib/attendance";

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
});
