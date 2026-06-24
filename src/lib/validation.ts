import { PITCHABLE_TALK_TYPE_IDS, type TalkTypeId } from "@/lib/feday-data";

export type TalkSubmissionInput = {
  type: string;
  title: string;
  description: string;
  name: string;
  team: string;
};

export type ValidationErrors = Partial<
  Record<"type" | "title" | "description" | "name" | "team", string>
>;

export type SubmittedTalk = {
  type: TalkTypeId;
  title: string;
  name: string;
  team: string;
};

export type SubmitResult =
  | { ok: true; submission: SubmittedTalk }
  | { ok: false; errors: ValidationErrors; formError?: string };

export const TALK_TYPE_IDS = PITCHABLE_TALK_TYPE_IDS;

export function validateSubmission(input: TalkSubmissionInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!PITCHABLE_TALK_TYPE_IDS.includes(input.type as TalkTypeId)) {
    errors.type = "Pick a talk type.";
  }

  const title = input.title.trim();
  if (!title) {
    errors.title = "Give your talk a title.";
  } else if (title.length > 70) {
    errors.title = "Keep the title under 70 characters.";
  }

  const description = input.description.trim();
  if (description.length < 10) {
    errors.description = "Tell us a little more (10+ chars).";
  } else if (description.length > 400) {
    errors.description = "Keep it under 400 characters.";
  }

  if (!input.name.trim()) {
    errors.name = "We need your name.";
  }

  if (!input.team.trim()) {
    errors.team = "Which team are you on?";
  }

  return errors;
}

export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
