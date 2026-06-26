import { MyPitchesScreen } from "@/components/submissions/MyPitchesScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAgendaAssignments, getAssignmentsBySubmissionId, isPitchingClosed } from "@/lib/agenda";
import { getMySubmissions, isOrganiser } from "@/lib/submissions";

export default async function MyPitchesPage() {
  const user = await requireUser();
  const [organiser, submissions, assignmentsBySubmission, assignmentsBySlot] = await Promise.all([
    isOrganiser(),
    getMySubmissions(),
    getAssignmentsBySubmissionId(),
    getAgendaAssignments(),
  ]);
  return (
    <MyPitchesScreen
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      submissions={submissions}
      assignmentsBySubmission={assignmentsBySubmission}
      pitchingClosed={isPitchingClosed(assignmentsBySlot)}
    />
  );
}
