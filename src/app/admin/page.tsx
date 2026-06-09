import { redirect } from "next/navigation";
import { AdminScreen } from "@/components/submissions/AdminScreen";
import { signOut } from "@/app/auth/actions";
import { requireUser } from "@/lib/auth/user";
import { getAllSubmissions, isOrganiser } from "@/lib/submissions";
import { getAgendaAssignments, getAssignmentsBySubmissionId } from "@/lib/agenda";

export default async function AdminPage() {
  const user = await requireUser();
  if (!(await isOrganiser())) redirect("/agenda");

  const [submissions, assignmentsBySlot, assignmentsBySubmission] = await Promise.all([
    getAllSubmissions(),
    getAgendaAssignments(),
    getAssignmentsBySubmissionId(),
  ]);

  return (
    <AdminScreen
      user={user}
      signOutAction={signOut}
      submissions={submissions}
      assignmentsBySlot={assignmentsBySlot}
      assignmentsBySubmission={assignmentsBySubmission}
    />
  );
}
