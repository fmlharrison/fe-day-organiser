import { redirect } from "next/navigation";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAllSubmissions, isOrganiser } from "@/lib/submissions";

export default async function AdminPage() {
  const user = await requireUser();
  if (!(await isOrganiser())) redirect("/agenda");
  const submissions = await getAllSubmissions();
  return <AdminScreen user={user} signOutAction={signOut} submissions={submissions} />;
}
