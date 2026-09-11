export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type TalkFeedback = {
  submissionId: string;
  reviewerId: string;
  rating: FeedbackRating;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackInput = {
  rating?: unknown;
  comments?: unknown;
};

export type FeedbackValidationErrors = Partial<Record<"rating" | "comments", string>>;

export type FeedbackResult =
  | { ok: true; feedback: TalkFeedback }
  | { ok: false; errors: FeedbackValidationErrors; formError?: string };

export const MAX_FEEDBACK_COMMENT_LENGTH = 1000;

export function normalizeFeedbackRating(value: unknown): FeedbackRating | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5
    ? (value as FeedbackRating)
    : null;
}

export function normalizeFeedbackComments(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export function validateFeedback(input: FeedbackInput): FeedbackValidationErrors {
  const errors: FeedbackValidationErrors = {};
  const rating = normalizeFeedbackRating(input.rating);
  const comments = normalizeFeedbackComments(input.comments);

  if (rating === null) {
    errors.rating = "Choose a rating from 1 to 5.";
  }

  if (input.comments != null && typeof input.comments !== "string") {
    errors.comments = "Comments must be text.";
  } else if (comments && comments.length > MAX_FEEDBACK_COMMENT_LENGTH) {
    errors.comments = `Keep comments under ${MAX_FEEDBACK_COMMENT_LENGTH} characters.`;
  }

  return errors;
}

export function isFeedbackValid(errors: FeedbackValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
