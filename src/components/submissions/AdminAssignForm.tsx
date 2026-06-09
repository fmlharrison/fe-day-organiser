"use client";

import { useActionState } from "react";
import { Btn } from "@/components/ui/Btn";
import type { AssignResult } from "@/app/admin/actions";

type SlotOption = {
  id: string;
  label: string;
};

type AdminAssignFormProps = {
  action: (formData: FormData) => Promise<AssignResult>;
  submissionId: string;
  submitLabel: string;
  variant: "orange sm" | "ghost sm";
  slots?: SlotOption[];
};

const initialState: AssignResult = { ok: true };

export function AdminAssignForm({
  action,
  submissionId,
  submitLabel,
  variant,
  slots,
}: AdminAssignFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: AssignResult, formData: FormData) => action(formData),
    initialState,
  );

  return (
    <form action={formAction} style={{ marginTop: 16 }}>
      <input type="hidden" name="submissionId" value={submissionId} />
      {slots && slots.length > 0 && (
        <div className="row" style={{ gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <select
            name="slotId"
            required
            defaultValue=""
            className="inp"
            style={{ flex: "1 1 220px", minWidth: 220 }}
          >
            <option value="" disabled>
              Pick an agenda slot…
            </option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {!state.ok && (
        <div className="txt-sm" style={{ color: "var(--orange)", marginBottom: 10 }}>
          {state.formError}
        </div>
      )}
      <Btn variant={variant} type="submit" disabled={pending || (slots !== undefined && slots.length === 0)}>
        {pending ? "SAVING…" : submitLabel}
      </Btn>
      {slots !== undefined && slots.length === 0 && (
        <div className="txt-sm" style={{ marginTop: 8, color: "var(--ink-dim)" }}>
          No open slots left for this talk type.
        </div>
      )}
    </form>
  );
}
