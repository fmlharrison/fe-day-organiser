import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgendaEditor } from "@/components/events/AgendaEditor";
import { julyAgenda } from "@/test/fixtures";

const ok = () => vi.fn().mockResolvedValue({ ok: true });
const lunch = julyAgenda.find((item) => item.id === "lunch")!;
const talk1 = julyAgenda.find((item) => item.id === "talk-1")!;

function renderEditor(overrides: Partial<Parameters<typeof AgendaEditor>[0]> = {}) {
  const props = {
    items: [talk1, lunch],
    assignedTalkTitles: {},
    addAction: ok(),
    updateAction: ok(),
    deleteAction: ok(),
    ...overrides,
  };
  render(<AgendaEditor {...props} />);
  return props;
}

function rowFor(title: string) {
  return screen.getByText(title).closest(".ag-card") as HTMLElement;
}

describe("AgendaEditor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invites you to add the first item when the agenda is empty", () => {
    renderEditor({ items: [] });

    expect(screen.getByText(/No agenda items yet/)).toBeInTheDocument();
    expect(screen.getByLabelText("STARTS *")).toHaveValue("10:00");
  });

  it("adds an item and starts the next one where it ended", async () => {
    const { addAction } = renderEditor({ items: [] });

    await userEvent.type(screen.getByLabelText("ENDS *"), "10:30");
    await userEvent.selectOptions(screen.getByLabelText("TYPE *"), "fixed");
    await userEvent.type(screen.getByLabelText("TITLE *"), "Doors Open");
    await userEvent.click(screen.getByRole("button", { name: "+ ADD TO AGENDA" }));

    expect(addAction).toHaveBeenCalledWith({
      startTime: "10:00",
      endTime: "10:30",
      kind: "fixed",
      title: "Doors Open",
      description: "",
    });
    expect(screen.getByLabelText("STARTS *")).toHaveValue("10:30");
    expect(screen.getByLabelText("TITLE *")).toHaveValue("");
  });

  it("validates before adding", async () => {
    const { addAction } = renderEditor({ items: [] });

    await userEvent.click(screen.getByRole("button", { name: "+ ADD TO AGENDA" }));

    expect(screen.getByText("Give it a title.")).toBeInTheDocument();
    expect(addAction).not.toHaveBeenCalled();
  });

  it("edits an item inline", async () => {
    const { updateAction } = renderEditor();

    await userEvent.click(within(rowFor("Lunch")).getByRole("button", { name: "EDIT" }));
    const title = screen.getByDisplayValue("Lunch");
    await userEvent.clear(title);
    await userEvent.type(title, "Long Lunch");
    await userEvent.click(screen.getByRole("button", { name: "SAVE" }));

    expect(updateAction).toHaveBeenCalledWith("lunch", expect.objectContaining({ title: "Long Lunch", kind: "break" }));
  });

  it("deletes an item after confirming", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { deleteAction } = renderEditor();

    await userEvent.click(within(rowFor("Lunch")).getByRole("button", { name: "DELETE" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledWith("lunch");
  });

  it("does nothing if the delete isn't confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { deleteAction } = renderEditor();

    await userEvent.click(within(rowFor("Lunch")).getByRole("button", { name: "DELETE" }));

    expect(deleteAction).not.toHaveBeenCalled();
  });

  it("protects a slot with a talk assigned", async () => {
    renderEditor({ assignedTalkTitles: { "talk-1": "Type-safe CSS" } });

    const row = rowFor("Talk Slot #1");
    expect(within(row).getByText(/TALK ASSIGNED · Type-safe CSS/)).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "DELETE" })).toBeDisabled();

    await userEvent.click(within(row).getByRole("button", { name: "EDIT" }));
    const editForm = screen.getByRole("button", { name: "SAVE" }).closest("form") as HTMLElement;
    expect(within(editForm).getByLabelText("TYPE *")).toBeDisabled();
  });

  it("shows server errors from a failed save", async () => {
    renderEditor({
      updateAction: vi.fn().mockResolvedValue({ ok: false, errors: {}, formError: "Couldn't save the agenda item." }),
    });

    await userEvent.click(within(rowFor("Lunch")).getByRole("button", { name: "EDIT" }));
    await userEvent.click(screen.getByRole("button", { name: "SAVE" }));

    expect(await screen.findByText("Couldn't save the agenda item.")).toBeInTheDocument();
  });
});
