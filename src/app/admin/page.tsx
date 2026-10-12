import { redirect } from "next/navigation";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAllAttendance, getAttendanceCounts } from "@/lib/attendance.server";
import { getAllSubmissions, isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments, getAssignmentsBySubmissionId } from "@/lib/agenda";
import { getAgendaItems, requireCurrentEvent } from "@/lib/events.server";

export default async function AdminPage() {
  const user = await requireUser();
  if (!(await isOrganiser())) redirect("/agenda");

  const event = await requireCurrentEvent();
  const [items, submissions, assignmentsBySlot, assignmentsBySubmission, attendees, attendanceCounts] =
    await Promise.all([
      getAgendaItems(event.id),
      getAllSubmissions(),
      getAgendaAssignments(),
      getAssignmentsBySubmissionId(),
      getAllAttendance(),
      getAttendanceCounts(),
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
