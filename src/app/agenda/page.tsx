import { AgendaScreen } from "@/components/agenda/AgendaScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";

export default async function AgendaPage() {
  const user = await requireUser();
  return <AgendaScreen user={user} signOutAction={signOut} />;
}
