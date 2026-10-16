import { redirect } from "next/navigation";
import { requireCurrentEvent } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";

/** Pre-multi-event URLs (/agenda, /pitch, ...) point at the current event. */
export async function redirectToCurrentEvent(page: string, query = ""): Promise<never> {
  const event = await requireCurrentEvent();
  redirect(`${eventPath(event.slug, page)}${query}`);
}
