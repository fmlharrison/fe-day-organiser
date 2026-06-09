import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PixelFrame } from "@/components/ui/PixelFrame";

describe("PixelFrame", () => {
  it("renders its children", () => {
    render(
      <PixelFrame>
        <span>Inside the frame</span>
      </PixelFrame>,
    );
    expect(screen.getByText("Inside the frame")).toBeInTheDocument();
  });

  it("gives the root element the pf class", () => {
    const { container } = render(<PixelFrame>content</PixelFrame>);
    expect(container.firstChild).toHaveClass("pf");
  });

  it("adds the shadow class when shadow is set", () => {
    const { container } = render(<PixelFrame shadow>content</PixelFrame>);
    expect(container.firstChild).toHaveClass("shadow");
  });

  it("omits the shadow class by default", () => {
    const { container } = render(<PixelFrame>content</PixelFrame>);
    expect(container.firstChild).not.toHaveClass("shadow");
  });

  it("sets the --frame custom property from the frame prop", () => {
    const { container } = render(<PixelFrame frame="#123456">content</PixelFrame>);
    expect(container.firstChild).toHaveStyle({ "--frame": "#123456" });
  });

  it("sets the --surface custom property from the surface prop", () => {
    const { container } = render(<PixelFrame surface="#abcdef">content</PixelFrame>);
    expect(container.firstChild).toHaveStyle({ "--surface": "#abcdef" });
  });

  it("pads the inner element with 24 by default", () => {
    const { container } = render(<PixelFrame>content</PixelFrame>);
    expect(container.querySelector(".pf-in")).toHaveStyle({ padding: "24px" });
  });

  it("overrides the inner padding when pad is provided", () => {
    const { container } = render(<PixelFrame pad={8}>content</PixelFrame>);
    expect(container.querySelector(".pf-in")).toHaveStyle({ padding: "8px" });
  });
});
