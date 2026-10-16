import { redirect } from "next/navigation";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAllAttendance, getAttendanceCounts } from "@/lib/attendance.server";
import { getAllSubmissions, isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments, getAssignmentsBySubmissionId } from "@/lib/agenda";
import { getAgendaItems, requireEvent } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminPage({ params }: EventPageProps) {
  const user = await requireUser();
  const event = await requireEvent((await params).slug);
  if (!(await isOrganiser())) redirect(eventPath(event.slug, "agenda"));

  const [items, submissions, assignmentsBySlot, assignmentsBySubmission, attendees, attendanceCounts] =
    await Promise.all([
      getAgendaItems(event.id),
      getAllSubmissions(event.id),
      getAgendaAssignments(event.id),
      getAssignmentsBySubmissionId(event.id),
      getAllAttendance(event.id),
      getAttendanceCounts(event.id),
    ]);

  return (
    <AdminScreen
      event={event}
      items={items}
      user={user}
      signOutAction={signOut}
      submissions={submissions}
      assignmentsBySlot={assignmentsBySlot}
      assignmentsBySubmission={assignmentsBySubmission}
      attendees={attendees}
      attendanceCounts={attendanceCounts}
    />
  );
}
