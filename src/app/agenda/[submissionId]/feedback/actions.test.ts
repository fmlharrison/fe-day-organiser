import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedbackInput } from "@/lib/feedback";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  getAssignmentsBySubmissionId: vi.fn(),
  getSessionUser: vi.fn(),
  revalidatePath: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/auth/user", () => ({
  getSessionUser: mocks.getSessionUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/agenda", () => ({
  getAssignmentsBySubmissionId: mocks.getAssignmentsBySubmissionId,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import { saveFeedback as saveTalkFeedback } from "@/app/agenda/[submissionId]/feedback/actions";

const submissionId = "11111111-1111-4111-8111-111111111111";
const reviewerId = "22222222-2222-4222-8222-222222222222";
const route = `/agenda/${submissionId}/feedback`;

const assignment = {
  slotId: "talk-1",
  submissionId,
  title: "Type-safe CSS",
  description: "Making invalid styles impossible.",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk",
};

const savedRow = {
  submission_id: submissionId,
  reviewer_id: reviewerId,
  rating: 4,
  comments: "Useful examples.",
  created_at: "2026-09-11T09:00:00.000Z",
  updated_at: "2026-09-11T09:05:00.000Z",
};

describe("saveTalkFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionUser.mockResolvedValue({
      id: reviewerId,
      email: "reviewer@meetcleo.com",
      name: "Grace Reviewer",
    });
    mocks.getAssignmentsBySubmissionId.mockResolvedValue({
      [submissionId]: assignment,
    });
    mocks.single.mockResolvedValue({ data: savedRow, error: null });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.upsert.mockReturnValue({ select: mocks.select });
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.createClient.mockResolvedValue({ from: mocks.from });
  });

  it("short-circuits invalid input before authentication or persistence", async () => {
    const result = await saveTalkFeedback(submissionId, { rating: 0 });

    expect(result).toEqual({
      ok: false,
      errors: { rating: "Choose a rating from 1 to 5." },
    });
    expect(mocks.getSessionUser).not.toHaveBeenCalled();
    expect(mocks.getAssignmentsBySubmissionId).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an expired session before checking assignments", async () => {
    mocks.getSessionUser.mockResolvedValue(null);

    const result = await saveTalkFeedback(submissionId, { rating: 4 });

    expect(result).toEqual({
      ok: false,
      errors: {},
      formError: "Your session expired. Please sign in again.",
    });
    expect(mocks.getAssignmentsBySubmissionId).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects feedback for a talk that is not assigned to the agenda", async () => {
    const inheritedAssignment = Object.create({ [submissionId]: assignment });
    mocks.getAssignmentsBySubmissionId.mockResolvedValue(inheritedAssignment);

    const result = await saveTalkFeedback(submissionId, { rating: 4 });

    expect(result).toMatchObject({ ok: false, errors: {} });
    expect(result).toHaveProperty("formError");
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ["trims comments", "  Useful examples.  ", "Useful examples."],
    ["stores blank comments as null", " \n\t ", null],
  ])("%s", async (_case, comments, expectedComments) => {
    const input = {
      rating: 4,
      comments,
      reviewer_id: "forged-reviewer-id",
    } as FeedbackInput;

    await saveTalkFeedback(submissionId, input);

    expect(mocks.from).toHaveBeenCalledWith("talk_feedback");
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: submissionId,
        reviewer_id: reviewerId,
        rating: 4,
        comments: expectedComments,
      }),
      { onConflict: "submission_id,reviewer_id" },
    );
    expect(mocks.upsert.mock.calls[0][0]).not.toHaveProperty(
      "reviewer_id",
      "forged-reviewer-id",
    );
  });

  it("selects, maps, and returns the saved feedback row", async () => {
    const result = await saveTalkFeedback(submissionId, {
      rating: 4,
      comments: "Useful examples.",
    });

    expect(mocks.select).toHaveBeenCalledTimes(1);
    expect(mocks.single).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      ok: true,
      feedback: {
        submissionId,
        reviewerId,
        rating: 4,
        comments: "Useful examples.",
        createdAt: "2026-09-11T09:00:00.000Z",
        updatedAt: "2026-09-11T09:05:00.000Z",
      },
    });
  });

  it("returns a form error when Supabase cannot save the feedback", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
    });

    const result = await saveTalkFeedback(submissionId, { rating: 4 });

    expect(result).toEqual({
      ok: false,
      errors: {},
      formError: "Couldn't save your feedback. Please try again.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates exactly the saved feedback route", async () => {
    await saveTalkFeedback(submissionId, { rating: 4 });

    expect(mocks.revalidatePath).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(route);
  });
});
