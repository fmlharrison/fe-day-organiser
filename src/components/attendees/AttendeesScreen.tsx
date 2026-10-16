import { TopBar } from "@/components/agenda/TopBar";
import { AttendanceForm } from "@/components/agenda/AttendanceForm";
import { AttendeeList } from "@/components/attendees/AttendeeList";
import type { AttendanceResult } from "@/app/events/[slug]/attendees/actions";
import type { SessionUser } from "@/lib/auth/user";
import type { EventRecord } from "@/lib/events";
import type {
  AttendanceCounts,
  AttendanceMode,
  AttendanceRecord,
} from "@/lib/attendance";

type AttendeesScreenProps = {
  event: EventRecord;
  isPast?: boolean;
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
  attendance: AttendanceRecord | null;
  otherAttendees: AttendanceRecord[];
  counts: AttendanceCounts;
  setAttendanceAction: (mode: AttendanceMode) => Promise<AttendanceResult>;
};

export function AttendeesScreen({
  event,
  isPast = false,
  user,
  isOrganiser,
  signOutAction,
  attendance,
  otherAttendees,
  counts,
  setAttendanceAction,
}: AttendeesScreenProps) {
  const firstName = user.name.split(/\s+/)[0]?.toUpperCase();

  return (
    <div>
      <TopBar event={event} user={user} isOrganiser={isOrganiser} signOutAction={signOutAction} />
      <div className="wrap">
        <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>
          PLAYER {firstName}
        </div>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,42px)",
            color: "var(--gold)",
            textShadow: "4px 4px 0 var(--shadow)",
            marginBottom: 12,
          }}
        >
          WHO&apos;S IN
        </h1>
        <div className="txt-sm" style={{ marginBottom: 26 }}>
          {counts.inPerson} in person · {counts.remote} remote · {counts.total} RSVP&apos;d
        </div>

        {isPast ? (
          <div className="txt" style={{ marginBottom: 34 }}>
            This event has wrapped — RSVPs are closed.
          </div>
        ) : (
          <AttendanceForm
            attendance={attendance}
            counts={counts}
            setAttendanceAction={setAttendanceAction}
          />
        )}

        <div className="pdiv" style={{ margin: "10px 0 28px" }} />

        <AttendeeList attendees={otherAttendees} />
      </div>
    </div>
  );
}
