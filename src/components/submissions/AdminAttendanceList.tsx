import { AttendeeCard } from "@/components/attendees/AttendeeCard";
import type { AttendanceRecord } from "@/lib/attendance";

type AdminAttendanceListProps = {
  attendees: AttendanceRecord[];
};

export function AdminAttendanceList({ attendees }: AdminAttendanceListProps) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {attendees.map((attendee) => (
        <AttendeeCard key={attendee.userId} attendee={attendee} showEmail />
      ))}
    </div>
  );
}
