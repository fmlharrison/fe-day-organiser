import { AttendeesScreen } from "@/components/attendees/AttendeesScreen";
import { setAttendance } from "@/app/attendees/actions";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { partitionAttendees } from "@/lib/attendance";
import { getAllAttendance, getAttendanceCounts } from "@/lib/attendance.server";
import { isOrganiser } from "@/lib/submissions";

export default async function AttendeesPage() {
  const user = await requireUser();
  const [organiser, attendees, counts] = await Promise.all([
    isOrganiser(),
    getAllAttendance(),
    getAttendanceCounts(),
  ]);
  const { mine, others } = partitionAttendees(attendees, user.id);

  return (
    <AttendeesScreen
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      attendance={mine}
      otherAttendees={others}
      counts={counts}
      setAttendanceAction={setAttendance}
    />
  );
}
