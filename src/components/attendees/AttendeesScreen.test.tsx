import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttendeesScreen } from "@/components/attendees/AttendeesScreen";

const noop = () => {};

const user = { id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" };

const otherAttendees = [
  {
    userId: "u2",
    attendeeName: "Bea Byte",
    attendeeEmail: "bea@meetcleo.com",
    mode: "remote" as const,
    updatedAt: "2026-06-02T10:00:00.000Z",
  },
];

describe("AttendeesScreen", () => {
  it("renders the page heading and summary counts", () => {
    render(
      <AttendeesScreen
        user={user}
        signOutAction={noop}
        attendance={null}
        otherAttendees={otherAttendees}
        counts={{ inPerson: 0, remote: 1, total: 1 }}
        setAttendanceAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "WHO'S IN" })).toBeInTheDocument();
    expect(screen.getByText(/0 in person · 1 remote · 1 RSVP'd/)).toBeInTheDocument();
  });

  it("shows the RSVP form when the user has not RSVP'd", () => {
    render(
      <AttendeesScreen
        user={user}
        signOutAction={noop}
        attendance={null}
        otherAttendees={otherAttendees}
        counts={{ inPerson: 0, remote: 1, total: 1 }}
        setAttendanceAction={vi.fn()}
      />,
    );

    expect(screen.getByText(/PRESS START TO RSVP/i)).toBeInTheDocument();
  });

  it("lists other attendees but not the current user", () => {
    render(
      <AttendeesScreen
        user={user}
        signOutAction={noop}
        attendance={{
          userId: "u1",
          attendeeName: "Ada Pixel",
          attendeeEmail: "ada@meetcleo.com",
          mode: "in_person",
          updatedAt: "2026-06-01T10:00:00.000Z",
        }}
        otherAttendees={otherAttendees}
        counts={{ inPerson: 1, remote: 1, total: 2 }}
        setAttendanceAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Bea Byte")).toBeInTheDocument();
    expect(screen.queryByText("Ada Pixel")).toBeNull();
  });

  it("shows the chapter empty state when no one else has RSVP'd", () => {
    render(
      <AttendeesScreen
        user={user}
        signOutAction={noop}
        attendance={null}
        otherAttendees={[]}
        counts={{ inPerson: 0, remote: 0, total: 0 }}
        setAttendanceAction={vi.fn()}
      />,
    );

    expect(screen.getByText(/No one else has RSVP'd yet/i)).toBeInTheDocument();
  });
});
