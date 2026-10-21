import { redirect } from "next/navigation";
import { TopBar } from "@/components/agenda/TopBar";
import { EventForm } from "@/components/events/EventForm";
import { signOut } from "@/app/auth/actions";
import { createEvent } from "@/app/events/new/actions";
import { requireUser } from "@/lib/auth/user";
import { listEvents, requireCurrentEvent } from "@/lib/events.server";
import { isOrganiser } from "@/lib/submissions";

export default async function NewEventPage() {
  const user = await requireUser();
  if (!(await isOrganiser())) redirect("/events");

  const [currentEvent, events] = await Promise.all([requireCurrentEvent(), listEvents()]);

  return (
    <div>
      <TopBar event={currentEvent} user={user} isOrganiser signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <EventForm copySources={events} createAction={createEvent} />
      </div>
    </div>
  );
}
