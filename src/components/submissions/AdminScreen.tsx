import { TopBar } from "@/components/agenda/TopBar";
import { AdminAttendanceList } from "@/components/submissions/AdminAttendanceList";
import { AdminSubmissionList } from "@/components/submissions/AdminSubmissionList";
import type { SessionUser } from "@/lib/auth/user";
import type { AssignedTalk } from "@/lib/agenda";
import type { AttendanceCounts, AttendanceRecord } from "@/lib/attendance";
import type { TalkSubmissionRow } from "@/lib/submissions";
import { OPEN_AGENDA_SLOTS, SLOT_BY_ID, formatSlotLabel } from "@/lib/feday-data";
import { getRemainingOpenSlotCount, getOrphanedAssignments } from "@/lib/agenda";

type AdminScreenProps = {
  user: SessionUser;
  signOutAction: () => void | Promise<void>;
  submissions: TalkSubmissionRow[];
  assignmentsBySlot: Record<string, AssignedTalk>;
  assignmentsBySubmission: Record<string, AssignedTalk>;
  attendees?: AttendanceRecord[];
  attendanceCounts?: AttendanceCounts;
};

export function AdminScreen({
  user,
  signOutAction,
  submissions,
  assignmentsBySlot,
  assignmentsBySubmission,
  attendees = [],
  attendanceCounts = { inPerson: 0, remote: 0, total: 0 },
}: AdminScreenProps) {
  const takenSlotIds = new Set(
    Object.keys(assignmentsBySlot).filter((slotId) =>
      OPEN_AGENDA_SLOTS.some((slot) => slot.id === slotId),
    ),
  );
  const remainingOpen = getRemainingOpenSlotCount(assignmentsBySlot);
  const assignedCount = OPEN_AGENDA_SLOTS.length - remainingOpen;
  const orphanedAssignments = getOrphanedAssignments(assignmentsBySlot);

  return (
    <div>
      <TopBar user={user} isOrganiser={true} signOutAction={signOutAction} />
      <div className="wrap">
        <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>
          ORGANISER
        </div>
        <h1 style={{ fontSize: "clamp(26px,5vw,42px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)", marginBottom: 12 }}>
          ALL PITCHES
        </h1>
        <div className="txt-sm" style={{ marginBottom: 26 }}>
          {submissions.length} submitted · {assignedCount} on the agenda · {remainingOpen} open slots left
        </div>

        {orphanedAssignments.length > 0 && (
          <div
            className="txt-sm"
            style={{
              marginBottom: 26,
              padding: 16,
              border: "2px solid var(--orange)",
              background: "var(--bg-2)",
            }}
          >
            <div className="pixel" style={{ fontSize: 10, color: "var(--orange)", marginBottom: 10 }}>
              ORPHANED AGENDA SLOTS
            </div>
            <p style={{ marginBottom: 12 }}>
              These talks are assigned to slots that are no longer on the agenda. Remove them and
              reassign to an open slot.
            </p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {orphanedAssignments.map((assignment) => (
                <li key={assignment.submissionId} style={{ marginBottom: 6 }}>
                  <strong>{assignment.title}</strong> —{" "}
                  {formatSlotLabel(SLOT_BY_ID[assignment.slotId])}
                </li>
              ))}
            </ul>
          </div>
        )}

        {submissions.length > 0 ? (
          <AdminSubmissionList
            submissions={submissions}
            assignmentsBySubmission={assignmentsBySubmission}
            takenSlotIds={takenSlotIds}
          />
        ) : (
          <div className="txt">No pitches submitted yet.</div>
        )}

        <div className="pdiv" style={{ margin: "40px 0 28px" }} />

        <h2
          style={{
            fontSize: "clamp(22px,4vw,32px)",
            color: "var(--teal)",
            textShadow: "3px 3px 0 var(--shadow)",
            marginBottom: 12,
          }}
        >
          ATTENDEES
        </h2>
        <div className="txt-sm" style={{ marginBottom: 26 }}>
          {attendanceCounts.inPerson} in person · {attendanceCounts.remote} remote ·{" "}
          {attendanceCounts.total} RSVP'd
        </div>

        {attendees.length > 0 ? (
          <AdminAttendanceList attendees={attendees} />
        ) : (
          <div className="txt">No one has RSVP'd yet.</div>
        )}
      </div>
    </div>
  );
}
