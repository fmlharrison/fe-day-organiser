"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/user";
import { isAttendanceMode, type AttendanceMode } from "@/lib/attendance";

export type AttendanceResult = { ok: true; mode: AttendanceMode } | { ok: false; formError: string };

export async function setAttendance(mode: string): Promise<AttendanceResult> {
  if (!isAttendanceMode(mode)) {
    return { ok: false, formError: "Pick how you're joining — in person or remote." };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, formError: "Your session expired. Please sign in again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("event_attendance").upsert(
    {
      user_id: user.id,
      attendee_name: user.name,
      attendee_email: user.email,
      mode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, formError: "Couldn't save your RSVP. Please try again." };
  }

  revalidatePath("/agenda");

  return { ok: true, mode };
}
