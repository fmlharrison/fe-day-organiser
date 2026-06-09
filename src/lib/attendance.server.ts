import { createClient } from "@/lib/supabase/server";
import type { AttendanceCounts, AttendanceMode, AttendanceRecord } from "@/lib/attendance";

type AttendanceRow = {
  user_id: string;
  attendee_name: string;
  attendee_email: string;
  mode: AttendanceMode;
  updated_at: string;
};

function mapAttendanceRow(row: AttendanceRow): AttendanceRecord {
  return {
    userId: row.user_id,
    attendeeName: row.attendee_name,
    attendeeEmail: row.attendee_email,
    mode: row.mode,
    updatedAt: row.updated_at,
  };
}

export async function getAttendanceForUser(userId: string): Promise<AttendanceRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_attendance")
    .select("user_id, attendee_name, attendee_email, mode, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  return data ? mapAttendanceRow(data as AttendanceRow) : null;
}

export async function getAttendanceCounts(): Promise<AttendanceCounts> {
  const supabase = await createClient();
  const { data } = await supabase.from("event_attendance").select("mode");

  let inPerson = 0;
  let remote = 0;
  for (const row of data ?? []) {
    if (row.mode === "in_person") inPerson += 1;
    else if (row.mode === "remote") remote += 1;
  }

  return { inPerson, remote, total: inPerson + remote };
}
