import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "@/components/agenda/TopBar";

const noop = () => {};

const user = { id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" };

describe("TopBar", () => {
  describe("branding", () => {
    it("shows the FE DAY ’26 brand (curly apostrophe)", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      expect(screen.getByText("FE DAY ’26")).toBeInTheDocument();
    });
  });

  describe("primary navigation", () => {
    it("links to /pitch from a 'pitch a talk' control", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      const link = screen.getByRole("link", { name: /pitch a talk/i });
      expect(link.getAttribute("href")).toBe("/pitch");
    });

    it("links to /my-pitches from a 'my pitches' control", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      const link = screen.getByRole("link", { name: /my pitches/i });
      expect(link.getAttribute("href")).toBe("/my-pitches");
    });
  });

  describe("user identity", () => {
    it("shows the initials of the signed-in user", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      expect(screen.getByText("AP")).toBeInTheDocument();
    });
  });

  describe("exit", () => {
    it("renders an EXIT control", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      expect(screen.getByRole("button", { name: /exit/i })).toBeInTheDocument();
    });
  });

  describe("organiser access", () => {
    it("does not show an admin link for a regular player", () => {
      render(<TopBar user={user} signOutAction={noop} />);
      expect(screen.queryByRole("link", { name: /admin/i })).toBeNull();
    });

    it("shows an admin link to /admin when the user is an organiser", () => {
      render(<TopBar user={user} isOrganiser signOutAction={noop} />);
      const link = screen.getByRole("link", { name: /admin/i });
      expect(link.getAttribute("href")).toBe("/admin");
    });
  });
});
