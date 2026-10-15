import { MyPitchesScreen } from "@/components/submissions/MyPitchesScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAgendaAssignments, getAssignmentsBySubmissionId, isPitchingClosed } from "@/lib/agenda";
import { getMySubmissions, isOrganiser } from "@/lib/submissions";
import { getAgendaItems, requireCurrentEvent } from "@/lib/events.server";

export default async function MyPitchesPage() {
  const user = await requireUser();
  const event = await requireCurrentEvent();
  const [organiser, items, submissions, assignmentsBySubmission, assignmentsBySlot] = await Promise.all([
    isOrganiser(),
    getAgendaItems(event.id),
    getMySubmissions(event.id),
    getAssignmentsBySubmissionId(event.id),
    getAgendaAssignments(event.id),
  ]);
  return (
    <MyPitchesScreen
      event={event}
      items={items}
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      submissions={submissions}
      assignmentsBySubmission={assignmentsBySubmission}
      pitchingClosed={isPitchingClosed(items, assignmentsBySlot)}
    />
  );
}
