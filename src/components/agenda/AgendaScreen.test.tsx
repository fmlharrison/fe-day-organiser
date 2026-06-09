import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { AGENDA, KIND_META } from "@/lib/feday-data";

const noop = () => {};

const user = { id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" };

// The canonical agenda is the source of truth for both the row count and the
// set of open ("claimable") slots, so derive expectations from it rather than
// hardcoding — a builder that drifts from the data will fail these.
const openRows = AGENDA.filter((row) => KIND_META[row.kind].open);

describe("AgendaScreen", () => {
  describe("header", () => {
    it("greets the player by uppercased first name", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText("WELCOME, PLAYER ADA")).toBeInTheDocument();
    });

    it("renders THE AGENDA heading", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(
        screen.getByRole("heading", { name: "THE AGENDA" }),
      ).toBeInTheDocument();
    });
  });

  describe("event meta strip", () => {
    it("shows the date JUL 1", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText("JUL 1")).toBeInTheDocument();
    });

    it("shows the time range 10:00–17:00 (en-dash)", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText("10:00–17:00")).toBeInTheDocument();
    });

    it("shows the location LION'S SHARE + REMOTE", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText("LION'S SHARE + REMOTE")).toBeInTheDocument();
    });
  });

  describe("legend", () => {
    it("lists every slot type in the legend", () => {
      const { container } = render(
        <AgendaScreen user={user} signOutAction={noop} />,
      );
      const chipLabels = [...container.querySelectorAll(".chip")].map(
        (c) => c.textContent,
      );
      expect(chipLabels).toEqual(
        expect.arrayContaining(["LIGHTNING TALK", "LONG TALK", "WORKSHOP", "BREAK"]),
      );
    });
  });

  describe("attendance", () => {
    it("does not show the RSVP block without a setAttendanceAction", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.queryByText(/PRESS START TO RSVP/i)).toBeNull();
    });

    it("shows the RSVP block when setAttendanceAction is provided", () => {
      render(
        <AgendaScreen
          user={user}
          signOutAction={noop}
          setAttendanceAction={vi.fn()}
          attendanceCounts={{ inPerson: 1, remote: 0, total: 1 }}
        />,
      );
      expect(screen.getByText(/PRESS START TO RSVP/i)).toBeInTheDocument();
    });
  });

  describe("call to action", () => {
    it("shows the OPEN SLOTS NEED YOU banner", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText(/OPEN SLOTS NEED YOU/i)).toBeInTheDocument();
    });

    it("offers a 'submit a talk idea' link to /pitch", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      const links = screen
        .getAllByRole("link", { name: /submit a talk idea/i })
        .filter((link) => link.getAttribute("href") === "/pitch");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("timeline", () => {
    it("renders every agenda title", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      for (const row of AGENDA) {
        expect(screen.getByText(row.title)).toBeInTheDocument();
      }
    });

    it("renders some recognisable fixed-point sessions", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(screen.getByText("Doors Open + Ice Breaker")).toBeInTheDocument();
      expect(screen.getByText("The State of the FE at Cleo")).toBeInTheDocument();
      expect(screen.getByText("Lunch")).toBeInTheDocument();
      expect(screen.getByText("Closing")).toBeInTheDocument();
    });

    it("renders exactly 16 timeline rows", () => {
      const { container } = render(
        <AgendaScreen user={user} signOutAction={noop} />,
      );
      expect(container.querySelectorAll(".ag-row")).toHaveLength(16);
    });

    it("renders one timeline row per agenda entry", () => {
      const { container } = render(
        <AgendaScreen user={user} signOutAction={noop} />,
      );
      expect(container.querySelectorAll(".ag-row")).toHaveLength(AGENDA.length);
    });
  });

  describe("open slots", () => {
    it("offers at least one 'OPEN SLOT — CLAIM IT' link", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      expect(
        screen.getAllByRole("link", { name: /OPEN SLOT — CLAIM IT/i }).length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("links an open lightning slot to /pitch?type=lightning", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      const claimLinks = screen.getAllByRole("link", {
        name: /OPEN SLOT — CLAIM IT/i,
      });
      const lightningClaim = claimLinks.some(
        (link) => link.getAttribute("href") === "/pitch?type=lightning",
      );
      expect(lightningClaim).toBe(true);
    });

    it("shows a claim link for every open slot and none for closed ones", () => {
      render(<AgendaScreen user={user} signOutAction={noop} />);
      const claimLinks = screen.getAllByRole("link", {
        name: /OPEN SLOT — CLAIM IT/i,
      });
      expect(claimLinks).toHaveLength(openRows.length);
    });

    it("shows assigned talk title and speaker instead of the placeholder", () => {
      render(
        <AgendaScreen
          user={user}
          signOutAction={noop}
          assignmentsBySlot={{
            "talk-1": {
              slotId: "talk-1",
              submissionId: "sub-1",
              title: "Deleting 40% Of Our CSS",
              description: "A story about shipping less CSS.",
              submitterName: "Ada Pixel",
              team: "Web Platform",
              type: "talk",
            },
          }}
        />,
      );
      expect(screen.getByText("Deleting 40% Of Our CSS")).toBeInTheDocument();
      expect(screen.getByText(/Ada Pixel, Web Platform/)).toBeInTheDocument();
      expect(screen.queryByText("Talk Slot #1")).toBeNull();
    });

    it("hides the claim link on a filled slot", () => {
      render(
        <AgendaScreen
          user={user}
          signOutAction={noop}
          assignmentsBySlot={{
            "talk-1": {
              slotId: "talk-1",
              submissionId: "sub-1",
              title: "Deleting 40% Of Our CSS",
              description: "A story about shipping less CSS.",
              submitterName: "Ada Pixel",
              team: "Web Platform",
              type: "talk",
            },
          }}
        />,
      );
      const claimLinks = screen.queryAllByRole("link", {
        name: /OPEN SLOT — CLAIM IT/i,
      });
      expect(claimLinks).toHaveLength(openRows.length - 1);
    });
  });
});
