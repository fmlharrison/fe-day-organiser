import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TypeIcon } from "@/components/ui/TypeIcon";
import type { TalkTypeId } from "@/lib/feday-data";

describe("TypeIcon", () => {
  it.each(["lightning", "talk", "workshop"] as const)(
    "renders an svg with the tc-icon class for %s",
    (id) => {
      const { container } = render(<TypeIcon id={id} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("tc-icon");
    },
  );

  it("renders distinct glyph markup for each id", () => {
    const glyphFor = (id: TalkTypeId) => {
      const { container } = render(<TypeIcon id={id} />);
      return container.querySelector("svg g")?.innerHTML ?? "";
    };

    const lightning = glyphFor("lightning");
    const talk = glyphFor("talk");
    const workshop = glyphFor("workshop");

    expect(lightning).not.toBe("");
    expect(new Set([lightning, talk, workshop]).size).toBe(3);
  });
});
