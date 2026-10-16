import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { setAttendance } from "@/app/events/[slug]/attendees/actions";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAttendanceCounts, getAttendanceForUser } from "@/lib/attendance.server";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments } from "@/lib/agenda";
import { getAgendaItems, requireEvent } from "@/lib/events.server";
import { isEventPast, todayInLondon } from "@/lib/events";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AgendaPage({ params }: EventPageProps) {
  const user = await requireUser();
  const event = await requireEvent((await params).slug);
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
      isPast={isEventPast(event, todayInLondon())}
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      assignmentsBySlot={assignmentsBySlot}
      attendance={attendance}
      attendanceCounts={attendanceCounts}
      setAttendanceAction={setAttendance.bind(null, event.slug)}
    />
  );
}
