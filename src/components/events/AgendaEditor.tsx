"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { KIND_META, type AgendaKind } from "@/lib/feday-data";
import {
  isAgendaItemInputValid,
  trimAgendaItemInput,
  validateAgendaItemInput,
  type AgendaItem,
  type AgendaItemInput,
  type AgendaItemResult,
  type AgendaItemValidationErrors,
} from "@/lib/events";

type AgendaEditorProps = {
  items: AgendaItem[];
  /** Agenda item id → title of the talk assigned to it. */
  assignedTalkTitles: Record<string, string>;
  addAction: (input: AgendaItemInput) => Promise<AgendaItemResult>;
  updateAction: (itemId: string, input: AgendaItemInput) => Promise<AgendaItemResult>;
  deleteAction: (itemId: string) => Promise<AgendaItemResult>;
};

const KINDS = Object.keys(KIND_META) as AgendaKind[];

function toInput(item: AgendaItem): AgendaItemInput {
  return {
    startTime: item.startTime,
    endTime: item.endTime,
    kind: item.kind,
    title: item.title,
    description: item.description,
  };
}

function useAgendaItemForm(initial: AgendaItemInput) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<AgendaItemValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (action: (input: AgendaItemInput) => Promise<AgendaItemResult>) => {
    const validationErrors = validateAgendaItemInput(trimAgendaItemInput(values));
    if (!isAgendaItemInputValid(validationErrors)) {
      setErrors(validationErrors);
      setFormError(null);
      return false;
    }
    setErrors({});
    setFormError(null);
    setSubmitting(true);
    const result = await action(values);
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      setFormError(result.formError ?? null);
    }
    return result.ok;
  };

  return { values, setValues, errors, formError, setFormError, submitting, setSubmitting, submit };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="txt-sm" style={{ color: "var(--orange)" }}>
      {message}
    </div>
  );
}

function AgendaItemFields({
  idPrefix,
  values,
  errors,
  disabled,
  kindLocked,
  onChange,
}: {
  idPrefix: string;
  values: AgendaItemInput;
  errors: AgendaItemValidationErrors;
  disabled: boolean;
  kindLocked: boolean;
  onChange: (values: AgendaItemInput) => void;
}) {
  const set = (key: keyof AgendaItemInput, value: string) => onChange({ ...values, [key]: value });

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 14 }}>
        <div className="field">
          <label htmlFor={`${idPrefix}-start`}>STARTS *</label>
          <input
            id={`${idPrefix}-start`}
            className="inp"
            type="time"
            value={values.startTime}
            disabled={disabled}
            onChange={(e) => set("startTime", e.target.value)}
          />
          <FieldError message={errors.startTime} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-end`}>ENDS *</label>
          <input
            id={`${idPrefix}-end`}
            className="inp"
            type="time"
            value={values.endTime}
            disabled={disabled}
            onChange={(e) => set("endTime", e.target.value)}
          />
          <FieldError message={errors.endTime} />
        </div>
        <div className="field">
          <label htmlFor={`${idPrefix}-kind`}>TYPE *</label>
          <select
            id={`${idPrefix}-kind`}
            className="inp"
            value={values.kind}
            disabled={disabled || kindLocked}
            onChange={(e) => set("kind", e.target.value)}
          >
            {KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_META[kind].label}
              </option>
            ))}
          </select>
          <FieldError message={errors.kind} />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-title`}>TITLE *</label>
        <input
          id={`${idPrefix}-title`}
          className="inp"
          maxLength={70}
          value={values.title}
          disabled={disabled}
          onChange={(e) => set("title", e.target.value)}
        />
        <FieldError message={errors.title} />
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-description`}>DESCRIPTION</label>
        <textarea
          id={`${idPrefix}-description`}
          className="ta"
          maxLength={400}
          value={values.description}
          disabled={disabled}
          onChange={(e) => set("description", e.target.value)}
        />
        <FieldError message={errors.description} />
      </div>
    </div>
  );
}

function AgendaItemRow({
  item,
  talkTitle,
  updateAction,
  deleteAction,
}: {
  item: AgendaItem;
  talkTitle?: string;
  updateAction: AgendaEditorProps["updateAction"];
  deleteAction: AgendaEditorProps["deleteAction"];
}) {
  const [editing, setEditing] = useState(false);
  const form = useAgendaItemForm(toInput(item));
  const meta = KIND_META[item.kind];

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit((input) => updateAction(item.id, input))) setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.title}" from the agenda?`)) return;
    form.setSubmitting(true);
    const result = await deleteAction(item.id);
    form.setSubmitting(false);
    if (!result.ok) form.setFormError(result.formError ?? "Couldn't delete the agenda item.");
  };

  if (editing) {
    return (
      <form className="ag-card" onSubmit={handleSave} noValidate style={{ "--type-color": meta.color } as CSSProperties}>
        <AgendaItemFields
          idPrefix={`item-${item.id}`}
          values={form.values}
          errors={form.errors}
          disabled={form.submitting}
          kindLocked={Boolean(talkTitle)}
          onChange={form.setValues}
        />
        {talkTitle && (
          <div className="txt-sm" style={{ marginTop: 10 }}>
            The type is locked while a talk is assigned to this slot.
          </div>
        )}
        <FieldError message={form.formError ?? undefined} />
        <div className="row" style={{ gap: 10, marginTop: 14 }}>
          <Btn variant="teal sm" type="submit" disabled={form.submitting}>
            {form.submitting ? "SAVING…" : "SAVE"}
          </Btn>
          <button
            type="button"
            className="btn ghost sm"
            disabled={form.submitting}
            onClick={() => {
              form.setValues(toInput(item));
              setEditing(false);
            }}
          >
            CANCEL
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="ag-card" style={{ "--type-color": meta.color } as CSSProperties}>
      <span className="ag-tag" style={{ "--type-color": meta.color } as CSSProperties}>
        {meta.label}
      </span>
      <div className="txt-sm">
        {item.startTime}–{item.endTime}
      </div>
      <div className="ag-title">{item.title}</div>
      {item.description && <div className="ag-desc">{item.description}</div>}
      {talkTitle && (
        <div className="txt-sm" style={{ marginTop: 10, color: "var(--teal)" }}>
          TALK ASSIGNED · {talkTitle}
        </div>
      )}
      <FieldError message={form.formError ?? undefined} />
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        <button
          type="button"
          className="btn ghost sm"
          disabled={form.submitting}
          onClick={() => {
            form.setValues(toInput(item));
            form.setFormError(null);
            setEditing(true);
          }}
        >
          EDIT
        </button>
        <button
          type="button"
          className="btn ghost sm"
          disabled={form.submitting || Boolean(talkTitle)}
          title={talkTitle ? "Unassign the talk before deleting this slot." : undefined}
          onClick={handleDelete}
        >
          DELETE
        </button>
      </div>
    </div>
  );
}

function AddAgendaItem({
  defaultStartTime,
  addAction,
}: {
  defaultStartTime: string;
  addAction: AgendaEditorProps["addAction"];
}) {
  const blank: AgendaItemInput = {
    startTime: defaultStartTime,
    endTime: "",
    kind: "talk",
    title: "",
    description: "",
  };
  const form = useAgendaItemForm(blank);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit(addAction)) form.setValues({ ...blank, startTime: form.values.endTime });
  };

  return (
    <PixelFrame frame="var(--teal)" surface="var(--bg-2)" pad={22}>
      <form onSubmit={handleAdd} noValidate>
        <h3 style={{ fontSize: 12, color: "var(--teal)", marginBottom: 16 }}>ADD AN AGENDA ITEM</h3>
        <AgendaItemFields
          idPrefix="new-item"
          values={form.values}
          errors={form.errors}
          disabled={form.submitting}
          kindLocked={false}
          onChange={form.setValues}
        />
        <FieldError message={form.formError ?? undefined} />
        <div style={{ marginTop: 14 }}>
          <Btn variant="teal sm" type="submit" disabled={form.submitting}>
            {form.submitting ? "ADDING…" : "+ ADD TO AGENDA"}
          </Btn>
        </div>
      </form>
    </PixelFrame>
  );
}

export function AgendaEditor({
  items,
  assignedTalkTitles,
  addAction,
  updateAction,
  deleteAction,
}: AgendaEditorProps) {
  return (
    <div>
      {items.length === 0 ? (
        <div className="txt" style={{ marginBottom: 26 }}>
          No agenda items yet. Add the first one below.
        </div>
      ) : (
        <div style={{ marginBottom: 26 }}>
          {items.map((item) => (
            <AgendaItemRow
              key={item.id}
              item={item}
              talkTitle={assignedTalkTitles[item.id]}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          ))}
        </div>
      )}
      <AddAgendaItem defaultStartTime={items.at(-1)?.endTime ?? "10:00"} addAction={addAction} />
    </div>
  );
}
