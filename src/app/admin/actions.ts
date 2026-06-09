"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TalkTypeId } from "@/lib/feday-data";
import { getAgendaAssignments, validateAssignment } from "@/lib/agenda";
import { isOrganiser } from "@/lib/submissions";
import { getSessionUser } from "@/lib/auth/user";

export type AssignResult = { ok: true } | { ok: false; formError: string };

export async function assignSubmissionToSlot(
  submissionId: string,
  slotId: string,
): Promise<AssignResult> {
  if (!(await isOrganiser())) {
    return { ok: false, formError: "Only organisers can assign talks." };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, formError: "Your session expired. Please sign in again." };
  }

  const supabase = await createClient();
  const { data: submission, error: fetchError } = await supabase
    .from("talk_submissions")
    .select("id, type")
    .eq("id", submissionId)
    .maybeSingle();

  if (fetchError || !submission) {
    return { ok: false, formError: "Couldn't find that submission." };
  }

  const assignments = await getAgendaAssignments();
  const validation = validateAssignment({
    slotId,
    submissionId,
    submissionType: submission.type as TalkTypeId,
    assignmentsBySlot: assignments,
  });
  if (!validation.ok) {
    return validation;
  }

  const { error } = await supabase.from("agenda_assignments").insert({
    slot_id: slotId,
    submission_id: submissionId,
    assigned_by: user.id,
  });

  if (error) {
    return { ok: false, formError: "Couldn't assign the talk. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/agenda");
  revalidatePath("/my-pitches");

  return { ok: true };
}

export async function unassignSubmission(submissionId: string): Promise<AssignResult> {
  if (!(await isOrganiser())) {
    return { ok: false, formError: "Only organisers can remove talks from the agenda." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("agenda_assignments")
    .delete()
    .eq("submission_id", submissionId);

  if (error) {
    return { ok: false, formError: "Couldn't remove the talk. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/agenda");
  revalidatePath("/my-pitches");

  return { ok: true };
}

export async function assignSubmissionFromForm(formData: FormData): Promise<AssignResult> {
  const submissionId = String(formData.get("submissionId") ?? "");
  const slotId = String(formData.get("slotId") ?? "");
  return assignSubmissionToSlot(submissionId, slotId);
}

export async function unassignSubmissionFromForm(formData: FormData): Promise<AssignResult> {
  const submissionId = String(formData.get("submissionId") ?? "");
  return unassignSubmission(submissionId);
}
