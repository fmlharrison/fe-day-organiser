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

  it("pre-selects an existing RSVP and confirms the saved state", () => {
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
    expect(screen.getByText(/YOU'RE ON THE GUEST LIST/i)).toBeInTheDocument();
    expect(screen.getByText(/Locked in as REMOTE/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RSVP SAVED/i })).toBeDisabled();
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
    expect(screen.getByRole("button", { name: /RSVP SAVED/i })).toBeInTheDocument();
  });
});
