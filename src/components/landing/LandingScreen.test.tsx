import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingScreen } from "@/components/landing/LandingScreen";
import { julyEvent } from "@/test/fixtures";

const noop = () => {};

describe("LandingScreen", () => {
  describe("content", () => {
    it("renders the FE DAY title", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      // The design markup uses a non-breaking space ("FE&nbsp;DAY"); normalize
      // so we match regardless of whether the builder uses a space or <br/>.
      expect(
        screen.getByText((_, el) => el?.tagName === "H1" && /fe\s*day/i.test(el.textContent ?? "")),
      ).toBeInTheDocument();
    });

    it("renders the event's month and year", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("JUL 2026")).toBeInTheDocument();
    });

    it("renders the tagline", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText(/INSERT COIN/i)).toBeInTheDocument();
      expect(screen.getByText(/SHARE WHAT YOU KNOW/i)).toBeInTheDocument();
    });

    it("renders the eyebrow", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("CLEO · FRONT-END CHAPTER PRESENTS")).toBeInTheDocument();
    });

    it("renders the three stat labels", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("WHEN")).toBeInTheDocument();
      expect(screen.getByText("TIME")).toBeInTheDocument();
      expect(screen.getByText("WHERE")).toBeInTheDocument();
    });

    it("renders the WHEN value JUL 1", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("JUL 1")).toBeInTheDocument();
    });

    it("renders the TIME value from the event", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("10:00-16:00")).toBeInTheDocument();
    });

    it("renders the WHERE value from the event (straight apostrophe)", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText("LION'S SHARE + REMOTE")).toBeInTheDocument();
    });

    it("renders the PRESS START prompt", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText(/PRESS START/i)).toBeInTheDocument();
    });
  });

  describe("sign-in", () => {
    it("renders a sign in with Google button", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
    });

    it("renders the helper note about using a Cleo account", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.getByText(/use your cleo account/i)).toBeInTheDocument();
    });
  });

  describe("error states", () => {
    it("shows a domain error mentioning Cleo and @meetcleo.com when error is 'domain'", () => {
      render(<LandingScreen event={julyEvent} error="domain" signInAction={noop} />);
      const message = screen.getByText(/meetcleo\.com/i);
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/cleo/i);
    });

    it("shows a generic error when error is 'auth'", () => {
      render(<LandingScreen event={julyEvent} error="auth" signInAction={noop} />);
      expect(screen.getByText(/something went wrong|try again/i)).toBeInTheDocument();
    });

    it("shows neither error message when no error prop is given", () => {
      render(<LandingScreen event={julyEvent} signInAction={noop} />);
      expect(screen.queryByText(/meetcleo\.com/i)).toBeNull();
      expect(screen.queryByText(/something went wrong|try again/i)).toBeNull();
    });

    it("shows neither error message when error is null", () => {
      render(<LandingScreen event={julyEvent} error={null} signInAction={noop} />);
      expect(screen.queryByText(/meetcleo\.com/i)).toBeNull();
      expect(screen.queryByText(/something went wrong|try again/i)).toBeNull();
    });
  });
});
