import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminAttendanceList } from "@/components/submissions/AdminAttendanceList";

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

describe("AdminAttendanceList", () => {
  it("lists each attendee with name, email, and mode", () => {
    render(<AdminAttendanceList attendees={attendees} />);

    expect(screen.getByText("Ada Pixel")).toBeInTheDocument();
    expect(screen.getByText("Bea Byte")).toBeInTheDocument();
    expect(screen.getByText(/ada@meetcleo\.com/)).toBeInTheDocument();
    expect(screen.getByText(/bea@meetcleo\.com/)).toBeInTheDocument();
    expect(screen.getByText("IN PERSON")).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();
  });
});
