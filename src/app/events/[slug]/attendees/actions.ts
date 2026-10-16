"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/user";
import { getEventBySlug } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";
import { isEventPast, todayInLondon } from "@/lib/events";
import { isAttendanceMode, type AttendanceMode } from "@/lib/attendance";

export type AttendanceResult = { ok: true; mode: AttendanceMode } | { ok: false; formError: string };

export async function setAttendance(eventSlug: string, mode: string): Promise<AttendanceResult> {
  if (!isAttendanceMode(mode)) {
    return { ok: false, formError: "Pick how you're joining — in person or remote." };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, formError: "Your session expired. Please sign in again." };
  }

  const event = await getEventBySlug(eventSlug);
  if (!event) {
    return { ok: false, formError: "That event doesn't exist." };
  }
  if (isEventPast(event, todayInLondon())) {
    return { ok: false, formError: "This event has wrapped — RSVPs are closed." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_id: event.id,
      user_id: user.id,
      attendee_name: user.name,
      attendee_email: user.email,
      mode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    return { ok: false, formError: "Couldn't save your RSVP. Please try again." };
  }

  revalidatePath(eventPath(event.slug), "layout");

  return { ok: true, mode };
}
