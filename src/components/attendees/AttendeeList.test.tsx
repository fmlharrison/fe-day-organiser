import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttendeeList } from "@/components/attendees/AttendeeList";

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

describe("AttendeeList", () => {
  it("lists each attendee with name and mode", () => {
    render(<AttendeeList attendees={attendees} />);

    expect(screen.getByText("Ada Pixel")).toBeInTheDocument();
    expect(screen.getByText("Bea Byte")).toBeInTheDocument();
    expect(screen.getByText("IN PERSON")).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();
  });

  it("does not show email addresses", () => {
    render(<AttendeeList attendees={attendees} />);

    expect(screen.queryByText(/ada@meetcleo\.com/)).toBeNull();
    expect(screen.queryByText(/bea@meetcleo\.com/)).toBeNull();
  });

  it("shows an empty state when there are no other attendees", () => {
    render(<AttendeeList attendees={[]} />);

    expect(screen.getByText(/No one else has RSVP'd yet/i)).toBeInTheDocument();
  });
});
