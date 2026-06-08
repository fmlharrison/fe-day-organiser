"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { FormFields } from "@/components/pitch/FormFields";
import { TypeCards } from "@/components/pitch/TypeCards";
import { createClient } from "@/lib/supabase/client";
import type { AppUser, FormErrors, TalkFormData, TalkTypeId } from "@/types";

type TalkFormViewProps = {
  user: AppUser;
  initialType?: TalkTypeId;
};

export function TalkFormView({ user, initialType }: TalkFormViewProps) {
  const router = useRouter();
  const [form, setForm] = useState<TalkFormData>({
    type: initialType ?? "",
    title: "",
    desc: "",
    name: user.name,
    team: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof TalkFormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.type) e.type = "Pick a talk type.";
    if (!form.title.trim()) e.title = "Give your talk a title.";
    if (form.desc.trim().length < 10)
      e.desc = "Tell us a little more (10+ chars).";
    if (!form.name.trim()) e.name = "We need your name.";
    if (!form.team.trim()) e.team = "Which team are you on?";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: form.title.trim(),
          description: form.desc.trim(),
          submitter_name: form.name.trim(),
          team: form.team.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed. Try again.");
      }

      const submission = await res.json();
      const params = new URLSearchParams({
        submitted: "1",
        type: submission.type,
        title: submission.title,
        name: submission.submitter_name,
        team: submission.team,
      });
      router.push(`/agenda?${params.toString()}`);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Submission failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <TopBar user={user} onSignOut={handleSignOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 26 }}>
          <Link
            href="/agenda"
            className="pixel"
            style={{
              background: "none",
              border: "none",
              color: "var(--teal)",
              cursor: "pointer",
              fontSize: 11,
              marginBottom: 16,
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            ◀ BACK TO AGENDA
          </Link>
          <h1
            style={{
              fontSize: "clamp(24px,5vw,38px)",
              color: "var(--gold)",
              textShadow: "4px 4px 0 var(--shadow)",
            }}
          >
            PITCH A TALK
          </h1>
          <div
            className="txt"
            style={{ fontSize: 20, color: "var(--ink-dim)", marginTop: 12 }}
          >
            Three sizes of slot. Pick one, tell us about it, hit submit.
            That&apos;s the whole game.
          </div>
        </div>

        <div className="stack" style={{ gap: 30 }}>
          <div>
            <h3
              style={{ fontSize: 12, color: "var(--gold)", marginBottom: 16 }}
            >
              1 · CHOOSE A SLOT TYPE
            </h3>
            <TypeCards
              value={form.type}
              onChange={(v) => set("type", v)}
            />
            {errors.type && (
              <div
                className="txt-sm"
                style={{ color: "var(--orange)", marginTop: 10 }}
              >
                {errors.type}
              </div>
            )}
          </div>

          <PixelFrame surface="var(--bg-2)" pad={26}>
            <h3
              style={{ fontSize: 12, color: "var(--gold)", marginBottom: 18 }}
            >
              2 · THE DETAILS
            </h3>
            <div className="stack" style={{ gap: 20 }}>
              <FormFields form={form} set={set} errors={errors} />
            </div>
          </PixelFrame>
        </div>

        {submitError && (
          <div
            className="txt-sm"
            style={{ color: "var(--orange)", marginTop: 20 }}
          >
            {submitError}
          </div>
        )}

        <div
          className="row between"
          style={{ gap: 16, marginTop: 30, flexWrap: "wrap" }}
        >
          <Link href="/agenda">
            <Btn variant="ghost">CANCEL</Btn>
          </Link>
          <Btn
            variant="orange lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "SUBMITTING…" : "SUBMIT IDEA ▶"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
