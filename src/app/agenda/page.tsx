import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { setAttendance } from "@/app/agenda/actions";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAttendanceCounts, getAttendanceForUser } from "@/lib/attendance.server";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments } from "@/lib/agenda";

export default async function AgendaPage() {
  const user = await requireUser();
  const [organiser, assignmentsBySlot, attendance, attendanceCounts] = await Promise.all([
    isOrganiser(),
    getAgendaAssignments(),
    getAttendanceForUser(user.id),
    getAttendanceCounts(),
  ]);
  return (
    <AgendaScreen
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
