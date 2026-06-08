import Link from "next/link";
import { TopBar } from "@/components/agenda/TopBar";
import { SubmissionList } from "@/components/submissions/SubmissionList";
import type { SessionUser } from "@/lib/auth/user";
import type { TalkSubmissionRow } from "@/lib/submissions";

type MyPitchesScreenProps = {
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
  submissions: TalkSubmissionRow[];
};

export function MyPitchesScreen({ user, isOrganiser, signOutAction, submissions }: MyPitchesScreenProps) {
  const firstName = user.name.split(/\s+/)[0]?.toUpperCase();

  return (
    <div>
      <TopBar user={user} isOrganiser={isOrganiser} signOutAction={signOutAction} />
      <div className="wrap">
        <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>
          PLAYER {firstName}
        </div>
        <h1 style={{ fontSize: "clamp(26px,5vw,42px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)", marginBottom: 26 }}>
          MY PITCHES
        </h1>

        {submissions.length > 0 ? (
          <SubmissionList submissions={submissions} showSubmitter={false} />
        ) : (
          <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
            <div className="txt">No pitches in the queue yet.</div>
            <Link href="/pitch" className="btn orange">
              PITCH AN IDEA ▶
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
