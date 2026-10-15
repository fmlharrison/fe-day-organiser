import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { setAttendance } from "@/app/attendees/actions";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAttendanceCounts, getAttendanceForUser } from "@/lib/attendance.server";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments } from "@/lib/agenda";
import { getAgendaItems, requireCurrentEvent } from "@/lib/events.server";

export default async function AgendaPage() {
  const user = await requireUser();
  const event = await requireCurrentEvent();
  const [organiser, items, assignmentsBySlot, attendance, attendanceCounts] = await Promise.all([
    isOrganiser(),
    getAgendaItems(event.id),
    getAgendaAssignments(event.id),
    getAttendanceForUser(event.id, user.id),
    getAttendanceCounts(event.id),
  ]);
  return (
    <AgendaScreen
      event={event}
      items={items}
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      assignmentsBySlot={assignmentsBySlot}
      attendance={attendance}
      attendanceCounts={attendanceCounts}
      setAttendanceAction={setAttendance}
    />
  );
}
