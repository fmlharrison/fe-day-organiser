import { describe, it, expect } from "vitest";
import {
  validateSubmission,
  isValid,
  type TalkSubmissionInput,
} from "@/lib/validation";

// A baseline that passes every rule. Individual tests clone and break one field
// at a time so a failure points precisely at the rule under test.
const validInput: TalkSubmissionInput = {
  type: "talk",
  title: "A good title",
  description: "Ten or more characters here",
  name: "Ada Pixel",
  team: "Web Platform",
};

const withField = (
  patch: Partial<TalkSubmissionInput>,
): TalkSubmissionInput => ({ ...validInput, ...patch });

describe("validateSubmission", () => {
  describe("a fully valid submission", () => {
    it("returns no errors", () => {
      expect(validateSubmission(validInput)).toEqual({});
    });

    it("is considered valid", () => {
      expect(isValid(validateSubmission(validInput))).toBe(true);
    });
  });

  describe("type", () => {
    // Allowed type ids come straight from the data module's union.
    it.each([
      ["lightning"],
      ["talk"],
      ["workshop"],
    ])("accepts the known type %s", (type) => {
      const errors = validateSubmission(withField({ type }));
      expect(errors).not.toHaveProperty("type");
    });

    it.each([
      ["empty string", ""],
      ["unknown id", "nope"],
      ["whitespace", "   "],
    ])("rejects an invalid type (%s)", (_label, type) => {
      const errors = validateSubmission(withField({ type }));
      expect(errors).toHaveProperty("type");
      expect(isValid(errors)).toBe(false);
    });
  });

  describe("title", () => {
    it("rejects a whitespace-only title", () => {
      const errors = validateSubmission(withField({ title: "   " }));
      expect(errors).toHaveProperty("title");
      expect(isValid(errors)).toBe(false);
    });

    it("rejects an empty title", () => {
      const errors = validateSubmission(withField({ title: "" }));
      expect(errors).toHaveProperty("title");
    });

    it("accepts a title of exactly 70 characters (upper boundary)", () => {
      const errors = validateSubmission(withField({ title: "a".repeat(70) }));
      expect(errors).not.toHaveProperty("title");
    });

    it("rejects a title of 71 characters (over the boundary)", () => {
      const errors = validateSubmission(withField({ title: "a".repeat(71) }));
      expect(errors).toHaveProperty("title");
    });
  });

  describe("description", () => {
    it("rejects a description shorter than 10 characters after trim", () => {
      const errors = validateSubmission(withField({ description: "short" }));
      expect(errors).toHaveProperty("description");
      expect(isValid(errors)).toBe(false);
    });

    it("accepts a description of exactly 10 characters (lower boundary)", () => {
      const errors = validateSubmission(
        withField({ description: "a".repeat(10) }),
      );
      expect(errors).not.toHaveProperty("description");
    });

    it("rejects a description of 401 characters (over the boundary)", () => {
      const errors = validateSubmission(
        withField({ description: "a".repeat(401) }),
      );
      expect(errors).toHaveProperty("description");
    });

    it("accepts a description of exactly 400 characters (upper boundary)", () => {
      const errors = validateSubmission(
        withField({ description: "a".repeat(400) }),
      );
      expect(errors).not.toHaveProperty("description");
    });
  });

  describe("name", () => {
    it("rejects a whitespace-only name", () => {
      const errors = validateSubmission(withField({ name: "   " }));
      expect(errors).toHaveProperty("name");
      expect(isValid(errors)).toBe(false);
    });

    it("rejects an empty name", () => {
      const errors = validateSubmission(withField({ name: "" }));
      expect(errors).toHaveProperty("name");
    });
  });

  describe("team", () => {
    it("rejects an empty team", () => {
      const errors = validateSubmission(withField({ team: "" }));
      expect(errors).toHaveProperty("team");
      expect(isValid(errors)).toBe(false);
    });

    it("rejects a whitespace-only team", () => {
      const errors = validateSubmission(withField({ team: "   " }));
      expect(errors).toHaveProperty("team");
    });
  });

  describe("a fully invalid submission", () => {
    const emptyInput: TalkSubmissionInput = {
      type: "",
      title: "",
      description: "",
      name: "",
      team: "",
    };

    it("reports an error on every field", () => {
      const errors = validateSubmission(emptyInput);
      expect(errors).toHaveProperty("type");
      expect(errors).toHaveProperty("title");
      expect(errors).toHaveProperty("description");
      expect(errors).toHaveProperty("name");
      expect(errors).toHaveProperty("team");
    });

    it("is not valid", () => {
      expect(isValid(validateSubmission(emptyInput))).toBe(false);
    });
  });
});

describe("isValid", () => {
  it("treats an empty error object as valid", () => {
    expect(isValid({})).toBe(true);
  });

  it("treats an object with any error key as invalid", () => {
    expect(isValid({ title: "Give your talk a title." })).toBe(false);
  });
});
