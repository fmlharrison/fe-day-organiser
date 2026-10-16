import { AttendeesScreen } from "@/components/attendees/AttendeesScreen";
import { setAttendance } from "@/app/events/[slug]/attendees/actions";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { partitionAttendees } from "@/lib/attendance";
import { getAllAttendance, getAttendanceCounts } from "@/lib/attendance.server";
import { isOrganiser } from "@/lib/submissions";
import { requireEvent } from "@/lib/events.server";
import { isEventPast, todayInLondon } from "@/lib/events";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AttendeesPage({ params }: EventPageProps) {
  const user = await requireUser();
  const event = await requireEvent((await params).slug);
  const [organiser, attendees, counts] = await Promise.all([
    isOrganiser(),
    getAllAttendance(event.id),
    getAttendanceCounts(event.id),
  ]);
  const { mine, others } = partitionAttendees(attendees, user.id);

  return (
    <AttendeesScreen
      event={event}
      isPast={isEventPast(event, todayInLondon())}
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      attendance={mine}
      otherAttendees={others}
      counts={counts}
      setAttendanceAction={setAttendance.bind(null, event.slug)}
    />
  );
}
