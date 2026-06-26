import { createClient } from "@/lib/supabase/server";
import {
  OPEN_AGENDA_SLOTS,
  OPEN_SLOT_IDS,
  SLOT_BY_ID,
  type AgendaRow,
} from "@/lib/feday-data";
import type { TalkTypeId } from "@/lib/feday-data";

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
  slot_id: string;
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
    slotId: row.slot_id,
    submissionId: sub.id,
    title: sub.title,
    description: sub.description,
    submitterName: sub.submitter_name,
    team: sub.team,
    type: sub.type,
  };
}

export async function getAgendaAssignments(): Promise<Record<string, AssignedTalk>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agenda_assignments")
    .select(
      "slot_id, submission_id, talk_submissions ( id, title, description, submitter_name, team, type )",
    );

  const bySlot: Record<string, AssignedTalk> = {};
  for (const row of data ?? []) {
    const mapped = mapAssignmentRow(row as AssignmentJoinRow);
    if (mapped) bySlot[mapped.slotId] = mapped;
  }
  return bySlot;
}

export async function getAssignmentsBySubmissionId(): Promise<Record<string, AssignedTalk>> {
  const bySlot = await getAgendaAssignments();
  const bySubmission: Record<string, AssignedTalk> = {};
  for (const assignment of Object.values(bySlot)) {
    bySubmission[assignment.submissionId] = assignment;
  }
  return bySubmission;
}

export function resolveAgendaRow(
  row: AgendaRow,
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
    desc: row.desc,
    isFilled: false,
    showClaimLink: isOpen,
  };
}

export function getOrphanedAssignments(
  assignmentsBySlot: Record<string, AssignedTalk>,
): AssignedTalk[] {
  return Object.values(assignmentsBySlot).filter(
    (assignment) => !OPEN_SLOT_IDS.has(assignment.slotId),
  );
}

export function getRemainingOpenSlotCount(
  assignmentsBySlot: Record<string, AssignedTalk>,
): number {
  const filledOpenSlots = Object.keys(assignmentsBySlot).filter((slotId) =>
    OPEN_SLOT_IDS.has(slotId),
  ).length;
  return OPEN_AGENDA_SLOTS.length - filledOpenSlots;
}

export function isPitchingClosed(
  assignmentsBySlot: Record<string, AssignedTalk>,
): boolean {
  return getRemainingOpenSlotCount(assignmentsBySlot) === 0;
}

export type AssignmentValidationResult = { ok: true } | { ok: false; formError: string };

export function validateAssignment(params: {
  slotId: string;
  submissionId: string;
  submissionType: TalkTypeId;
  assignmentsBySlot: Record<string, AssignedTalk>;
}): AssignmentValidationResult {
  const openSlot = OPEN_AGENDA_SLOTS.find((row) => row.id === params.slotId);
  if (!openSlot) {
    if (SLOT_BY_ID[params.slotId]) {
      return { ok: false, formError: "That agenda slot is no longer available." };
    }
    return { ok: false, formError: "That agenda slot doesn't exist." };
  }

  if (params.submissionType !== openSlot.kind) {
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
