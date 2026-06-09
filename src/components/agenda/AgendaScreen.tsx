import type { CSSProperties } from "react";
import Link from "next/link";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Chip } from "@/components/ui/Chip";
import { Stat } from "@/components/ui/Stat";
import { AGENDA, KIND_META, TALK_TYPES } from "@/lib/feday-data";
import type { SessionUser } from "@/lib/auth/user";
import { TopBar } from "@/components/agenda/TopBar";

type AgendaScreenProps = {
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
};

export function AgendaScreen({ user, isOrganiser, signOutAction }: AgendaScreenProps) {
  const firstName = user.name.split(/\s+/)[0]?.toUpperCase();

  return (
    <div>
      <TopBar user={user} isOrganiser={isOrganiser} signOutAction={signOutAction} />
      <div className="wrap">
        <div className="row between" style={{ gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>
              WELCOME, PLAYER {firstName}
            </div>
            <h1 style={{ fontSize: "clamp(26px,5vw,42px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)" }}>
              THE AGENDA
            </h1>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "22px 0 14px" }}>
          <Stat k="DATE" v="JUL 1" />
          <Stat k="TIME" v="10:00–17:00" />
          <Stat k="WHERE" v="LION'S SHARE + REMOTE" />
        </div>

        <div className="row" style={{ gap: 10, flexWrap: "wrap", margin: "20px 0 30px" }}>
          {TALK_TYPES.map((t) => (
            <Chip key={t.id} swatch={t.color}>
              {t.name}
            </Chip>
          ))}
          <Chip swatch="var(--ink-dim)">BREAK</Chip>
        </div>

        <PixelFrame frame="var(--orange)" surface="var(--bg-2)" style={{ marginBottom: 34 }} pad={22}>
          <div className="row between" style={{ gap: 18, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 460 }}>
              <h3 style={{ fontSize: 14, color: "var(--orange)", marginBottom: 10 }}>OPEN SLOTS NEED YOU</h3>
              <div className="txt" style={{ fontSize: 20 }}>
                The talk, lightning &amp; workshop slots below are wide open. Grab one — pitch the thing you’ve been dying to share.
              </div>
            </div>
            <Link href="/pitch" className="btn orange">
              SUBMIT A TALK IDEA {'>'}
            </Link>
          </div>
        </PixelFrame>

        <div>
          {AGENDA.map((row, i) => {
            const meta = KIND_META[row.kind];
            const isLast = i === AGENDA.length - 1;
            return (
              <div className="ag-row" key={i}>
                <div className="ag-time">
                  <span>{row.t}</span>
                  <span style={{ color: "var(--ink-dim)" }}>{row.end}</span>
                </div>
                <div className="ag-rail">
                  <div className="dot" style={{ background: meta.color }} />
                  {!isLast && <div className="line" />}
                </div>
                <div className="ag-card" style={{ "--type-color": meta.color } as CSSProperties}>
                  <span className="ag-tag" style={{ "--type-color": meta.color } as CSSProperties}>
                    {meta.label}
                  </span>
                  <div className="ag-title">{row.title}</div>
                  <div className="ag-desc">{row.desc}</div>
                  {meta.open && (
                    <Link href={`/pitch?type=${row.kind}`} className="ag-open">
                      OPEN SLOT — CLAIM IT
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pdiv" style={{ margin: "40px 0 24px" }} />
        <div className="row between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="txt-sm">Times are a rough map — final running order set once talks are in.</div>
          <Link href="/pitch" className="btn orange">
            + PITCH A TALK
          </Link>
        </div>
      </div>
    </div>
  );
}
