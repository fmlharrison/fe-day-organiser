import { describe, expect, it } from "vitest";
import {
  MAX_FEEDBACK_COMMENT_LENGTH,
  isFeedbackValid,
  normalizeFeedbackComments,
  validateFeedback,
} from "@/lib/feedback";

describe("validateFeedback", () => {
  describe("rating", () => {
    it.each([1, 2, 3, 4, 5])("accepts %s", (rating) => {
      const errors = validateFeedback({ rating });

      expect(errors).not.toHaveProperty("rating");
      expect(isFeedbackValid(errors)).toBe(true);
    });

    it("rejects a missing rating", () => {
      const errors = validateFeedback({});

      expect(errors).toHaveProperty("rating");
      expect(isFeedbackValid(errors)).toBe(false);
    });

    it.each([
      ["empty string", ""],
      ["numeric string", "3"],
      ["non-number", "good"],
      ["NaN", Number.NaN],
      ["positive infinity", Number.POSITIVE_INFINITY],
      ["negative infinity", Number.NEGATIVE_INFINITY],
      ["fraction", 2.5],
      ["below the minimum", 0],
      ["above the maximum", 6],
    ])("rejects %s", (_label, rating) => {
      const errors = validateFeedback({ rating });

      expect(errors).toHaveProperty("rating");
      expect(isFeedbackValid(errors)).toBe(false);
    });
  });

  describe("comments", () => {
    it("accepts omitted comments", () => {
      const errors = validateFeedback({ rating: 3 });

      expect(errors).not.toHaveProperty("comments");
      expect(isFeedbackValid(errors)).toBe(true);
    });

    it.each(["", "   "])("accepts optional comments %#", (comments) => {
      expect(validateFeedback({ rating: 3, comments })).not.toHaveProperty(
        "comments",
      );
    });

    it("accepts exactly the maximum length after trimming", () => {
      const comments = `  ${"a".repeat(MAX_FEEDBACK_COMMENT_LENGTH)}  `;

      expect(validateFeedback({ rating: 3, comments })).not.toHaveProperty(
        "comments",
      );
    });

    it("rejects one character over the maximum after trimming", () => {
      const comments = `  ${"a".repeat(MAX_FEEDBACK_COMMENT_LENGTH + 1)}  `;

      expect(validateFeedback({ rating: 3, comments })).toHaveProperty(
        "comments",
      );
    });
  });
});

describe("MAX_FEEDBACK_COMMENT_LENGTH", () => {
  it("is 1000 characters", () => {
    expect(MAX_FEEDBACK_COMMENT_LENGTH).toBe(1000);
  });
});

describe("normalizeFeedbackComments", () => {
  it("trims comments for persistence", () => {
    expect(normalizeFeedbackComments(" \n\tUseful event\r ")).toBe("Useful event");
  });

  it.each(["", "  \n\t  "])(
    "normalizes empty or whitespace-only comments to null",
    (comments) => {
      expect(normalizeFeedbackComments(comments)).toBeNull();
    },
  );
});

describe("isFeedbackValid", () => {
  it("treats an empty error object as valid", () => {
    expect(isFeedbackValid({})).toBe(true);
  });

  it("treats any validation error as invalid", () => {
    expect(isFeedbackValid({ rating: "Choose a rating." })).toBe(false);
  });
});
