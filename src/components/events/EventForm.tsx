"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";
import type { CreateEventResult, NewEventInput } from "@/app/events/new/actions";
import {
  eventEdition,
  isEventInputValid,
  trimEventInput,
  validateEventInput,
  type EventInput,
  type EventRecord,
  type EventValidationErrors,
} from "@/lib/events";

type EventFormProps = {
  /** Existing events, newest first. The first one seeds the form's defaults. */
  copySources: EventRecord[];
  createAction: (input: NewEventInput) => Promise<CreateEventResult>;
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

export function EventForm({ copySources, createAction }: EventFormProps) {
  const latest = copySources[0];
  const [form, setForm] = useState<NewEventInput>({
    slug: "",
    title: latest?.title ?? "FE DAY",
    tagline: latest?.tagline ?? "",
    eventDate: "",
    startTime: latest?.startTime ?? "10:00",
    endTime: latest?.endTime ?? "16:00",
    location: latest?.location ?? "",
    copyAgendaFromEventId: latest?.id ?? "",
  });
  const [errors, setErrors] = useState<EventValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof NewEventInput>(key: K, value: NewEventInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

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
    // On success the action redirects, so only failures come back here.
    const result = await createAction(form);
    setErrors(result.errors);
    setFormError(result.formError ?? null);
    setSubmitting(false);
  };

  return (
    <div>
      <Link
        href="/events"
        className="pixel"
        style={{ display: "inline-block", color: "var(--teal)", fontSize: 11, marginBottom: 16 }}
      >
        {"<"} ALL EVENTS
      </Link>
      <h1
        style={{
          fontSize: "clamp(24px,5vw,38px)",
          color: "var(--gold)",
          textShadow: "4px 4px 0 var(--shadow)",
          marginBottom: 26,
        }}
      >
        NEW EVENT
      </h1>

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
                      disabled={submitting}
                      aria-invalid={Boolean(errors[field.key])}
                      onChange={(e) => set(field.key, e.target.value)}
                    />
                    {field.hint && <div className="txt-sm">{field.hint}</div>}
                    {errors[field.key] && (
                      <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
                        {errors[field.key]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

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
          </div>
        </PixelFrame>

        <div className="row between" style={{ gap: 16, marginTop: 30, flexWrap: "wrap" }}>
          <Link href="/events" className="btn ghost">
            CANCEL
          </Link>
          {formError && (
            <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
              {formError}
            </div>
          )}
          <Btn variant="orange lg" type="submit" disabled={submitting}>
            {submitting ? "CREATING…" : "CREATE EVENT >"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
