"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Btn } from "@/components/ui/Btn";
import {
  ATTENDANCE_MODES,
  type AttendanceCounts,
  type AttendanceMode,
  type AttendanceRecord,
} from "@/lib/attendance";
import type { AttendanceResult } from "@/app/agenda/actions";

type AttendanceFormProps = {
  attendance: AttendanceRecord | null;
  counts: AttendanceCounts;
  setAttendanceAction: (mode: AttendanceMode) => Promise<AttendanceResult>;
};

function modeLabel(mode: AttendanceMode): string {
  return mode === "in_person" ? "IN PERSON" : "REMOTE";
}

export function AttendanceForm({ attendance, counts, setAttendanceAction }: AttendanceFormProps) {
  const [selected, setSelected] = useState<AttendanceMode | "">(attendance?.mode ?? "");
  const [savedMode, setSavedMode] = useState<AttendanceMode | null>(attendance?.mode ?? null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) {
      setFormError("Pick how you're joining — in person or remote.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    const result = await setAttendanceAction(selected);
    if (result.ok) {
      setSavedMode(result.mode);
    } else {
      setFormError(result.formError);
    }
    setSubmitting(false);
  };

  const hasChanged = selected !== "" && selected !== savedMode;

  return (
    <PixelFrame frame="var(--teal)" surface="var(--bg-2)" style={{ marginBottom: 34 }} pad={22}>
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <h3 style={{ fontSize: 14, color: "var(--teal)", marginBottom: 10 }}>
            {savedMode ? "YOU'RE ON THE GUEST LIST" : "PRESS START TO RSVP"}
          </h3>
          <div className="txt" style={{ fontSize: 20 }}>
            {savedMode
              ? `Locked in as ${modeLabel(savedMode)}. Changed your mind? Pick a new option below.`
              : "Let the chapter know you're coming — in the room or on the stream."}
          </div>
          {counts.total > 0 && (
            <div className="txt-sm" style={{ marginTop: 10, color: "var(--ink-dim)" }}>
              {counts.inPerson} in person · {counts.remote} remote · {counts.total} total
            </div>
          )}
        </div>

        <div className="type-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {ATTENDANCE_MODES.map((mode) => (
            <button
              type="button"
              key={mode.id}
              className={`type-card ${selected === mode.id ? "sel" : ""}`}
              style={{ "--accent": mode.color } as CSSProperties}
              onClick={() => {
                setSelected(mode.id);
                setFormError(null);
              }}
            >
              <span className="tc-check">✓</span>
              <span className="tc-name" style={{ color: mode.color, marginTop: 4 }}>
                {mode.name}
              </span>
              <span className="tc-desc">{mode.desc}</span>
            </button>
          ))}
        </div>

        <div className="row between" style={{ gap: 16, flexWrap: "wrap" }}>
          {formError && (
            <div className="txt-sm" style={{ color: "var(--orange)" }}>
              {formError}
            </div>
          )}
          <Btn
            variant="teal lg"
            type="button"
            disabled={submitting || !selected || (!hasChanged && savedMode !== null)}
            onClick={handleSubmit}
            style={{ marginLeft: "auto" }}
          >
            {savedMode ? (hasChanged ? "UPDATE RSVP ▶" : "RSVP SAVED ✓") : "COUNT ME IN ▶"}
          </Btn>
        </div>
      </div>
    </PixelFrame>
  );
}
