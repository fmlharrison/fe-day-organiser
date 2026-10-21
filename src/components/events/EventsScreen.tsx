import Link from "next/link";
import { TopBar } from "@/components/agenda/TopBar";
import type { SessionUser } from "@/lib/auth/user";
import {
  eventEdition,
  formatEventDateShort,
  formatEventTimeRange,
  isEventPast,
  type EventRecord,
} from "@/lib/events";
import { eventPath } from "@/lib/routes";

type EventsScreenProps = {
  currentEvent: EventRecord;
  events: EventRecord[];
  today: string;
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
};

function EventCard({ event }: { event: EventRecord }) {
  return (
    <div className="ag-card" style={{ marginBottom: 16 }}>
      <div className="ag-title">
        {event.title} · {eventEdition(event)}
      </div>
      <div className="ag-desc">
        {formatEventDateShort(event)} · {formatEventTimeRange(event)} · {event.location}
      </div>
      <Link href={eventPath(event.slug, "agenda")} className="ag-open">
        VIEW AGENDA {">"}
      </Link>
    </div>
  );
}

function EventSection({ title, events }: { title: string; events: EventRecord[] }) {
  if (events.length === 0) return null;
  return (
    <section style={{ marginBottom: 34 }}>
      <h2 style={{ fontSize: 14, color: "var(--teal)", marginBottom: 16 }}>{title}</h2>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  );
}

export function EventsScreen({
  currentEvent,
  events,
  today,
  user,
  isOrganiser,
  signOutAction,
}: EventsScreenProps) {
  // `events` arrives newest first; list upcoming events soonest first.
  const upcoming = events.filter((event) => !isEventPast(event, today)).reverse();
  const past = events.filter((event) => isEventPast(event, today));

  return (
    <div>
      <TopBar event={currentEvent} user={user} isOrganiser={isOrganiser} signOutAction={signOutAction} />
      <div className="wrap">
        <div className="row between" style={{ gap: 18, flexWrap: "wrap", marginBottom: 26 }}>
          <h1
            style={{
              fontSize: "clamp(26px,5vw,42px)",
              color: "var(--gold)",
              textShadow: "4px 4px 0 var(--shadow)",
            }}
          >
            ALL EVENTS
          </h1>
          {isOrganiser && (
            <Link href="/events/new" className="btn orange">
              + NEW EVENT
            </Link>
          )}
        </div>
        <EventSection title="UPCOMING" events={upcoming} />
        <EventSection title="PAST" events={past} />
      </div>
    </div>
  );
}
