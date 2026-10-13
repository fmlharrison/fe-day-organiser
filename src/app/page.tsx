import { redirect } from "next/navigation";
import { LandingScreen } from "@/components/landing/LandingScreen";
import { signInWithGoogle } from "@/app/auth/actions";
import { getSessionUser } from "@/lib/auth/user";
import { requireCurrentEvent } from "@/lib/events.server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/agenda");

  const event = await requireCurrentEvent();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return <LandingScreen event={event} error={error} signInAction={signInWithGoogle} />;
}
