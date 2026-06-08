import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import { TYPE_BY_ID } from "@/lib/feday-data";
import type { TalkSubmissionRow } from "@/lib/submissions";

const rows: TalkSubmissionRow[] = [
  {
    id: "1",
    created_at: "2026-06-01T10:00:00.000Z",
    submitter_name: "Ada Pixel",
    submitter_email: "ada@meetcleo.com",
    team: "Web Platform",
    type: "talk",
    title: "Deleting 40% Of Our CSS",
    description: "A story about shipping less CSS and surviving.",
  },
  {
    id: "2",
    created_at: "2026-06-02T10:00:00.000Z",
    submitter_name: "Bea Byte",
    submitter_email: "bea@meetcleo.com",
    team: "Growth",
    type: "lightning",
    title: "Tiny Wins",
    description: "Five quick frontend wins in five minutes flat.",
  },
];

describe("SubmissionList", () => {
  describe("rendering each submission", () => {
    it("renders every submission title", () => {
      render(<SubmissionList submissions={rows} showSubmitter={false} />);
      expect(screen.getByText("Deleting 40% Of Our CSS")).toBeInTheDocument();
      expect(screen.getByText("Tiny Wins")).toBeInTheDocument();
    });

    it("renders the human-readable type label for each submission", () => {
      render(<SubmissionList submissions={rows} showSubmitter={false} />);
      // Labels are derived from the canonical type metadata, so a builder that
      // shows raw ids ("talk"/"lightning") instead of names will fail.
      expect(TYPE_BY_ID["talk"].name).toMatch(/long talk/i);
      expect(TYPE_BY_ID["lightning"].name).toMatch(/lightning/i);
      expect(screen.getByText(/long talk/i)).toBeInTheDocument();
      expect(screen.getByText(/lightning/i)).toBeInTheDocument();
    });

    it("renders the team for each submission", () => {
      render(<SubmissionList submissions={rows} showSubmitter={false} />);
      expect(screen.getByText(/Web Platform/)).toBeInTheDocument();
      expect(screen.getByText(/Growth/)).toBeInTheDocument();
    });
  });

  describe("when showSubmitter is true", () => {
    it("renders submitter names and emails", () => {
      render(<SubmissionList submissions={rows} showSubmitter={true} />);
      expect(screen.getByText(/Ada Pixel/)).toBeInTheDocument();
      expect(screen.getByText(/ada@meetcleo\.com/)).toBeInTheDocument();
      expect(screen.getByText(/Bea Byte/)).toBeInTheDocument();
      expect(screen.getByText(/bea@meetcleo\.com/)).toBeInTheDocument();
    });
  });

  describe("when showSubmitter is false", () => {
    it("does not render submitter emails", () => {
      render(<SubmissionList submissions={rows} showSubmitter={false} />);
      expect(screen.queryByText(/ada@meetcleo\.com/)).toBeNull();
      expect(screen.queryByText(/bea@meetcleo\.com/)).toBeNull();
    });
  });

  describe("empty input", () => {
    it("renders no submission titles when given an empty list", () => {
      render(<SubmissionList submissions={[]} showSubmitter={false} />);
      expect(screen.queryByText("Deleting 40% Of Our CSS")).toBeNull();
      expect(screen.queryByText("Tiny Wins")).toBeNull();
    });
  });
});
