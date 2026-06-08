export type TalkTypeId = "lightning" | "talk" | "workshop";

export type AgendaKind = TalkTypeId | "break" | "fixed";

export type TalkType = {
  id: TalkTypeId;
  name: string;
  dur: string;
  color: string;
  desc: string;
};

export type AgendaItem = {
  t: string;
  end: string;
  kind: AgendaKind;
  title: string;
  desc: string;
};

export type KindMeta = {
  label: string;
  color: string;
  open: boolean;
};

export type AppUser = {
  name: string;
  email: string;
};

export type TalkSubmission = {
  id?: string;
  type: TalkTypeId;
  title: string;
  description: string;
  submitter_name: string;
  team: string;
  created_at?: string;
};

export type TalkFormData = {
  type: TalkTypeId | "";
  title: string;
  desc: string;
  name: string;
  team: string;
};

export type FormErrors = Partial<Record<keyof TalkFormData | "type", string>>;
