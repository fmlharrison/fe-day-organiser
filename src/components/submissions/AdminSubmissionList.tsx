import type { CSSProperties } from "react";
import { TYPE_BY_ID, SLOT_BY_ID, formatSlotLabel, getOpenSlotsForType } from "@/lib/feday-data";
import type { AssignedTalk } from "@/lib/agenda";
import type { TalkSubmissionRow } from "@/lib/submissions";
import { assignSubmissionFromForm, unassignSubmissionFromForm } from "@/app/admin/actions";
import { AdminAssignForm } from "@/components/submissions/AdminAssignForm";

type AdminSubmissionListProps = {
  submissions: TalkSubmissionRow[];
  assignmentsBySubmission: Record<string, AssignedTalk>;
  takenSlotIds: Set<string>;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminSubmissionList({
  submissions,
  assignmentsBySubmission,
  takenSlotIds,
}: AdminSubmissionListProps) {
  return (
    <div>
      {submissions.map((row) => {
        const type = TYPE_BY_ID[row.type];
        const assignment = assignmentsBySubmission[row.id];
        const availableSlots = getOpenSlotsForType(row.type).filter(
          (slot) => !takenSlotIds.has(slot.id),
        );

        return (
          <div key={row.id} className="ag-card" style={{ "--type-color": type.color } as CSSProperties}>
            <span className="ag-tag" style={{ "--type-color": type.color } as CSSProperties}>
              {type.name}
            </span>
            <div className="ag-title">{row.title}</div>
            <div className="ag-desc">{row.description}</div>
            <div className="txt-sm" style={{ marginTop: 10 }}>
              {row.team} · {formatDate(row.created_at)}
            </div>
            <div className="txt-sm" style={{ marginTop: 4 }}>
              {row.submitter_name} · {row.submitter_email}
            </div>

            {assignment ? (
              <div style={{ marginTop: 16 }}>
                <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 10 }}>
                  SCHEDULED · {formatSlotLabel(SLOT_BY_ID[assignment.slotId])}
                </div>
                <AdminAssignForm
                  action={unassignSubmissionFromForm}
                  submissionId={row.id}
                  submitLabel="REMOVE FROM AGENDA"
                  variant="ghost sm"
                />
              </div>
            ) : (
              <AdminAssignForm
                action={assignSubmissionFromForm}
                submissionId={row.id}
                submitLabel="CONFIRM & ASSIGN"
                variant="orange sm"
                slots={availableSlots.map((slot) => ({
                  id: slot.id,
                  label: formatSlotLabel(slot),
                }))}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
