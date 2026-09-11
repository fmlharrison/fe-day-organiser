import { notFound } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { saveFeedback } from "@/app/agenda/[submissionId]/feedback/actions";
import { TopBar } from "@/components/agenda/TopBar";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { getAssignmentsBySubmissionId } from "@/lib/agenda";
import { requireUser } from "@/lib/auth/user";
import { getFeedbackForReviewer } from "@/lib/feedback.server";
import { isOrganiser } from "@/lib/submissions";

type FeedbackPageProps = {
  params: Promise<{ submissionId: string }>;
};

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const user = await requireUser();
  const { submissionId } = await params;
  const assignments = await getAssignmentsBySubmissionId();

  if (!Object.prototype.hasOwnProperty.call(assignments, submissionId)) notFound();

  const assignment = assignments[submissionId];

  const [organiser, feedback] = await Promise.all([
    isOrganiser(),
    getFeedbackForReviewer(submissionId, user.id),
  ]);
  const saveFeedbackForSubmission = saveFeedback.bind(null, submissionId);

  return (
    <div>
      <TopBar user={user} isOrganiser={organiser} signOutAction={signOut} />
      <main className="wrap" style={{ maxWidth: 760 }}>
        <FeedbackForm
          assignment={assignment}
          existingFeedback={feedback}
          saveAction={saveFeedbackForSubmission}
        />
      </main>
    </div>
  );
}
