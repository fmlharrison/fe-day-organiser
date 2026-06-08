"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Btn } from "@/components/ui/Btn";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { AGENDA, KIND_META, TALK_TYPES } from "@/lib/data/fe-day";
import { createClient } from "@/lib/supabase/client";
import type { AppUser, TalkSubmission, TalkTypeId } from "@/types";
import { SuccessModal } from "@/components/pitch/SuccessModal";

type AgendaViewProps = {
  user: AppUser;
  successSubmission?: TalkSubmission | null;
};

export function AgendaView({ user, successSubmission }: AgendaViewProps) {
  const router = useRouter();
  const firstName = user.name.split(" ")[0]?.toUpperCase() ?? "PLAYER";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const pitchHref = (type?: TalkTypeId) =>
    type ? `/pitch?type=${type}` : "/pitch";

  return (
    <div>
      <TopBar
        user={user}
        onSignOut={handleSignOut}
        right={
          <Link href="/pitch">
            <Btn variant="orange sm">+ PITCH A TALK</Btn>
          </Link>
        }
      />
      <div className="wrap">
        <div
          className="row between"
          style={{ gap: 20, flexWrap: "wrap", marginBottom: 10 }}
        >
          <div>
            <div
              className="pixel"
              style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}
            >
              WELCOME, PLAYER {firstName}
            </div>
            <h1
              style={{
                fontSize: "clamp(26px,5vw,42px)",
                color: "var(--gold)",
                textShadow: "4px 4px 0 var(--shadow)",
              }}
            >
              THE AGENDA
            </h1>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            margin: "22px 0 14px",
          }}
        >
          <div className="stat">
            <div className="k">DATE</div>
            <div className="v">JUL 1</div>
          </div>
          <div className="stat">
            <div className="k">TIME</div>
            <div className="v">10:00–17:00</div>
          </div>
          <div className="stat">
            <div className="k">WHERE</div>
            <div className="v">LION&apos;S SHARE + REMOTE</div>
          </div>
        </div>

        <div
          className="row"
          style={{ gap: 10, flexWrap: "wrap", margin: "20px 0 30px" }}
        >
          {TALK_TYPES.map((t) => (
            <span className="chip" key={t.id}>
              <span className="sw" style={{ background: t.color }} />
              {t.name}
            </span>
          ))}
          <span className="chip">
            <span className="sw" style={{ background: "var(--ink-dim)" }} />
            BREAK
          </span>
        </div>

        <PixelFrame
          frame="var(--orange)"
          surface="var(--bg-2)"
          style={{ marginBottom: 34 }}
          pad={22}
        >
          <div
            className="row between"
            style={{ gap: 18, flexWrap: "wrap" }}
          >
            <div style={{ maxWidth: 460 }}>
              <h3
                style={{
                  fontSize: 14,
                  color: "var(--orange)",
                  marginBottom: 10,
                }}
              >
                OPEN SLOTS NEED YOU
              </h3>
              <div className="txt" style={{ fontSize: 20 }}>
                The talk, lightning &amp; workshop slots below are wide open.
                Grab one — pitch the thing you&apos;ve been dying to share.
              </div>
            </div>
            <Link href="/pitch">
              <Btn variant="orange">SUBMIT A TALK IDEA ▶</Btn>
            </Link>
          </div>
        </PixelFrame>

        <div>
          {AGENDA.map((row, i) => {
            const meta = KIND_META[row.kind];
            const isLast = i === AGENDA.length - 1;
            const openKind =
              meta.open && (row.kind === "lightning" ||
                row.kind === "talk" ||
                row.kind === "workshop")
                ? (row.kind as TalkTypeId)
                : undefined;

            return (
              <div className="ag-row" key={`${row.t}-${row.title}`}>
                <div className="ag-time">
                  {row.t}
                  <br />
                  <span style={{ color: "var(--ink-dim)" }}>{row.end}</span>
                </div>
                <div className="ag-rail">
                  <div
                    className="dot"
                    style={{ background: meta.color }}
                  />
                  {!isLast && <div className="line" />}
                </div>
                <div
                  className="ag-card"
                  style={{ "--type-color": meta.color } as React.CSSProperties}
                >
                  <span
                    className="ag-tag"
                    style={{ "--type-color": meta.color } as React.CSSProperties}
                  >
                    {meta.label}
                  </span>
                  <div className="ag-title">{row.title}</div>
                  <div className="ag-desc">{row.desc}</div>
                  {openKind && (
                    <Link
                      href={pitchHref(openKind)}
                      className="ag-open"
                      style={{ textDecoration: "none" }}
                    >
                      ▶ OPEN SLOT — CLAIM IT
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pdiv" style={{ margin: "40px 0 24px" }} />
        <div className="row between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="txt-sm">
            Times are a rough map — final running order set once talks are in.
          </div>
          <Link href="/pitch">
            <Btn variant="orange">+ PITCH A TALK</Btn>
          </Link>
        </div>
      </div>

      {successSubmission && (
        <SuccessModal
          data={successSubmission}
          onClose={() => router.replace("/agenda")}
        />
      )}
    </div>
  );
}
