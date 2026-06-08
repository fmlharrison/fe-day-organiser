import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import type { TalkSubmissionRow } from "@/lib/submissions";

const noop = () => {};

const user = { id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" };

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

describe("AdminScreen", () => {
  describe("heading", () => {
    it("renders the ALL PITCHES heading", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} />,
      );
      expect(screen.getByText(/ALL PITCHES/i)).toBeInTheDocument();
    });
  });

  describe("with submissions", () => {
    it("renders each submission title", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} />,
      );
      expect(screen.getByText("Deleting 40% Of Our CSS")).toBeInTheDocument();
      expect(screen.getByText("Tiny Wins")).toBeInTheDocument();
    });

    it("exposes submitter emails to the organiser", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} />,
      );
      expect(screen.getByText(/ada@meetcleo\.com/)).toBeInTheDocument();
      expect(screen.getByText(/bea@meetcleo\.com/)).toBeInTheDocument();
    });

    it("shows a count reflecting the number of submissions", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} />,
      );
      expect(screen.getByText(/2 submitted/i)).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows no submission titles and no submitter emails when there are no pitches", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={[]} />,
      );
      expect(screen.queryByText("Deleting 40% Of Our CSS")).toBeNull();
      expect(screen.queryByText("Tiny Wins")).toBeNull();
      expect(screen.queryByText(/ada@meetcleo\.com/)).toBeNull();
      expect(screen.queryByText(/bea@meetcleo\.com/)).toBeNull();
    });
  });
});
