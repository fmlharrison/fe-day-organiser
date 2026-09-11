import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  eq: vi.fn(),
  from: vi.fn(),
  maybeSingle: vi.fn(),
  select: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { getFeedbackForReviewer } from "@/lib/feedback.server";

const submissionId = "11111111-1111-4111-8111-111111111111";
const reviewerId = "22222222-2222-4222-8222-222222222222";

describe("getFeedbackForReviewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      eq: mocks.eq,
      maybeSingle: mocks.maybeSingle,
      select: mocks.select,
    };
    mocks.select.mockReturnValue(query);
    mocks.eq.mockReturnValue(query);
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.from.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("filters feedback by both submission and reviewer", async () => {
    await getFeedbackForReviewer(submissionId, reviewerId);

    expect(mocks.from).toHaveBeenCalledWith("talk_feedback");
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "submission_id", submissionId);
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "reviewer_id", reviewerId);
    expect(mocks.maybeSingle).toHaveBeenCalledTimes(1);
  });
});
