import { describe, it, expect } from "vitest";
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from "@/lib/auth/domain";

describe("ALLOWED_EMAIL_DOMAIN", () => {
  it("is the Cleo email domain", () => {
    expect(ALLOWED_EMAIL_DOMAIN).toBe("meetcleo.com");
  });
});

describe("isAllowedEmail", () => {
  describe("allows", () => {
    const allowed: Array<[string, string]> = [
      ["a plain address on the domain", "ada@meetcleo.com"],
      ["an all-uppercase address (case-insensitive)", "ADA@MEETCLEO.COM"],
      ["a mixed-case address (case-insensitive)", "Ada@MeetCleo.com"],
      ["an address with surrounding whitespace", "  ada@meetcleo.com  "],
    ];

    it.each(allowed)("returns true for %s", (_label, email) => {
      expect(isAllowedEmail(email)).toBe(true);
    });
  });

  describe("rejects", () => {
    describe("missing or empty input", () => {
      const empties: Array<[string, string | null | undefined]> = [
        ["null", null],
        ["undefined", undefined],
        ["an empty string", ""],
        ["a whitespace-only string", "   "],
      ];

      it.each(empties)("returns false for %s", (_label, email) => {
        expect(isAllowedEmail(email)).toBe(false);
      });
    });

    describe("malformed addresses", () => {
      const malformed: Array<[string, string]> = [
        ["a string with no @ separator", "adameetcleo.com"],
      ];

      it.each(malformed)("returns false for %s", (_label, email) => {
        expect(isAllowedEmail(email)).toBe(false);
      });
    });

    describe("other domains", () => {
      const otherDomains: Array<[string, string]> = [
        ["an unrelated domain", "ada@gmail.com"],
        ["a substring lookalike domain", "ada@notmeetcleo.com"],
      ];

      it.each(otherDomains)("returns false for %s", (_label, email) => {
        expect(isAllowedEmail(email)).toBe(false);
      });
    });

    describe("suffix / prefix domain spoofing", () => {
      const spoofs: Array<[string, string]> = [
        ["a trailing-domain suffix attack", "ada@meetcleo.com.evil.com"],
        ["a prepended-name spoof", "ada@evilmeetcleo.com"],
      ];

      it.each(spoofs)("returns false for %s", (_label, email) => {
        expect(isAllowedEmail(email)).toBe(false);
      });
    });

    describe("subdomains", () => {
      const subdomains: Array<[string, string]> = [
        ["a generic subdomain", "ada@sub.meetcleo.com"],
        ["a mail subdomain", "ada@mail.meetcleo.com"],
      ];

      it.each(subdomains)("returns false for %s", (_label, email) => {
        expect(isAllowedEmail(email)).toBe(false);
      });
    });

    describe("missing local part", () => {
      // A real address requires a local part; the bare-domain form "@meetcleo.com"
      // is treated as invalid even though its domain matches.
      it("returns false for an address with an empty local part", () => {
        expect(isAllowedEmail("@meetcleo.com")).toBe(false);
      });
    });
  });
});
