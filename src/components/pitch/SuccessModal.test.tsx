import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SuccessModal } from "@/components/pitch/SuccessModal";
import { TYPE_BY_ID } from "@/lib/feday-data";

// The recap's type name / duration are derived from the canonical data so the
// test tracks the data module rather than hardcoding copy that could drift.
const submission = {
  type: "talk",
  title: "We Deleted 40% Of Our CSS",
  name: "Ada Pixel",
  team: "Web Platform",
} as const;

const noop = () => {};

describe("SuccessModal", () => {
  describe("celebration recap", () => {
    it("announces the IDEA GET reward", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      expect(screen.getByText(/idea get/i)).toBeInTheDocument();
    });

    it("shows the slot type name for the submission", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      const name = TYPE_BY_ID[submission.type].name; // "LONG TALK"
      expect(screen.getByText(new RegExp(name, "i"))).toBeInTheDocument();
    });

    it("shows the slot duration for the submission", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      const dur = TYPE_BY_ID[submission.type].dur; // "30 MIN"
      expect(screen.getByText(new RegExp(dur, "i"))).toBeInTheDocument();
    });

    it("shows the submitted title", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      expect(
        screen.getByText(/We Deleted 40% Of Our CSS/),
      ).toBeInTheDocument();
    });

    it("shows the submitter's name and team", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      expect(screen.getByText(/Ada Pixel/)).toBeInTheDocument();
      expect(screen.getByText(/Web Platform/)).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("offers a BACK TO AGENDA link pointing at /agenda", () => {
      render(<SuccessModal submission={submission} onClose={noop} />);
      const link = screen.getByRole("link", { name: /back to agenda/i });
      expect(link.getAttribute("href")).toBe("/agenda");
    });
  });

  describe("dismissal", () => {
    it("calls onClose when the backdrop scrim is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = render(
        <SuccessModal submission={submission} onClose={onClose} />,
      );

      const scrim = container.querySelector(".modal-back");
      expect(scrim).not.toBeNull();
      await user.click(scrim as Element);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when the inner card is clicked (stopPropagation)", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = render(
        <SuccessModal submission={submission} onClose={onClose} />,
      );

      const card = container.querySelector(".modal-card");
      expect(card).not.toBeNull();
      await user.click(card as Element);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
