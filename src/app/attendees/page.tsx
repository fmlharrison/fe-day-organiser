import { redirectToCurrentEvent } from "@/lib/legacy-routes";

export default async function LegacyAttendeesPage() {
  await redirectToCurrentEvent("attendees");
}
