import { redirectToCurrentEvent } from "@/lib/legacy-routes";

export default async function LegacyMyPitchesPage() {
  await redirectToCurrentEvent("my-pitches");
}
