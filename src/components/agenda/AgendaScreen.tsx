import type { CSSProperties } from "react";
import Link from "next/link";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Chip } from "@/components/ui/Chip";
import { Stat } from "@/components/ui/Stat";
import { AGENDA, FE_DAY, formatFeDayTimeDisplay, KIND_META, OPEN_AGENDA_SLOTS, PITCHABLE_TALK_TYPES } from "@/lib/feday-data";
import type { AssignedTalk } from "@/lib/agenda";
import { getRemainingOpenSlotCount, resolveAgendaRow } from "@/lib/agenda";
import type { SessionUser } from "@/lib/auth/user";
import type {
  AttendanceCounts,
  AttendanceMode,
  AttendanceRecord,
} from "@/lib/attendance";
import type { AttendanceResult } from "@/app/attendees/actions";
import { TopBar } from "@/components/agenda/TopBar";
import { AttendanceForm } from "@/components/agenda/AttendanceForm";

type AgendaScreenProps = {
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
  assignmentsBySlot?: Record<string, AssignedTalk>;
  attendance?: AttendanceRecord | null;
  attendanceCounts?: AttendanceCounts;
  setAttendanceAction?: (mode: AttendanceMode) => Promise<AttendanceResult>;
};

export function AgendaScreen({
  user,
  isOrganiser,
  signOutAction,
  assignmentsBySlot = {},
  attendance = null,
  attendanceCounts = { inPerson: 0, remote: 0, total: 0 },
  setAttendanceAction,
}: AgendaScreenProps) {
  const firstName = user.name.split(/\s+/)[0]?.toUpperCase();
  const remainingOpen = getRemainingOpenSlotCount(assignmentsBySlot);

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
          <Stat k="TIME" v={formatFeDayTimeDisplay()} />
          <Stat k="WHERE" v={FE_DAY.loc} />
        </div>

        {setAttendanceAction && (
          <>
            <AttendanceForm
              attendance={attendance}
              counts={attendanceCounts}
              setAttendanceAction={setAttendanceAction}
            />
            <div style={{ marginTop: -22, marginBottom: 34 }}>
              <Link href="/attendees" className="txt-sm" style={{ color: "var(--teal)" }}>
                SEE WHO&apos;S COMING {'>'}
              </Link>
            </div>
          </>
        )}

        <div className="row" style={{ gap: 10, flexWrap: "wrap", margin: "20px 0 30px" }}>
          {PITCHABLE_TALK_TYPES.map((t) => (
            <Chip key={t.id} swatch={t.color}>
              {t.name}
            </Chip>
          ))}
          <Chip swatch="var(--ink-dim)">BREAK</Chip>
        </div>

        <PixelFrame frame="var(--orange)" surface="var(--bg-2)" style={{ marginBottom: 34 }} pad={22}>
          <div className="row between" style={{ gap: 18, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 460 }}>
              <h3 style={{ fontSize: 14, color: "var(--orange)", marginBottom: 10 }}>
                {remainingOpen > 0 ? "OPEN SLOTS NEED YOU" : "AGENDA LOCKED IN"}
              </h3>
              <div className="txt" style={{ fontSize: 20 }}>
                {remainingOpen > 0
                  ? `${remainingOpen} of ${OPEN_AGENDA_SLOTS.length} talk slots still open. Grab one — pitch the thing you’ve been dying to share.`
                  : "Every talk and lightning slot is filled. See you on the day!"}
              </div>
            </div>
            {remainingOpen > 0 && (
              <Link href="/pitch" className="btn orange">
                SUBMIT A TALK IDEA {'>'}
              </Link>
            )}
          </div>
        </PixelFrame>

        <div>
          {AGENDA.map((row, i) => {
            const meta = KIND_META[row.kind];
            const isLast = i === AGENDA.length - 1;
            const assignment = row.id ? assignmentsBySlot[row.id] : undefined;
            const resolved = resolveAgendaRow(row, assignment, meta.open);
            return (
              <div className="ag-row" key={row.id ?? i}>
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
                  <div className="ag-title">{resolved.title}</div>
                  <div className="ag-desc">{resolved.desc}</div>
                  {resolved.speaker && (
                    <div className="txt-sm" style={{ marginTop: 10 }}>
                      — {resolved.speaker}
                    </div>
                  )}
                  {resolved.showClaimLink && (
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
