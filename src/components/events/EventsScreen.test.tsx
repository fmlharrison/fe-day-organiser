import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { EventsScreen } from "@/components/events/EventsScreen";
import { julyEvent } from "@/test/fixtures";

const noop = () => {};
const user = { id: "u1", email: "ada@meetcleo.com", name: "Ada Pixel" };
const decemberEvent = { ...julyEvent, id: "event-dec-2026", slug: "december-2026", eventDate: "2026-12-01" };

describe("EventsScreen", () => {
  it("splits events into upcoming and past, labelled by month and year", () => {
    render(
      <EventsScreen
        currentEvent={decemberEvent}
        events={[decemberEvent, julyEvent]}
        today="2026-10-15"
        user={user}
        signOutAction={noop}
      />,
    );

    const upcoming = screen.getByRole("heading", { name: "UPCOMING" }).closest("section")!;
    const past = screen.getByRole("heading", { name: "PAST" }).closest("section")!;
    expect(within(upcoming).getByText("FE DAY · DEC 2026")).toBeInTheDocument();
    expect(within(past).getByText("FE DAY · JUL 2026")).toBeInTheDocument();
  });

  it("links each event to its agenda", () => {
    render(
      <EventsScreen
        currentEvent={decemberEvent}
        events={[decemberEvent, julyEvent]}
        today="2026-10-15"
        user={user}
        signOutAction={noop}
      />,
    );

    const hrefs = screen
      .getAllByRole("link", { name: /VIEW AGENDA/ })
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/events/december-2026/agenda", "/events/july-2026/agenda"]);
  });

  it("hides the past section when every event is upcoming", () => {
    render(
      <EventsScreen
        currentEvent={decemberEvent}
        events={[decemberEvent]}
        today="2026-10-15"
        user={user}
        signOutAction={noop}
      />,
    );

    expect(screen.queryByRole("heading", { name: "PAST" })).toBeNull();
  });
});
