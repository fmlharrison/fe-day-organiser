import { TopBar } from "@/components/agenda/TopBar";
import { PitchForm } from "@/components/pitch/PitchForm";
import { signOut } from "@/app/auth/actions";
import { submitTalk } from "@/app/pitch/actions";
import { requireUser } from "@/lib/auth/user";
import { getAgendaAssignments, isPitchingClosed } from "@/lib/agenda";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaItems, requireCurrentEvent } from "@/lib/events.server";

type PitchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PitchPage({ searchParams }: PitchPageProps) {
  const user = await requireUser();
  const event = await requireCurrentEvent();
  const [organiser, items, assignmentsBySlot] = await Promise.all([
    isOrganiser(),
    getAgendaItems(event.id),
    getAgendaAssignments(),
  ]);
  const pitchingClosed = isPitchingClosed(items, assignmentsBySlot);
  const t = (await searchParams).type;
  const presetType = typeof t === "string" ? t : undefined;

  return (
    <div>
      <TopBar event={event} user={user} isOrganiser={organiser} signOutAction={signOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <PitchForm
          userName={user.name}
          presetType={presetType}
          pitchingClosed={pitchingClosed}
          submitAction={submitTalk}
        />
      </div>
    </div>
  );
}
