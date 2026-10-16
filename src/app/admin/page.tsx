import { redirectToCurrentEvent } from "@/lib/legacy-routes";

export default async function LegacyAdminPage() {
  await redirectToCurrentEvent("admin");
}
