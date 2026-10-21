import Link from "next/link";
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
  // Most events look like the last one, so start from its details.
  const latest = events[0];

  return (
    <div>
      <TopBar event={currentEvent} user={user} isOrganiser signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <Link
          href="/events"
          className="pixel"
          style={{ display: "inline-block", color: "var(--teal)", fontSize: 11, marginBottom: 16 }}
        >
          {"<"} ALL EVENTS
        </Link>
        <h1
          style={{
            fontSize: "clamp(24px,5vw,38px)",
            color: "var(--gold)",
            textShadow: "4px 4px 0 var(--shadow)",
            marginBottom: 26,
          }}
        >
          NEW EVENT
        </h1>
        <EventForm
          initialValues={{
            slug: "",
            title: latest?.title ?? "FE DAY",
            tagline: latest?.tagline ?? "",
            eventDate: "",
            startTime: latest?.startTime ?? "10:00",
            endTime: latest?.endTime ?? "16:00",
            location: latest?.location ?? "",
            copyAgendaFromEventId: latest?.id ?? "",
          }}
          copySources={events}
          submitLabel="CREATE EVENT"
          cancelHref="/events"
          submitAction={createEvent}
        />
      </div>
    </div>
  );
}
