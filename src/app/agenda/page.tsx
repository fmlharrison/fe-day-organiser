import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments } from "@/lib/agenda";

export default async function AgendaPage() {
  const user = await requireUser();
  const [organiser, assignmentsBySlot] = await Promise.all([
    isOrganiser(),
    getAgendaAssignments(),
  ]);
  return (
    <AgendaScreen
      user={user}
      isOrganiser={organiser}
      signOutAction={signOut}
      assignmentsBySlot={assignmentsBySlot}
    />
  );
}
