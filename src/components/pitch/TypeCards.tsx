"use client";

import type { CSSProperties } from "react";
import { TALK_TYPES, type TalkTypeId } from "@/lib/feday-data";
import { TypeIcon } from "@/components/ui/TypeIcon";

type TypeCardsProps = {
  value: string;
  onChange: (id: TalkTypeId) => void;
};

export function TypeCards({ value, onChange }: TypeCardsProps) {
  return (
    <div className="type-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {TALK_TYPES.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`type-card ${value === t.id ? "sel" : ""}`}
          style={{ "--accent": t.color } as CSSProperties}
          onClick={() => onChange(t.id)}
        >
          <span className="tc-check">✓</span>
          <TypeIcon id={t.id} />
          <span className="tc-name" style={{ color: t.color }}>
            {t.name}
          </span>
          <span className="tc-dur">{t.dur}</span>
          <span className="tc-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}
