import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { isOrganiser } from "@/lib/submissions";

export default async function AgendaPage() {
  const user = await requireUser();
  const organiser = await isOrganiser();
  return <AgendaScreen user={user} isOrganiser={organiser} signOutAction={signOut} />;
}
