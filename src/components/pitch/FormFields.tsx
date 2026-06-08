"use client";

import type { FormErrors, TalkFormData } from "@/types";

type FormFieldsProps = {
  form: TalkFormData;
  set: (key: keyof TalkFormData, value: string) => void;
  errors: FormErrors;
};

export function FormFields({ form, set, errors }: FormFieldsProps) {
  return (
    <>
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
        <label>WHAT&apos;S IT ABOUT? *</label>
        <textarea
          className="ta"
          maxLength={400}
          placeholder="A few lines on what you'll cover and why the chapter will care."
          value={form.desc}
          onChange={(e) => set("desc", e.target.value)}
        />
        <div className="char-count">{form.desc.length}/400</div>
        {errors.desc && (
          <div className="txt-sm" style={{ color: "var(--orange)" }}>
            {errors.desc}
          </div>
        )}
      </div>

      <div className="form-name-team">
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
    </>
  );
}
