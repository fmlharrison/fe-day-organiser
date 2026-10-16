import { TopBar } from "@/components/agenda/TopBar";
import { PitchForm } from "@/components/pitch/PitchForm";
import { signOut } from "@/app/auth/actions";
import { submitTalk } from "@/app/events/[slug]/pitch/actions";
import { requireUser } from "@/lib/auth/user";
import { getAgendaAssignments, isPitchingClosed } from "@/lib/agenda";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaItems, requireEvent } from "@/lib/events.server";

type PitchPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PitchPage({ params, searchParams }: PitchPageProps) {
  const user = await requireUser();
  const event = await requireEvent((await params).slug);
  const [organiser, items, assignmentsBySlot] = await Promise.all([
    isOrganiser(),
    getAgendaItems(event.id),
    getAgendaAssignments(event.id),
  ]);
  const pitchingClosed = isPitchingClosed(items, assignmentsBySlot);
  const t = (await searchParams).type;
  const presetType = typeof t === "string" ? t : undefined;

  return (
    <div>
      <TopBar event={event} user={user} isOrganiser={organiser} signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <PitchForm
          eventSlug={event.slug}
          userName={user.name}
          presetType={presetType}
          pitchingClosed={pitchingClosed}
          submitAction={submitTalk.bind(null, event.slug)}
        />
      </div>
    </div>
  );
}
