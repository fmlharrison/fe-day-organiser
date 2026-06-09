import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs assertions", () => {
    expect(1 + 1).toBe(2);
  });

  it("provides a jsdom document with jest-dom matchers", () => {
    const el = document.createElement("div");
    el.textContent = "hello";
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("hello");
  });
});
