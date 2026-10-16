import { EventsScreen } from "@/components/events/EventsScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { todayInLondon } from "@/lib/events";
import { listEvents, requireCurrentEvent } from "@/lib/events.server";
import { isOrganiser } from "@/lib/submissions";

export default async function EventsPage() {
  const user = await requireUser();
  const [currentEvent, events, organiser] = await Promise.all([
    requireCurrentEvent(),
    listEvents(),
    isOrganiser(),
  ]);

  return (
    <EventsScreen
      currentEvent={currentEvent}
      events={events}
      today={todayInLondon()}
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
    />
  );
}
