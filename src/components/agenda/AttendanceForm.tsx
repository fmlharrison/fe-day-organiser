"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Btn } from "@/components/ui/Btn";
import {
  ATTENDANCE_MODES,
  attendanceModeColor,
  formatAttendanceMode,
  type AttendanceCounts,
  type AttendanceMode,
  type AttendanceRecord,
} from "@/lib/attendance";
import type { AttendanceResult } from "@/app/attendees/actions";

type AttendanceFormProps = {
  attendance: AttendanceRecord | null;
  counts: AttendanceCounts;
  setAttendanceAction: (mode: AttendanceMode) => Promise<AttendanceResult>;
};

export function AttendanceForm({ attendance, counts, setAttendanceAction }: AttendanceFormProps) {
  const [selected, setSelected] = useState<AttendanceMode | "">(attendance?.mode ?? "");
  const [savedMode, setSavedMode] = useState<AttendanceMode | null>(attendance?.mode ?? null);
  const [editing, setEditing] = useState(false);
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
      setEditing(false);
    } else {
      setFormError(result.formError);
    }
    setSubmitting(false);
  };

  if (savedMode && !editing) {
    const color = attendanceModeColor(savedMode);
    return (
      <div
        className="row between"
        style={{
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 34,
          padding: "14px 18px",
          border: "3px solid var(--teal)",
          background: "var(--bg-2)",
          boxShadow: "4px 4px 0 var(--shadow)",
        }}
      >
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <span className="sw" style={{ background: color, width: 12, height: 12, flexShrink: 0 }} />
          <span className="txt-sm">
            You&apos;re attending — <strong style={{ color }}>{formatAttendanceMode(savedMode)}</strong>
          </span>
        </div>
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => {
            setSelected(savedMode);
            setEditing(true);
            setFormError(null);
          }}
        >
          CHANGE
        </button>
      </div>
    );
  }

  const hasChanged = selected !== "" && selected !== savedMode;

  return (
    <PixelFrame frame="var(--teal)" surface="var(--bg-2)" style={{ marginBottom: 34 }} pad={22}>
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <h3 style={{ fontSize: 14, color: "var(--teal)", marginBottom: 10 }}>
            {savedMode ? "UPDATE YOUR RSVP" : "PRESS START TO RSVP"}
          </h3>
          <div className="txt" style={{ fontSize: 20 }}>
            {savedMode
              ? "Pick how you're joining FE Day."
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
          {savedMode && (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                setEditing(false);
                setSelected(savedMode);
                setFormError(null);
              }}
            >
              CANCEL
            </button>
          )}
          <Btn
            variant="teal lg"
            type="button"
            disabled={submitting || !selected || (savedMode !== null && !hasChanged)}
            onClick={handleSubmit}
            style={{ marginLeft: "auto" }}
          >
            {savedMode ? "UPDATE RSVP >" : "COUNT ME IN >"}
          </Btn>
        </div>
      </div>
    </PixelFrame>
  );
}
