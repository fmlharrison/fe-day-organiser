import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  feedbackForm: vi.fn(() => null),
  getAgendaItems: vi.fn(),
  getAssignmentsBySubmissionId: vi.fn(),
  getFeedbackForReviewer: vi.fn(),
  isOrganiser: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  requireCurrentEvent: vi.fn(),
  requireUser: vi.fn(),
  topBar: vi.fn(() => null),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/app/auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("@/app/agenda/[submissionId]/feedback/actions", () => ({
  saveFeedback: vi.fn(),
}));
vi.mock("@/components/agenda/TopBar", () => ({ TopBar: mocks.topBar }));
vi.mock("@/components/feedback/FeedbackForm", () => ({
  FeedbackForm: mocks.feedbackForm,
}));
vi.mock("@/lib/agenda", () => ({
  getAssignmentsBySubmissionId: mocks.getAssignmentsBySubmissionId,
}));
vi.mock("@/lib/auth/user", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/events.server", () => ({
  getAgendaItems: mocks.getAgendaItems,
  requireCurrentEvent: mocks.requireCurrentEvent,
}));
vi.mock("@/lib/feedback.server", () => ({
  getFeedbackForReviewer: mocks.getFeedbackForReviewer,
}));
vi.mock("@/lib/submissions", () => ({ isOrganiser: mocks.isOrganiser }));

import FeedbackPage from "@/app/agenda/[submissionId]/feedback/page";
import { julyAgenda, julyEvent } from "@/test/fixtures";

const submissionId = "11111111-1111-4111-8111-111111111111";
const reviewer = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "reviewer@meetcleo.com",
  name: "Grace Reviewer",
};
const assignment = {
  slotId: "talk-1",
  submissionId,
  title: "Type-safe CSS",
  description: "Making invalid styles impossible.",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk",
};

describe("FeedbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue(reviewer);
    mocks.requireCurrentEvent.mockResolvedValue(julyEvent);
    mocks.getAgendaItems.mockResolvedValue(julyAgenda);
    mocks.getAssignmentsBySubmissionId.mockResolvedValue({
      [submissionId]: assignment,
    });
    mocks.isOrganiser.mockResolvedValue(false);
    mocks.getFeedbackForReviewer.mockResolvedValue(null);
  });

  it("requires a user and loads feedback for the session reviewer", async () => {
    render(await FeedbackPage({ params: Promise.resolve({ submissionId }) }));

    expect(mocks.requireUser).toHaveBeenCalledTimes(1);
    expect(mocks.getFeedbackForReviewer).toHaveBeenCalledWith(
      submissionId,
      reviewer.id,
    );
    expect(mocks.feedbackForm).toHaveBeenCalledWith(
      expect.objectContaining({ assignment, slotLabel: "Talk Slot #1", existingFeedback: null }),
      undefined,
    );
  });

  it("returns not found for a submission inherited from the assignment map", async () => {
    mocks.getAssignmentsBySubmissionId.mockResolvedValue(
      Object.create({ [submissionId]: assignment }),
    );

    await expect(
      FeedbackPage({ params: Promise.resolve({ submissionId }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalledTimes(1);
    expect(mocks.getFeedbackForReviewer).not.toHaveBeenCalled();
  });
});
