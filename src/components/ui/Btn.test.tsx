import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Btn } from "@/components/ui/Btn";

describe("Btn", () => {
  it("renders a button with its children and the base class", () => {
    render(<Btn>Hello</Btn>);
    const button = screen.getByRole("button", { name: "Hello" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn");
  });

  it("applies the variant as an additional class", () => {
    render(<Btn variant="orange">Hello</Btn>);
    const button = screen.getByRole("button", { name: "Hello" });
    expect(button).toHaveClass("btn");
    expect(button).toHaveClass("orange");
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Btn onClick={onClick}>Hello</Btn>);
    await userEvent.click(screen.getByRole("button", { name: "Hello" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
