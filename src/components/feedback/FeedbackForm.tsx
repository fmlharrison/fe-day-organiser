"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { AssignedTalk } from "@/lib/agenda";
import {
  isFeedbackValid,
  MAX_FEEDBACK_COMMENT_LENGTH,
  validateFeedback,
  type FeedbackInput,
  type FeedbackRating,
  type FeedbackResult,
  type FeedbackValidationErrors,
  type TalkFeedback,
} from "@/lib/feedback";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";

type FeedbackFormProps = {
  assignment: AssignedTalk;
  existingFeedback: TalkFeedback | null;
  saveAction: (input: FeedbackInput) => Promise<FeedbackResult>;
};

const RATINGS: FeedbackRating[] = [1, 2, 3, 4, 5];

export function FeedbackForm({
  assignment,
  existingFeedback,
  saveAction,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(
    existingFeedback?.rating ?? null,
  );
  const [comments, setComments] = useState(existingFeedback?.comments ?? "");
  const [errors, setErrors] = useState<FeedbackValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(existingFeedback !== null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: FeedbackInput = { rating, comments };
    const validationErrors = validateFeedback(input);

    if (!isFeedbackValid(validationErrors)) {
      setErrors(validationErrors);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const result = await saveAction(input);
      if (result.ok) {
        setRating(result.feedback.rating);
        setComments(result.feedback.comments ?? "");
        setSaved(true);
        setSuccess(true);
      } else {
        setErrors(result.errors);
        setFormError(result.formError ?? null);
      }
    } catch {
      setFormError("Couldn't save your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href="/agenda"
        className="pixel"
        style={{
          display: "inline-block",
          color: "var(--teal)",
          fontSize: 11,
          marginBottom: 16,
        }}
      >
        {"<"} BACK TO AGENDA
      </Link>

      <div style={{ marginBottom: 26 }}>
        <h1
          style={{
            fontSize: "clamp(24px,5vw,38px)",
            color: "var(--gold)",
            textShadow: "4px 4px 0 var(--shadow)",
          }}
        >
          TALK FEEDBACK
        </h1>
        <div
          className="txt"
          style={{ fontSize: 20, color: "var(--ink-dim)", marginTop: 12 }}
        >
          Rate the session and leave an optional note about the talk.
        </div>
      </div>

      <PixelFrame
        frame="var(--teal)"
        surface="var(--bg-2)"
        pad={22}
        style={{ marginBottom: 26 }}
      >
        <div className="pixel" style={{ fontSize: 9, color: "var(--teal)" }}>
          {assignment.slotId.toUpperCase()}
        </div>
        <h2 style={{ fontSize: 16, marginTop: 12 }}>{assignment.title}</h2>
        <div className="txt" style={{ marginTop: 10 }}>
          {assignment.description}
        </div>
        <div className="txt-sm" style={{ marginTop: 10 }}>
          {assignment.submitterName}, {assignment.team}
        </div>
      </PixelFrame>

      <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
        <PixelFrame surface="var(--panel)" pad={26}>
          <div className="stack" style={{ gap: 26 }}>
            <fieldset
              role="radiogroup"
              disabled={submitting}
              aria-required="true"
              aria-invalid={Boolean(errors.rating)}
              aria-describedby={errors.rating ? "rating-error" : undefined}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              <legend
                className="pixel"
                style={{ fontSize: 11, color: "var(--gold)", marginBottom: 14 }}
              >
                YOUR RATING *
              </legend>
              <div
                className="row"
                style={{ gap: "clamp(6px, 2vw, 14px)", flexWrap: "wrap" }}
              >
                {RATINGS.map((value) => (
                  <label
                    key={value}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: submitting ? "not-allowed" : "pointer",
                      color: rating !== null && value <= rating ? "var(--gold)" : "var(--ink-dim)",
                      fontSize: 30,
                    }}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      required
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      onChange={() => {
                        setRating(value);
                        setErrors((current) => ({ ...current, rating: undefined }));
                        setSuccess(false);
                      }}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <span aria-hidden="true">★</span>
                    <span className="pixel" style={{ fontSize: 9 }}>
                      {value}
                    </span>
                  </label>
                ))}
              </div>
              {errors.rating && (
                <div
                  id="rating-error"
                  role="alert"
                  className="txt-sm"
                  style={{ color: "var(--orange)", marginTop: 10 }}
                >
                  {errors.rating}
                </div>
              )}
            </fieldset>

            <div className="field">
              <label htmlFor="feedback-comments">COMMENTS (OPTIONAL)</label>
              <textarea
                id="feedback-comments"
                className="ta"
                maxLength={MAX_FEEDBACK_COMMENT_LENGTH}
                value={comments}
                disabled={submitting}
                aria-describedby={errors.comments ? "comments-count comments-error" : "comments-count"}
                aria-invalid={Boolean(errors.comments)}
                placeholder="What worked well? What could make the session even better?"
                onChange={(event) => {
                  setComments(event.target.value);
                  setErrors((current) => ({ ...current, comments: undefined }));
                  setSuccess(false);
                }}
              />
              <div id="comments-count" className="char-count">
                {comments.length}/{MAX_FEEDBACK_COMMENT_LENGTH}
              </div>
              {errors.comments && (
                <div
                  id="comments-error"
                  role="alert"
                  className="txt-sm"
                  style={{ color: "var(--orange)" }}
                >
                  {errors.comments}
                </div>
              )}
            </div>

            {submitting && (
              <div
                role="status"
                aria-live="polite"
                className="txt-sm"
                style={{ color: "var(--teal)" }}
              >
                Saving feedback...
              </div>
            )}
            {success && (
              <div
                role="status"
                className="txt-sm"
                style={{ color: "var(--teal)" }}
              >
                Feedback saved. You can update it at any time.
              </div>
            )}
            {formError && (
              <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
                {formError}
              </div>
            )}

            <div className="row between" style={{ gap: 16, flexWrap: "wrap" }}>
              <Link href="/agenda" className="btn ghost">
                BACK
              </Link>
              <Btn variant="teal lg" type="submit" disabled={submitting}>
                {submitting
                  ? "SAVING..."
                  : saved
                    ? "UPDATE FEEDBACK >"
                    : "SAVE FEEDBACK >"}
              </Btn>
            </div>
          </div>
        </PixelFrame>
      </form>
    </div>
  );
}
