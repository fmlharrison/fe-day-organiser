"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Btn } from "@/components/ui/Btn";
import type { TalkTypeId } from "@/lib/feday-data";
import {
  isValid,
  validateSubmission,
  TALK_TYPE_IDS,
  type SubmitResult,
  type SubmittedTalk,
  type TalkSubmissionInput,
  type ValidationErrors,
} from "@/lib/validation";
import { TypeCards } from "@/components/pitch/TypeCards";
import { SuccessModal } from "@/components/pitch/SuccessModal";

type PitchFormProps = {
  userName: string;
  presetType?: string;
  submitAction: (input: TalkSubmissionInput) => Promise<SubmitResult>;
};

export function PitchForm({ userName, presetType, submitAction }: PitchFormProps) {
  const [form, setForm] = useState<TalkSubmissionInput>({
    type:
      presetType && (TALK_TYPE_IDS as string[]).includes(presetType)
        ? presetType
        : "",
    title: "",
    description: "",
    name: userName,
    team: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SubmittedTalk | null>(null);

  const set = <K extends keyof TalkSubmissionInput>(key: K, value: TalkSubmissionInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateSubmission(form);
    if (!isValid(errs)) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setFormError(null);
    setSubmitting(true);
    const result = await submitAction(form);
    if (result.ok) {
      setSuccess(result.submission);
    } else {
      setErrors(result.errors);
      setFormError(result.formError ?? null);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <Link
          href="/agenda"
          className="pixel"
          style={{ display: "inline-block", color: "var(--teal)", fontSize: 11, marginBottom: 16 }}
        >
          ◀ BACK TO AGENDA
        </Link>
        <h1 style={{ fontSize: "clamp(24px,5vw,38px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)" }}>
          PITCH A TALK
        </h1>
        <div className="txt" style={{ fontSize: 20, color: "var(--ink-dim)", marginTop: 12 }}>
          Three sizes of slot. Pick one, tell us about it, hit submit. That’s the whole game.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="stack" style={{ gap: 30 }}>
          <div>
            <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 16 }}>1 · CHOOSE A SLOT TYPE</h3>
            <TypeCards value={form.type} onChange={(id: TalkTypeId) => set("type", id)} />
            {errors.type && (
              <div className="txt-sm" style={{ color: "var(--orange)", marginTop: 10 }}>
                {errors.type}
              </div>
            )}
          </div>

          <PixelFrame surface="var(--bg-2)" pad={26}>
            <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 18 }}>2 · THE DETAILS</h3>
            <div className="stack" style={{ gap: 20 }}>
              <div className="field">
                <label>TALK TITLE *</label>
                <input
                  className="inp"
                  maxLength={70}
                  placeholder="e.g. We Deleted 40% Of Our CSS And Lived"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
                {errors.title && (
                  <div className="txt-sm" style={{ color: "var(--orange)" }}>
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="field">
                <label>WHAT’S IT ABOUT? *</label>
                <textarea
                  className="ta"
                  maxLength={400}
                  placeholder="A few lines on what you’ll cover and why the chapter will care."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
                <div className="char-count">{form.description.length}/400</div>
                {errors.description && (
                  <div className="txt-sm" style={{ color: "var(--orange)" }}>
                    {errors.description}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div className="field">
                  <label>YOUR NAME *</label>
                  <input
                    className="inp"
                    placeholder="Player 1"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name && (
                    <div className="txt-sm" style={{ color: "var(--orange)" }}>
                      {errors.name}
                    </div>
                  )}
                </div>
                <div className="field">
                  <label>YOUR TEAM *</label>
                  <input
                    className="inp"
                    placeholder="e.g. Web Platform"
                    value={form.team}
                    onChange={(e) => set("team", e.target.value)}
                  />
                  {errors.team && (
                    <div className="txt-sm" style={{ color: "var(--orange)" }}>
                      {errors.team}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PixelFrame>
        </div>

        <div className="row between" style={{ gap: 16, marginTop: 30, flexWrap: "wrap" }}>
          <Link href="/agenda" className="btn ghost">
            CANCEL
          </Link>
          {formError && (
            <div className="txt-sm" style={{ color: "var(--orange)" }}>
              {formError}
            </div>
          )}
          <Btn variant="orange lg" type="submit" disabled={submitting}>
            SUBMIT IDEA ▶
          </Btn>
        </div>
      </form>

      {success && <SuccessModal submission={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}
