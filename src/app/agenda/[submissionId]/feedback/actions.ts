"use server";

import { revalidatePath } from "next/cache";
import { getAssignmentsBySubmissionId } from "@/lib/agenda";
import { getSessionUser } from "@/lib/auth/user";
import { getCurrentEvent } from "@/lib/events.server";
import {
  isFeedbackValid,
  normalizeFeedbackComments,
  normalizeFeedbackRating,
  validateFeedback,
  type FeedbackInput,
  type FeedbackRating,
  type FeedbackResult,
} from "@/lib/feedback";
import { createClient } from "@/lib/supabase/server";

type SavedFeedbackRow = {
  submission_id: string;
  reviewer_id: string;
  rating: FeedbackRating;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

export async function saveFeedback(
  submissionId: string,
  input: FeedbackInput,
): Promise<FeedbackResult> {
  const errors = validateFeedback(input);
  if (!isFeedbackValid(errors)) {
    return { ok: false, errors };
  }

  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      errors: {},
      formError: "Your session expired. Please sign in again.",
    };
  }

  const event = await getCurrentEvent();
  const assignments = event ? await getAssignmentsBySubmissionId(event.id) : {};
  if (!Object.prototype.hasOwnProperty.call(assignments, submissionId)) {
    return {
      ok: false,
      errors: {},
      formError: "That talk is no longer assigned to the agenda.",
    };
  }

  const rating = normalizeFeedbackRating(input.rating);
  if (rating === null) {
    return { ok: false, errors: { rating: "Choose a rating from 1 to 5." } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talk_feedback")
    .upsert(
      {
        submission_id: submissionId,
        reviewer_id: user.id,
        rating,
        comments: normalizeFeedbackComments(input.comments),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "submission_id,reviewer_id" },
    )
    .select("submission_id, reviewer_id, rating, comments, created_at, updated_at")
    .single();

  if (error || !data) {
    return {
      ok: false,
      errors: {},
      formError: "Couldn't save your feedback. Please try again.",
    };
  }

  const row = data as SavedFeedbackRow;
  revalidatePath(`/agenda/${submissionId}/feedback`);

  return {
    ok: true,
    feedback: {
      submissionId: row.submission_id,
      reviewerId: row.reviewer_id,
      rating: row.rating,
      comments: row.comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  };
}
