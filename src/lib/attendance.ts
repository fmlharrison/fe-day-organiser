export type AttendanceMode = "in_person" | "remote";

export type AttendanceRecord = {
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  mode: AttendanceMode;
  updatedAt: string;
};

export type AttendanceCounts = {
  inPerson: number;
  remote: number;
  total: number;
};

export const ATTENDANCE_MODES: { id: AttendanceMode; name: string; desc: string; color: string }[] = [
  {
    id: "in_person",
    name: "IN PERSON",
    desc: "See you at Lion's Share — coffee, talks and the full chapter vibe.",
    color: "var(--teal)",
  },
  {
    id: "remote",
    name: "REMOTE",
    desc: "Dial in from wherever — you'll catch the stream and stay in the loop.",
    color: "var(--gold)",
  },
];

export const ATTENDANCE_MODE_IDS = ATTENDANCE_MODES.map((m) => m.id);

export function isAttendanceMode(value: string): value is AttendanceMode {
  return (ATTENDANCE_MODE_IDS as string[]).includes(value);
}

export function formatAttendanceMode(mode: AttendanceMode): string {
  return ATTENDANCE_MODES.find((m) => m.id === mode)?.name ?? mode;
}

export function attendanceModeColor(mode: AttendanceMode): string {
  return ATTENDANCE_MODES.find((m) => m.id === mode)?.color ?? "var(--ink-dim)";
}
