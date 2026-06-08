import { MyPitchesScreen } from "@/components/submissions/MyPitchesScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getMySubmissions, isOrganiser } from "@/lib/submissions";

export default async function MyPitchesPage() {
  const user = await requireUser();
  const [organiser, submissions] = await Promise.all([isOrganiser(), getMySubmissions()]);
  return (
    <MyPitchesScreen user={user} isOrganiser={organiser} signOutAction={signOut} submissions={submissions} />
  );
}
