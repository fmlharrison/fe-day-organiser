import { TopBar } from "@/components/agenda/TopBar";
import { AdminSubmissionList } from "@/components/submissions/AdminSubmissionList";
import type { SessionUser } from "@/lib/auth/user";
import type { AssignedTalk } from "@/lib/agenda";
import type { TalkSubmissionRow } from "@/lib/submissions";
import { OPEN_AGENDA_SLOTS } from "@/lib/feday-data";
import { getRemainingOpenSlotCount } from "@/lib/agenda";

type AdminScreenProps = {
  user: SessionUser;
  signOutAction: () => void | Promise<void>;
  submissions: TalkSubmissionRow[];
  assignmentsBySlot: Record<string, AssignedTalk>;
  assignmentsBySubmission: Record<string, AssignedTalk>;
};

export function AdminScreen({
  user,
  signOutAction,
  submissions,
  assignmentsBySlot,
  assignmentsBySubmission,
}: AdminScreenProps) {
  const takenSlotIds = new Set(Object.keys(assignmentsBySlot));
  const remainingOpen = getRemainingOpenSlotCount(assignmentsBySlot);
  const assignedCount = OPEN_AGENDA_SLOTS.length - remainingOpen;

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

        {submissions.length > 0 ? (
          <AdminSubmissionList
            submissions={submissions}
            assignmentsBySubmission={assignmentsBySubmission}
            takenSlotIds={takenSlotIds}
          />
        ) : (
          <div className="txt">No pitches submitted yet.</div>
        )}
      </div>
    </div>
  );
}
