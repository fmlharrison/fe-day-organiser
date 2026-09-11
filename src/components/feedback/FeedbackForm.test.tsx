import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import type {
  FeedbackInput,
  FeedbackResult,
  TalkFeedback,
} from "@/lib/feedback";
import type { AssignedTalk } from "@/lib/agenda";

const submissionId = "11111111-1111-4111-8111-111111111111";

type SaveAction = (input: FeedbackInput) => Promise<FeedbackResult>;

const assignment: AssignedTalk = {
  slotId: "talk-1",
  submissionId,
  title: "Type-safe CSS",
  description: "Making invalid styles impossible.",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk",
};

function feedback(overrides: Partial<TalkFeedback> = {}): TalkFeedback {
  return {
    submissionId,
    reviewerId: "22222222-2222-4222-8222-222222222222",
    rating: 4,
    comments: null,
    createdAt: "2026-09-11T09:00:00.000Z",
    updatedAt: "2026-09-11T09:00:00.000Z",
    ...overrides,
  };
}

function renderForm(
  saveAction: SaveAction = vi.fn<SaveAction>(),
  initialFeedback: TalkFeedback | null = null,
) {
  return render(
    <FeedbackForm
      assignment={assignment}
      existingFeedback={initialFeedback}
      saveAction={saveAction}
    />,
  );
}

describe("FeedbackForm", () => {
  it("exposes five accessible rating controls", () => {
    renderForm();

    const group = screen.getByRole("radiogroup", { name: /rating/i });
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "false");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);

    for (const rating of [1, 2, 3, 4, 5]) {
      const radio = screen.getByRole("radio", {
        name: new RegExp(`${rating} stars?`, "i"),
      });
      expect(radio).toBeRequired();
      expect(radio).toHaveClass("star-rating-input");
    }
  });

  it("fills the selected star and every star to its left", async () => {
    const user = userEvent.setup();
    const saveAction = vi
      .fn<SaveAction>()
      .mockResolvedValue({ ok: true, feedback: feedback({ rating: 3 }) });
    renderForm(saveAction);
    const radios = screen.getAllByRole("radio");

    for (const radio of radios) {
      expect(radio.closest("label")).not.toHaveClass("selected");
      expect(radio.nextElementSibling).toHaveTextContent("☆");
    }

    await user.click(screen.getByRole("radio", { name: /3 stars/i }));

    for (const [index, radio] of radios.entries()) {
      if (index < 3) {
        expect(radio.closest("label")).toHaveClass("selected");
        expect(radio.nextElementSibling).toHaveTextContent("★");
      } else {
        expect(radio.closest("label")).not.toHaveClass("selected");
        expect(radio.nextElementSibling).toHaveTextContent("☆");
      }
    }

    await user.click(screen.getByRole("button", { name: /save feedback/i }));
    expect(saveAction).toHaveBeenCalledWith({ rating: 3, comments: "" });
  });

  it("does not submit without a rating and shows validation", async () => {
    const user = userEvent.setup();
    const saveAction = vi.fn<SaveAction>();
    renderForm(saveAction);

    await user.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(saveAction).not.toHaveBeenCalled();
    const error = screen.getByText("Choose a rating from 1 to 5.");
    expect(error).toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: /rating/i });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", error.id);
  });

  it("submits a rating when optional comments are empty", async () => {
    const user = userEvent.setup();
    const savedFeedback = feedback({ rating: 5 });
    const saveAction = vi
      .fn<SaveAction>()
      .mockResolvedValue({ ok: true, feedback: savedFeedback });
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /5 stars/i }));
    await user.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(saveAction).toHaveBeenCalledWith({
      rating: 5,
      comments: "",
    });
  });

  it("passes comments to the save action", async () => {
    const user = userEvent.setup();
    const savedFeedback = feedback({ rating: 3, comments: "Clear examples." });
    const saveAction = vi
      .fn<SaveAction>()
      .mockResolvedValue({ ok: true, feedback: savedFeedback });
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /3 stars/i }));
    await user.type(screen.getByRole("textbox", { name: /comments/i }), "Clear examples.");
    await user.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(saveAction).toHaveBeenCalledWith({
      rating: 3,
      comments: "Clear examples.",
    });
  });

  it("prefills existing feedback and uses update wording", () => {
    renderForm(vi.fn<SaveAction>(), feedback({ comments: "Already reviewed." }));

    expect(screen.getByRole("radio", { name: /4 stars/i })).toBeChecked();
    expect(screen.getByRole("textbox", { name: /comments/i })).toHaveValue(
      "Already reviewed.",
    );
    expect(screen.getByRole("button", { name: /update feedback/i })).toBeInTheDocument();
  });

  it("allows existing comments to be cleared", async () => {
    const user = userEvent.setup();
    const saveAction = vi
      .fn<SaveAction>()
      .mockResolvedValue({ ok: true, feedback: feedback({ comments: null }) });
    renderForm(saveAction, feedback({ comments: "Remove this." }));

    await user.clear(screen.getByRole("textbox", { name: /comments/i }));
    await user.click(screen.getByRole("button", { name: /update feedback/i }));

    expect(saveAction).toHaveBeenCalledWith({
      rating: 4,
      comments: "",
    });
  });

  it("shows an action error", async () => {
    const user = userEvent.setup();
    const saveAction = vi.fn<SaveAction>().mockResolvedValue({
      ok: false,
      errors: {},
      formError: "Feedback is unavailable right now.",
    });
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /2 stars/i }));
    await user.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(
      await screen.findByText("Feedback is unavailable right now."),
    ).toBeInTheDocument();
  });

  it("shows success without replacing or locking the editable form", async () => {
    const user = userEvent.setup();
    const saveAction = vi.fn<SaveAction>().mockResolvedValue({
      ok: true,
      feedback: feedback({ rating: 5, comments: "Excellent." }),
    });
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /5 stars/i }));
    const comments = screen.getByRole("textbox", { name: /comments/i });
    await user.type(comments, "Excellent.");
    await user.click(screen.getByRole("button", { name: /save feedback/i }));

    expect(await screen.findByText(/feedback saved/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /5 stars/i })).toBeEnabled();
    expect(comments).toBeEnabled();

    await user.type(comments, " Updated");
    expect(comments).toHaveValue("Excellent. Updated");
    expect(screen.queryByText(/feedback saved/i)).not.toBeInTheDocument();
  });

  it("clears saved status when the rating changes", async () => {
    const user = userEvent.setup();
    const saveAction = vi.fn<SaveAction>().mockResolvedValue({
      ok: true,
      feedback: feedback({ rating: 4 }),
    });
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /4 stars/i }));
    await user.click(screen.getByRole("button", { name: /save feedback/i }));
    expect(await screen.findByText(/feedback saved/i)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /3 stars/i }));
    expect(screen.queryByText(/feedback saved/i)).not.toBeInTheDocument();
  });

  it("disables duplicate submissions while a save is pending", async () => {
    const user = userEvent.setup();
    let resolveSave!: (result: FeedbackResult) => void;
    const pendingSave = new Promise<FeedbackResult>((resolve) => {
      resolveSave = resolve;
    });
    const saveAction = vi.fn<SaveAction>().mockReturnValue(pendingSave);
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /4 stars/i }));
    const submit = screen.getByRole("button", { name: /save feedback/i });
    await user.click(submit);

    expect(submit).toBeDisabled();
    expect(submit.closest("form")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Saving feedback...");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
    expect(saveAction).toHaveBeenCalledTimes(1);
    await user.click(submit);
    expect(saveAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave({ ok: true, feedback: feedback() });
      await pendingSave;
    });

    await waitFor(() => expect(submit).toBeEnabled());
    expect(submit.closest("form")).toHaveAttribute("aria-busy", "false");
  });

  it("shows a generic error and resets pending state when the action throws", async () => {
    const user = userEvent.setup();
    const saveAction = vi
      .fn<SaveAction>()
      .mockRejectedValue(new Error("network disconnected"));
    renderForm(saveAction);

    await user.click(screen.getByRole("radio", { name: /1 star/i }));
    const submit = screen.getByRole("button", { name: /save feedback/i });
    await user.click(submit);

    expect(
      await screen.findByText("Couldn't save your feedback. Please try again."),
    ).toBeInTheDocument();
    expect(submit).toBeEnabled();
  });
});
