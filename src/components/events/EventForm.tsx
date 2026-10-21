"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";
import {
  eventEdition,
  isEventInputValid,
  trimEventInput,
  validateEventInput,
  type EventFormResult,
  type EventFormValues,
  type EventInput,
  type EventRecord,
  type EventValidationErrors,
} from "@/lib/events";

type EventFormProps = {
  initialValues: EventFormValues;
  /** When given, offers copying one of these events' agendas. */
  copySources?: EventRecord[];
  /** An event's slug is part of its links, so it can't change once created. */
  slugLocked?: boolean;
  submitLabel: string;
  cancelHref: string;
  submitAction: (input: EventFormValues) => Promise<EventFormResult>;
};

type TextField = {
  key: keyof EventInput;
  label: string;
  type?: "text" | "date" | "time";
  placeholder?: string;
  maxLength?: number;
  hint?: string;
};

const FIELDS: TextField[][] = [
  [
    { key: "title", label: "TITLE *", placeholder: "FE DAY", maxLength: 40 },
    {
      key: "slug",
      label: "URL SLUG *",
      placeholder: "december-2026",
      maxLength: 40,
      hint: "Used in the event's links. It can't be changed later.",
    },
  ],
  [{ key: "tagline", label: "TAGLINE", placeholder: "INSERT COIN — SHARE WHAT YOU KNOW", maxLength: 120 }],
  [
    { key: "eventDate", label: "DATE *", type: "date" },
    { key: "startTime", label: "STARTS *", type: "time" },
    { key: "endTime", label: "ENDS *", type: "time" },
  ],
  [{ key: "location", label: "WHERE *", placeholder: "LION'S SHARE + REMOTE", maxLength: 60 }],
];

export function EventForm({
  initialValues,
  copySources,
  slugLocked = false,
  submitLabel,
  cancelHref,
  submitAction,
}: EventFormProps) {
  const [form, setForm] = useState<EventFormValues>(initialValues);
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateEventInput(trimEventInput(form));
    if (!isEventInputValid(validationErrors)) {
      setErrors(validationErrors);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);
    const result = await submitAction(form);
    if (result.ok) {
      setSaved(true);
    } else {
      setErrors(result.errors);
      setFormError(result.formError ?? null);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <PixelFrame surface="var(--bg-2)" pad={26}>
          <div className="stack" style={{ gap: 20 }}>
            {FIELDS.map((row) => (
              <div
                key={row.map((field) => field.key).join("-")}
                style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 18 }}
              >
                {row.map((field) => (
                  <div className="field" key={field.key}>
                    <label htmlFor={`event-${field.key}`}>{field.label}</label>
                    <input
                      id={`event-${field.key}`}
                      className="inp"
                      type={field.type ?? "text"}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      disabled={submitting || (field.key === "slug" && slugLocked)}
                      aria-invalid={Boolean(errors[field.key])}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                    {field.hint && !(field.key === "slug" && slugLocked) && (
                      <div className="txt-sm">{field.hint}</div>
                    )}
                    {errors[field.key] && (
                      <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
                        {errors[field.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {copySources && (
            <div className="field">
              <label htmlFor="event-copy-agenda">COPY AGENDA FROM</label>
              <select
                id="event-copy-agenda"
                className="inp"
                value={form.copyAgendaFromEventId}
                disabled={submitting}
                onChange={(e) => set("copyAgendaFromEventId", e.target.value)}
              >
                {copySources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.title} {eventEdition(source)}
                  </option>
                ))}
                <option value="">None — set the agenda later</option>
              </select>
              <div className="txt-sm">
                Copies every session, break and talk slot. Talks assigned to that event aren&apos;t copied.
              </div>
            </div>
            )}
          </div>
        </PixelFrame>

        <div className="row between" style={{ gap: 16, marginTop: 30, flexWrap: "wrap" }}>
          <Link href={cancelHref} className="btn ghost">
            CANCEL
          </Link>
          {saved && (
            <div role="status" className="txt-sm" style={{ color: "var(--teal)" }}>
              Saved.
            </div>
          )}
          {formError && (
            <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
              {formError}
            </div>
          )}
          <Btn variant="orange lg" type="submit" disabled={submitting}>
            {submitting ? "SAVING…" : `${submitLabel} >`}
          </Btn>
        </div>
      </form>
    </div>
  );
}
