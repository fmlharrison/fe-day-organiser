import { createClient } from "@/lib/supabase/server";
import { KIND_META, type TalkTypeId } from "@/lib/feday-data";
import type { AgendaItem } from "@/lib/events";

export type AssignedTalk = {
  slotId: string;
  submissionId: string;
  title: string;
  description: string;
  submitterName: string;
  team: string;
  type: TalkTypeId;
};

export type ResolvedAgendaRow = {
  title: string;
  desc: string;
  speaker?: string;
  isFilled: boolean;
  showClaimLink: boolean;
};

type SubmissionJoin = {
  id: string;
  title: string;
  description: string;
  submitter_name: string;
  team: string;
  type: TalkTypeId;
};

type AssignmentJoinRow = {
  agenda_item_id: string;
  submission_id: string;
  talk_submissions: SubmissionJoin | SubmissionJoin[] | null;
};

function normalizeSubmission(
  talkSubmissions: AssignmentJoinRow["talk_submissions"],
): SubmissionJoin | null {
  if (!talkSubmissions) return null;
  return Array.isArray(talkSubmissions) ? (talkSubmissions[0] ?? null) : talkSubmissions;
}

function mapAssignmentRow(row: AssignmentJoinRow): AssignedTalk | null {
  const sub = normalizeSubmission(row.talk_submissions);
  if (!sub) return null;
  return {
    slotId: row.agenda_item_id,
    submissionId: sub.id,
    title: sub.title,
    description: sub.description,
    submitterName: sub.submitter_name,
    team: sub.team,
    type: sub.type,
  };
}

export async function getAgendaAssignments(
  eventId: string,
): Promise<Record<string, AssignedTalk>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agenda_assignments")
    .select(
      "agenda_item_id, submission_id, talk_submissions ( id, title, description, submitter_name, team, type )",
    )
    .eq("event_id", eventId);

  const bySlot: Record<string, AssignedTalk> = {};
  for (const row of data ?? []) {
    const mapped = mapAssignmentRow(row as AssignmentJoinRow);
    if (mapped) bySlot[mapped.slotId] = mapped;
  }
  return bySlot;
}

export async function getAssignmentsBySubmissionId(
  eventId: string,
): Promise<Record<string, AssignedTalk>> {
  const bySlot = await getAgendaAssignments(eventId);
  const bySubmission: Record<string, AssignedTalk> = {};
  for (const assignment of Object.values(bySlot)) {
    bySubmission[assignment.submissionId] = assignment;
  }
  return bySubmission;
}

export function getOpenSlots(items: AgendaItem[]): AgendaItem[] {
  return items.filter((item) => KIND_META[item.kind].open);
}

export function resolveAgendaRow(
  row: AgendaItem,
  assignment: AssignedTalk | undefined,
  isOpen: boolean,
): ResolvedAgendaRow {
  if (isOpen && assignment) {
    return {
      title: assignment.title,
      desc: assignment.description,
      speaker: `${assignment.submitterName}, ${assignment.team}`,
      isFilled: true,
      showClaimLink: false,
    };
  }

  return {
    title: row.title,
    desc: row.description,
    isFilled: false,
    showClaimLink: isOpen,
  };
}

export function getRemainingOpenSlotCount(
  items: AgendaItem[],
  assignmentsBySlot: Record<string, AssignedTalk>,
): number {
  return getOpenSlots(items).filter((slot) => !assignmentsBySlot[slot.id]).length;
}

export function hasAgenda(items: AgendaItem[]): boolean {
  return items.length > 0;
}

export function isPitchingClosed(params: {
  isPast: boolean;
  items: AgendaItem[];
  assignmentsBySlot: Record<string, AssignedTalk>;
}): boolean {
  if (params.isPast) return true;
  // Until the agenda has talk slots, pitches are still welcome.
  if (getOpenSlots(params.items).length === 0) return false;
  return getRemainingOpenSlotCount(params.items, params.assignmentsBySlot) === 0;
}

export type AssignmentValidationResult = { ok: true } | { ok: false; formError: string };

export function validateAssignment(params: {
  slotId: string;
  submissionId: string;
  submissionType: TalkTypeId;
  items: AgendaItem[];
  assignmentsBySlot: Record<string, AssignedTalk>;
}): AssignmentValidationResult {
  const slot = params.items.find((item) => item.id === params.slotId);
  if (!slot) {
    return { ok: false, formError: "That agenda slot doesn't exist." };
  }
  if (!KIND_META[slot.kind].open) {
    return { ok: false, formError: "That agenda slot isn't open for talks." };
  }

  if (params.submissionType !== slot.kind) {
    return { ok: false, formError: "Talk type doesn't match the slot type." };
  }

  if (params.assignmentsBySlot[params.slotId]) {
    return { ok: false, formError: "That slot is already taken." };
  }

  const alreadyAssigned = Object.values(params.assignmentsBySlot).find(
    (a) => a.submissionId === params.submissionId,
  );
  if (alreadyAssigned) {
    return {
      ok: false,
      formError: "This submission is already on the agenda. Remove it first to reassign.",
    };
  }

  return { ok: true };
}
