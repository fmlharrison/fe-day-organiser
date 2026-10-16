import type { CSSProperties } from "react";
import Link from "next/link";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { Chip } from "@/components/ui/Chip";
import { Stat } from "@/components/ui/Stat";
import { KIND_META, PITCHABLE_TALK_TYPES } from "@/lib/feday-data";
import type { AssignedTalk } from "@/lib/agenda";
import { getOpenSlots, getRemainingOpenSlotCount, resolveAgendaRow } from "@/lib/agenda";
import {
  formatEventDateShort,
  formatEventTimeRange,
  type AgendaItem,
  type EventRecord,
} from "@/lib/events";
import { eventPath } from "@/lib/routes";
import type { SessionUser } from "@/lib/auth/user";
import type {
  AttendanceCounts,
  AttendanceMode,
  AttendanceRecord,
} from "@/lib/attendance";
import type { AttendanceResult } from "@/app/events/[slug]/attendees/actions";
import { TopBar } from "@/components/agenda/TopBar";
import { AttendanceForm } from "@/components/agenda/AttendanceForm";

type AgendaScreenProps = {
  event: EventRecord;
  items: AgendaItem[];
  user: SessionUser;
  isOrganiser?: boolean;
  signOutAction: () => void | Promise<void>;
  assignmentsBySlot?: Record<string, AssignedTalk>;
  attendance?: AttendanceRecord | null;
  attendanceCounts?: AttendanceCounts;
  setAttendanceAction?: (mode: AttendanceMode) => Promise<AttendanceResult>;
};

export function AgendaScreen({
  event,
  items,
  user,
  isOrganiser,
  signOutAction,
  assignmentsBySlot = {},
  attendance = null,
  attendanceCounts = { inPerson: 0, remote: 0, total: 0 },
  setAttendanceAction,
}: AgendaScreenProps) {
  const firstName = user.name.split(/\s+/)[0]?.toUpperCase();
  const openSlotCount = getOpenSlots(items).length;
  const remainingOpen = getRemainingOpenSlotCount(items, assignmentsBySlot);

  return (
    <div>
      <TopBar event={event} user={user} isOrganiser={isOrganiser} signOutAction={signOutAction} />
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
          <Stat k="DATE" v={formatEventDateShort(event)} />
          <Stat k="TIME" v={formatEventTimeRange(event)} />
          <Stat k="WHERE" v={event.location} />
        </div>

        {setAttendanceAction && (
          <>
            <AttendanceForm
              attendance={attendance}
              counts={attendanceCounts}
              setAttendanceAction={setAttendanceAction}
            />
            <div style={{ marginTop: -22, marginBottom: 34 }}>
              <Link href={eventPath(event.slug, "attendees")} className="txt-sm" style={{ color: "var(--teal)" }}>
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
                  ? `${remainingOpen} of ${openSlotCount} talk slots still open. Grab one — pitch the thing you’ve been dying to share.`
                  : "Every talk and lightning slot is filled. See you on the day!"}
              </div>
            </div>
            {remainingOpen > 0 && (
              <Link href={eventPath(event.slug, "pitch")} className="btn orange">
                SUBMIT A TALK IDEA {'>'}
              </Link>
            )}
          </div>
        </PixelFrame>

        <div>
          {items.map((row, i) => {
            const meta = KIND_META[row.kind];
            const isLast = i === items.length - 1;
            const assignment = assignmentsBySlot[row.id];
            const resolved = resolveAgendaRow(row, assignment, meta.open);
            return (
              <div className="ag-row" key={row.id}>
                <div className="ag-time">
                  <span>{row.startTime}</span>
                  <span style={{ color: "var(--ink-dim)" }}>{row.endTime}</span>
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
                    <Link href={`${eventPath(event.slug, "pitch")}?type=${row.kind}`} className="ag-open">
                      OPEN SLOT — CLAIM IT
                    </Link>
                  )}
                  {assignment && resolved.isFilled && (
                    <Link
                      href={eventPath(event.slug, `agenda/${assignment.submissionId}/feedback`)}
                      className="ag-open"
                    >
                      RATE THIS TALK {'>'}
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
          {remainingOpen > 0 && (
            <Link href={eventPath(event.slug, "pitch")} className="btn orange">
              + PITCH A TALK
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
