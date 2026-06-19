import type { CSSProperties } from "react";
import {
  attendanceModeColor,
  formatAttendanceMode,
  type AttendanceRecord,
} from "@/lib/attendance";

type AttendeeCardProps = {
  attendee: AttendanceRecord;
  showEmail?: boolean;
  highlighted?: boolean;
};

function formatRsvpDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AttendeeCard({ attendee, showEmail = false, highlighted = false }: AttendeeCardProps) {
  const color = attendanceModeColor(attendee.mode);

  return (
    <div
      className="ag-card"
      style={
        {
          "--type-color": color,
          ...(highlighted ? { borderColor: "var(--teal)" } : {}),
        } as CSSProperties
      }
    >
      <span className="ag-tag" style={{ "--type-color": color } as CSSProperties}>
        {formatAttendanceMode(attendee.mode)}
      </span>
      <div className="ag-title">{attendee.attendeeName}</div>
      {showEmail && (
        <>
          <div className="txt-sm" style={{ marginTop: 8 }}>
            {attendee.attendeeEmail}
          </div>
          <div className="txt-sm" style={{ marginTop: 4, color: "var(--ink-dim)" }}>
            RSVP'd {formatRsvpDate(attendee.updatedAt)}
          </div>
        </>
      )}
    </div>
  );
}
