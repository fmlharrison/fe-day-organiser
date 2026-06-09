import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleButton } from "@/components/ui/GoogleButton";

describe("GoogleButton", () => {
  it("renders a sign-in-with-google button", () => {
    render(<GoogleButton />);
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /sign in with google/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
