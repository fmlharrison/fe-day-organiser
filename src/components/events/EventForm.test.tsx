import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormValues } from "@/lib/events";
import { julyEvent } from "@/test/fixtures";

const blankFromJuly: EventFormValues = {
  slug: "",
  title: julyEvent.title,
  tagline: julyEvent.tagline,
  eventDate: "",
  startTime: julyEvent.startTime,
  endTime: julyEvent.endTime,
  location: julyEvent.location,
  copyAgendaFromEventId: julyEvent.id,
};

const savedJuly: EventFormValues = { ...blankFromJuly, slug: julyEvent.slug, eventDate: julyEvent.eventDate };

function renderCreateForm(submitAction = vi.fn()) {
  render(
    <EventForm
      initialValues={blankFromJuly}
      copySources={[julyEvent]}
      submitLabel="CREATE EVENT"
      cancelHref="/events"
      submitAction={submitAction}
    />,
  );
  return submitAction;
}

describe("EventForm", () => {
  it("offers the copy sources plus an empty-agenda option", () => {
    renderCreateForm();

    const select = screen.getByLabelText("COPY AGENDA FROM") as HTMLSelectElement;
    expect(select.value).toBe(julyEvent.id);
    expect(screen.getByRole("option", { name: "FE DAY JUL 2026" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "None — set the agenda later" })).toBeInTheDocument();
  });

  it("starts from the initial values", () => {
    renderCreateForm();

    expect(screen.getByLabelText("WHERE *")).toHaveValue("LION'S SHARE + REMOTE");
    expect(screen.getByLabelText("STARTS *")).toHaveValue("10:00");
    expect(screen.getByLabelText("URL SLUG *")).toHaveValue("");
  });

  it("shows validation errors without calling the action", async () => {
    const submitAction = renderCreateForm();

    await userEvent.click(screen.getByRole("button", { name: /CREATE EVENT/ }));

    expect(screen.getByText("Give the event a URL slug.")).toBeInTheDocument();
    expect(screen.getByText("Pick the event date.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("submits the form and shows server-side errors", async () => {
    const submitAction = renderCreateForm(
      vi.fn().mockResolvedValue({ ok: false, errors: { slug: "Another event already uses that slug." } }),
    );

    await userEvent.type(screen.getByLabelText("URL SLUG *"), "december-2026");
    await userEvent.type(screen.getByLabelText("DATE *"), "2026-12-01");
    await userEvent.selectOptions(screen.getByLabelText("COPY AGENDA FROM"), "");
    await userEvent.click(screen.getByRole("button", { name: /CREATE EVENT/ }));

    expect(submitAction).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "december-2026", eventDate: "2026-12-01", copyAgendaFromEventId: "" }),
    );
    expect(await screen.findByText("Another event already uses that slug.")).toBeInTheDocument();
  });

  it("locks the slug and hides the copy option when editing an existing event", async () => {
    const submitAction = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EventForm
        initialValues={savedJuly}
        slugLocked
        submitLabel="SAVE DETAILS"
        cancelHref="/events/july-2026/admin"
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText("URL SLUG *")).toBeDisabled();
    expect(screen.queryByLabelText("COPY AGENDA FROM")).toBeNull();

    await userEvent.clear(screen.getByLabelText("WHERE *"));
    await userEvent.type(screen.getByLabelText("WHERE *"), "THE BIG ROOM");
    await userEvent.click(screen.getByRole("button", { name: /SAVE DETAILS/ }));

    expect(submitAction).toHaveBeenCalledWith(expect.objectContaining({ location: "THE BIG ROOM" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Saved.");
  });
});
