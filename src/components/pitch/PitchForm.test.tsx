import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PitchForm } from "@/components/pitch/PitchForm";

// Placeholders are taken from the design ref's FormFields. The design markup
// uses <label>s that are not programmatically associated with their inputs, so
// querying by placeholder is the robust selector here.
const TITLE_PLACEHOLDER = /e\.g\. We Deleted/i;
const DESC_PLACEHOLDER = /A few lines/i;
const TEAM_PLACEHOLDER = /e\.g\. Web Platform/i;

describe("PitchForm", () => {
  describe("pitching closed", () => {
    it("shows a closed message instead of the form", () => {
      render(<PitchForm userName="Ada Pixel" pitchingClosed submitAction={vi.fn()} />);
      expect(screen.getByRole("heading", { name: /pitching closed/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /submit idea/i })).toBeNull();
    });
  });

  describe("prefill", () => {
    it("prefills the name field from userName", () => {
      render(<PitchForm userName="Ada Pixel" submitAction={vi.fn()} />);
      expect(screen.getByDisplayValue("Ada Pixel")).toBeInTheDocument();
    });
  });

  describe("invalid submit", () => {
    it("does not call submitAction and surfaces inline errors when required fields are empty", async () => {
      const user = userEvent.setup();
      const submitAction = vi.fn();
      render(<PitchForm userName="" submitAction={submitAction} />);

      await user.click(
        screen.getByRole("button", { name: /submit idea/i }),
      );

      expect(submitAction).not.toHaveBeenCalled();
      expect(screen.getByText("Pick a talk type.")).toBeInTheDocument();
    });
  });

  describe("happy path", () => {
    it("submits once and shows the success modal", async () => {
      const user = userEvent.setup();
      const submitAction = vi.fn().mockResolvedValue({
        ok: true,
        submission: {
          type: "talk",
          title: "My Talk Title",
          name: "Ada Pixel",
          team: "Web Platform",
        },
      });
      render(<PitchForm userName="Ada Pixel" submitAction={submitAction} />);

      // Pick the LONG TALK slot type by its card.
      await user.click(screen.getByRole("button", { name: /long talk/i }));
      await user.type(
        screen.getByPlaceholderText(TITLE_PLACEHOLDER),
        "My Talk Title",
      );
      await user.type(
        screen.getByPlaceholderText(DESC_PLACEHOLDER),
        "A description with more than ten characters.",
      );
      await user.type(
        screen.getByPlaceholderText(TEAM_PLACEHOLDER),
        "Web Platform",
      );

      await user.click(
        screen.getByRole("button", { name: /submit idea/i }),
      );

      expect(submitAction).toHaveBeenCalledTimes(1);
      expect(await screen.findByText(/idea get/i)).toBeInTheDocument();
    });
  });

  describe("preset type", () => {
    it("submits with the preset type when no card is clicked", async () => {
      const user = userEvent.setup();
      const submitAction = vi.fn().mockResolvedValue({
        ok: true,
        submission: {
          type: "lightning",
          title: "Preset Talk",
          name: "Ada Pixel",
          team: "Web Platform",
        },
      });
      render(
        <PitchForm
          userName="Ada Pixel"
          presetType="lightning"
          submitAction={submitAction}
        />,
      );

      await user.type(
        screen.getByPlaceholderText(TITLE_PLACEHOLDER),
        "Preset Talk",
      );
      await user.type(
        screen.getByPlaceholderText(DESC_PLACEHOLDER),
        "A description with more than ten characters.",
      );
      await user.type(
        screen.getByPlaceholderText(TEAM_PLACEHOLDER),
        "Web Platform",
      );

      await user.click(
        screen.getByRole("button", { name: /submit idea/i }),
      );

      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ type: "lightning" }),
      );
    });
  });
});
