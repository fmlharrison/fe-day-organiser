import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import type { TalkSubmissionRow } from "@/lib/submissions";
import type { AssignedTalk } from "@/lib/agenda";

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

const assignedTalk: AssignedTalk = {
  slotId: "talk-1",
  submissionId: "1",
  title: "Deleting 40% Of Our CSS",
  description: "A story about shipping less CSS and surviving.",
  submitterName: "Ada Pixel",
  team: "Web Platform",
  type: "talk",
};

const emptyAssignments = {
  assignmentsBySlot: {} as Record<string, AssignedTalk>,
  assignmentsBySubmission: {} as Record<string, AssignedTalk>,
};

describe("AdminScreen", () => {
  describe("heading", () => {
    it("renders the ALL PITCHES heading", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getByText(/ALL PITCHES/i)).toBeInTheDocument();
    });
  });

  describe("with submissions", () => {
    it("renders each submission title", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getByText("Deleting 40% Of Our CSS")).toBeInTheDocument();
      expect(screen.getByText("Tiny Wins")).toBeInTheDocument();
    });

    it("exposes submitter emails to the organiser", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getByText(/ada@meetcleo\.com/)).toBeInTheDocument();
      expect(screen.getByText(/bea@meetcleo\.com/)).toBeInTheDocument();
    });

    it("shows a count reflecting the number of submissions", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getByText(/2 submitted/i)).toBeInTheDocument();
    });

    it("offers assign controls for unassigned submissions", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getAllByRole("button", { name: /CONFIRM & ASSIGN/i })).toHaveLength(2);
      expect(screen.getAllByRole("combobox")).toHaveLength(2);
    });

    it("shows scheduled badge and remove button for assigned submissions", () => {
      render(
        <AdminScreen
          user={user}
          signOutAction={noop}
          submissions={rows}
          assignmentsBySlot={{ "talk-1": assignedTalk }}
          assignmentsBySubmission={{ "1": assignedTalk }}
        />,
      );
      expect(screen.getByText(/SCHEDULED · Talk Slot #1/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /REMOVE FROM AGENDA/i })).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows no submission titles and no submitter emails when there are no pitches", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={[]} {...emptyAssignments} />,
      );
      expect(screen.queryByText("Deleting 40% Of Our CSS")).toBeNull();
      expect(screen.queryByText("Tiny Wins")).toBeNull();
      expect(screen.queryByText(/ada@meetcleo\.com/)).toBeNull();
      expect(screen.queryByText(/bea@meetcleo\.com/)).toBeNull();
    });
  });

  describe("attendees", () => {
    const attendees = [
      {
        userId: "u1",
        attendeeName: "Ada Pixel",
        attendeeEmail: "ada@meetcleo.com",
        mode: "in_person" as const,
        updatedAt: "2026-06-01T10:00:00.000Z",
      },
      {
        userId: "u2",
        attendeeName: "Bea Byte",
        attendeeEmail: "bea@meetcleo.com",
        mode: "remote" as const,
        updatedAt: "2026-06-02T10:00:00.000Z",
      },
    ];

    it("shows the attendees section with headcount", () => {
      render(
        <AdminScreen
          user={user}
          signOutAction={noop}
          submissions={rows}
          {...emptyAssignments}
          attendees={attendees}
          attendanceCounts={{ inPerson: 1, remote: 1, total: 2 }}
        />,
      );
      expect(screen.getByRole("heading", { name: /ATTENDEES/i })).toBeInTheDocument();
      expect(screen.getByText(/1 in person · 1 remote · 2 RSVP'd/i)).toBeInTheDocument();
    });

    it("lists attendee names and modes", () => {
      render(
        <AdminScreen
          user={user}
          signOutAction={noop}
          submissions={rows}
          {...emptyAssignments}
          attendees={attendees}
          attendanceCounts={{ inPerson: 1, remote: 1, total: 2 }}
        />,
      );
      expect(screen.getByText("Ada Pixel")).toBeInTheDocument();
      expect(screen.getByText("Bea Byte")).toBeInTheDocument();
      expect(screen.getByText("IN PERSON")).toBeInTheDocument();
      expect(screen.getByText("REMOTE")).toBeInTheDocument();
    });

    it("shows an empty state when nobody has RSVP'd", () => {
      render(
        <AdminScreen user={user} signOutAction={noop} submissions={rows} {...emptyAssignments} />,
      );
      expect(screen.getByText(/No one has RSVP'd yet/i)).toBeInTheDocument();
    });
  });
});
