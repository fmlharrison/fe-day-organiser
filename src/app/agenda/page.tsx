import { redirectToCurrentEvent } from "@/lib/legacy-routes";

export default async function LegacyAgendaPage() {
  await redirectToCurrentEvent("agenda");
}
