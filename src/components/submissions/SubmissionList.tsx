import type { CSSProperties } from "react";
import { TYPE_BY_ID } from "@/lib/feday-data";
import type { TalkSubmissionRow } from "@/lib/submissions";

type SubmissionListProps = {
  submissions: TalkSubmissionRow[];
  showSubmitter: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SubmissionList({ submissions, showSubmitter }: SubmissionListProps) {
  return (
    <div>
      {submissions.map((row) => {
        const type = TYPE_BY_ID[row.type];
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
            {showSubmitter && (
              <div className="txt-sm" style={{ marginTop: 4 }}>
                {row.submitter_name} · {row.submitter_email}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
