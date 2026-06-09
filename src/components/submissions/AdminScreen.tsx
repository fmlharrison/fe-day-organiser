import { TopBar } from "@/components/agenda/TopBar";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import type { SessionUser } from "@/lib/auth/user";
import type { TalkSubmissionRow } from "@/lib/submissions";

type AdminScreenProps = {
  user: SessionUser;
  signOutAction: () => void | Promise<void>;
  submissions: TalkSubmissionRow[];
};

export function AdminScreen({ user, signOutAction, submissions }: AdminScreenProps) {
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
          {submissions.length} submitted
        </div>

        {submissions.length > 0 ? (
          <SubmissionList submissions={submissions} showSubmitter={true} />
        ) : (
          <div className="txt">No pitches submitted yet.</div>
        )}
      </div>
    </div>
  );
}
