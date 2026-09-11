import { createClient } from "@/lib/supabase/server";
import type { FeedbackRating, TalkFeedback } from "@/lib/feedback";

type FeedbackRow = {
  submission_id: string;
  reviewer_id: string;
  rating: FeedbackRating;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

function mapFeedbackRow(row: FeedbackRow): TalkFeedback {
  return {
    submissionId: row.submission_id,
    reviewerId: row.reviewer_id,
    rating: row.rating,
    comments: row.comments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getFeedbackForReviewer(
  submissionId: string,
  reviewerId: string,
): Promise<TalkFeedback | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talk_feedback")
    .select("submission_id, reviewer_id, rating, comments, created_at, updated_at")
    .eq("submission_id", submissionId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();

  if (error) throw error;

  return data ? mapFeedbackRow(data as FeedbackRow) : null;
}
