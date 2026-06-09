import type { CSSProperties } from "react";
import {
  attendanceModeColor,
  formatAttendanceMode,
  type AttendanceRecord,
} from "@/lib/attendance";

type AdminAttendanceListProps = {
  attendees: AttendanceRecord[];
};

function formatRsvpDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminAttendanceList({ attendees }: AdminAttendanceListProps) {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {attendees.map((attendee) => {
        const color = attendanceModeColor(attendee.mode);
        return (
          <div
            key={attendee.userId}
            className="ag-card"
            style={{ "--type-color": color } as CSSProperties}
          >
            <span className="ag-tag" style={{ "--type-color": color } as CSSProperties}>
              {formatAttendanceMode(attendee.mode)}
            </span>
            <div className="ag-title">{attendee.attendeeName}</div>
            <div className="txt-sm" style={{ marginTop: 8 }}>
              {attendee.attendeeEmail}
            </div>
            <div className="txt-sm" style={{ marginTop: 4, color: "var(--ink-dim)" }}>
              RSVP'd {formatRsvpDate(attendee.updatedAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
