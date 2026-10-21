import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventForm } from "@/components/events/EventForm";
import { julyEvent } from "@/test/fixtures";

describe("EventForm", () => {
  it("defaults to copying the latest event's agenda, with an empty-agenda option", () => {
    render(<EventForm copySources={[julyEvent]} createAction={vi.fn()} />);

    const select = screen.getByLabelText("COPY AGENDA FROM") as HTMLSelectElement;
    expect(select.value).toBe(julyEvent.id);
    expect(screen.getByRole("option", { name: "FE DAY JUL 2026" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "None — set the agenda later" })).toBeInTheDocument();
  });

  it("prefills details from the latest event but leaves the slug and date blank", () => {
    render(<EventForm copySources={[julyEvent]} createAction={vi.fn()} />);

    expect(screen.getByLabelText("WHERE *")).toHaveValue("LION'S SHARE + REMOTE");
    expect(screen.getByLabelText("STARTS *")).toHaveValue("10:00");
    expect(screen.getByLabelText("URL SLUG *")).toHaveValue("");
    expect(screen.getByLabelText("DATE *")).toHaveValue("");
  });

  it("shows validation errors without calling the action", async () => {
    const createAction = vi.fn();
    render(<EventForm copySources={[julyEvent]} createAction={createAction} />);

    await userEvent.click(screen.getByRole("button", { name: /CREATE EVENT/ }));

    expect(screen.getByText("Give the event a URL slug.")).toBeInTheDocument();
    expect(screen.getByText("Pick the event date.")).toBeInTheDocument();
    expect(createAction).not.toHaveBeenCalled();
  });

  it("submits the form and shows server-side errors", async () => {
    const createAction = vi.fn().mockResolvedValue({
      ok: false,
      errors: { slug: "Another event already uses that slug." },
    });
    render(<EventForm copySources={[julyEvent]} createAction={createAction} />);

    await userEvent.type(screen.getByLabelText("URL SLUG *"), "december-2026");
    await userEvent.type(screen.getByLabelText("DATE *"), "2026-12-01");
    await userEvent.selectOptions(screen.getByLabelText("COPY AGENDA FROM"), "");
    await userEvent.click(screen.getByRole("button", { name: /CREATE EVENT/ }));

    expect(createAction).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "december-2026", eventDate: "2026-12-01", copyAgendaFromEventId: "" }),
    );
    expect(await screen.findByText("Another event already uses that slug.")).toBeInTheDocument();
  });
});
