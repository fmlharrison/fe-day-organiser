import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttendanceForm } from "@/components/agenda/AttendanceForm";

describe("AttendanceForm", () => {
  const counts = { inPerson: 3, remote: 2, total: 5 };

  it("prompts users who have not RSVP'd yet", () => {
    render(
      <AttendanceForm
        attendance={null}
        counts={counts}
        setAttendanceAction={vi.fn()}
      />,
    );
    expect(screen.getByText(/PRESS START TO RSVP/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /COUNT ME IN/i })).toBeDisabled();
  });

  it("shows headcount when others have RSVP'd", () => {
    render(
      <AttendanceForm
        attendance={null}
        counts={counts}
        setAttendanceAction={vi.fn()}
      />,
    );
    expect(screen.getByText(/3 in person · 2 remote · 5 total/i)).toBeInTheDocument();
  });

  it("shows a compact status line for an existing RSVP", () => {
    render(
      <AttendanceForm
        attendance={{
          userId: "u1",
          attendeeName: "Ada Pixel",
          attendeeEmail: "ada@meetcleo.com",
          mode: "remote",
          updatedAt: "2026-06-01T10:00:00Z",
        }}
        counts={counts}
        setAttendanceAction={vi.fn()}
      />,
    );
    expect(screen.getByText(/You're attending —/i)).toBeInTheDocument();
    expect(screen.getByText("REMOTE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CHANGE/i })).toBeInTheDocument();
    expect(screen.queryByText(/PRESS START TO RSVP/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /COUNT ME IN/i })).toBeNull();
  });

  it("opens the full form when CHANGE is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AttendanceForm
        attendance={{
          userId: "u1",
          attendeeName: "Ada Pixel",
          attendeeEmail: "ada@meetcleo.com",
          mode: "remote",
          updatedAt: "2026-06-01T10:00:00Z",
        }}
        counts={counts}
        setAttendanceAction={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /CHANGE/i }));

    expect(screen.getByText(/UPDATE YOUR RSVP/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /UPDATE RSVP/i })).toBeInTheDocument();
  });

  it("calls setAttendanceAction when a mode is chosen and submitted", async () => {
    const user = userEvent.setup();
    const setAttendanceAction = vi.fn().mockResolvedValue({ ok: true, mode: "in_person" });

    render(
      <AttendanceForm
        attendance={null}
        counts={counts}
        setAttendanceAction={setAttendanceAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: /IN PERSON/i }));
    await user.click(screen.getByRole("button", { name: /COUNT ME IN/i }));

    expect(setAttendanceAction).toHaveBeenCalledWith("in_person");
    expect(screen.getByText(/You're attending —/i)).toBeInTheDocument();
    expect(screen.getByText("IN PERSON")).toBeInTheDocument();
  });
});
