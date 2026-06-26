import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyPitchesScreen } from "@/components/submissions/MyPitchesScreen";
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

describe("MyPitchesScreen", () => {
  describe("heading", () => {
    it("renders the MY PITCHES heading", () => {
      render(
        <MyPitchesScreen
          user={user}
          signOutAction={noop}
          submissions={rows}
        />,
      );
      expect(
        screen.getByRole("heading", { name: /MY PITCHES/i }),
      ).toBeInTheDocument();
    });
  });

  describe("with submissions", () => {
    it("renders each submission title", () => {
      render(
        <MyPitchesScreen
          user={user}
          signOutAction={noop}
          submissions={rows}
        />,
      );
      expect(screen.getByText("Deleting 40% Of Our CSS")).toBeInTheDocument();
      expect(screen.getByText("Tiny Wins")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows no submission titles when the user has no pitches", () => {
      render(
        <MyPitchesScreen user={user} signOutAction={noop} submissions={[]} />,
      );
      expect(screen.queryByText("Deleting 40% Of Our CSS")).toBeNull();
      expect(screen.queryByText("Tiny Wins")).toBeNull();
    });

    it("offers a way to pitch a talk via a link to /pitch", () => {
      render(
        <MyPitchesScreen user={user} signOutAction={noop} submissions={[]} />,
      );
      const pitchLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/pitch");
      expect(pitchLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("does not offer a pitch link when pitching is closed", () => {
      render(
        <MyPitchesScreen
          user={user}
          signOutAction={noop}
          submissions={[]}
          pitchingClosed
        />,
      );
      const pitchLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === "/pitch");
      expect(pitchLinks).toHaveLength(0);
      expect(screen.getByText(/pitching is closed/i)).toBeInTheDocument();
    });
  });
});
