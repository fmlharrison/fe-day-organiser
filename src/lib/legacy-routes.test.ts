import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
  requireCurrentEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/events.server", () => ({ requireCurrentEvent: mocks.requireCurrentEvent }));

import { redirectToCurrentEvent } from "@/lib/legacy-routes";
import LegacyPitchPage from "@/app/pitch/page";
import { julyEvent } from "@/test/fixtures";

describe("legacy routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCurrentEvent.mockResolvedValue(julyEvent);
  });

  it("redirects to the same page on the current event", async () => {
    await expect(redirectToCurrentEvent("my-pitches")).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/events/july-2026/my-pitches");
  });

  it("keeps the talk type when redirecting /pitch", async () => {
    await expect(
      LegacyPitchPage({ searchParams: Promise.resolve({ type: "lightning" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/events/july-2026/pitch?type=lightning");
  });

  it("drops a missing talk type", async () => {
    await expect(LegacyPitchPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/events/july-2026/pitch");
  });
});
