import { AttendeeCard } from "@/components/attendees/AttendeeCard";
import type { AttendanceRecord } from "@/lib/attendance";

type AttendeeListProps = {
  attendees: AttendanceRecord[];
};

export function AttendeeList({ attendees }: AttendeeListProps) {
  if (attendees.length === 0) {
    return (
      <div className="txt">
        No one else has RSVP&apos;d yet — be the first to count yourself in.
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      {attendees.map((attendee) => (
        <AttendeeCard key={attendee.userId} attendee={attendee} />
      ))}
    </div>
  );
}
