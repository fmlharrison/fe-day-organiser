import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/agenda/TopBar";
import { AgendaEditor } from "@/components/events/AgendaEditor";
import { EventForm } from "@/components/events/EventForm";
import { signOut } from "@/app/auth/actions";
import {
  addAgendaItem,
  deleteAgendaItem,
  updateAgendaItem,
  updateEvent,
} from "@/app/events/[slug]/admin/agenda/actions";
import { getAgendaAssignments } from "@/lib/agenda";
import { requireUser } from "@/lib/auth/user";
import { eventEdition } from "@/lib/events";
import { getAgendaItems, requireEvent } from "@/lib/events.server";
import { eventPath } from "@/lib/routes";
import { isOrganiser } from "@/lib/submissions";

type EditAgendaPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditAgendaPage({ params }: EditAgendaPageProps) {
  const user = await requireUser();
  const event = await requireEvent((await params).slug);
  if (!(await isOrganiser())) redirect(eventPath(event.slug, "agenda"));

  const [items, assignmentsBySlot] = await Promise.all([
    getAgendaItems(event.id),
    getAgendaAssignments(event.id),
  ]);
  const assignedTalkTitles = Object.fromEntries(
    Object.values(assignmentsBySlot).map((assignment) => [assignment.slotId, assignment.title]),
  );

  return (
    <div>
      <TopBar event={event} user={user} isOrganiser signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 860 }}>
        <Link
          href={eventPath(event.slug, "admin")}
          className="pixel"
          style={{ display: "inline-block", color: "var(--teal)", fontSize: 11, marginBottom: 16 }}
        >
          {"<"} BACK TO ADMIN
        </Link>
        <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>
          ORGANISER · {eventEdition(event)}
        </div>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,42px)",
            color: "var(--gold)",
            textShadow: "4px 4px 0 var(--shadow)",
            marginBottom: 26,
          }}
        >
          EDIT AGENDA
        </h1>

        <h2 style={{ fontSize: 14, color: "var(--teal)", marginBottom: 16 }}>EVENT DETAILS</h2>
        <EventForm
          initialValues={{
            slug: event.slug,
            title: event.title,
            tagline: event.tagline,
            eventDate: event.eventDate,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            copyAgendaFromEventId: "",
          }}
          slugLocked
          submitLabel="SAVE DETAILS"
          cancelHref={eventPath(event.slug, "admin")}
          submitAction={updateEvent.bind(null, event.slug)}
        />

        <div className="pdiv" style={{ margin: "40px 0 28px" }} />

        <h2 style={{ fontSize: 14, color: "var(--teal)", marginBottom: 16 }}>AGENDA</h2>
        <AgendaEditor
          items={items}
          assignedTalkTitles={assignedTalkTitles}
          addAction={addAgendaItem.bind(null, event.slug)}
          updateAction={updateAgendaItem.bind(null, event.slug)}
          deleteAction={deleteAgendaItem.bind(null, event.slug)}
        />
      </div>
    </div>
  );
}
