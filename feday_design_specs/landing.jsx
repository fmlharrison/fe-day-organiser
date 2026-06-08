/* global React, FE_DAY, PixelFrame, Btn, GoogleButton, Coin */
const { useState: useStateL } = React;

/* ===== shared bits ===== */
function DetailStat({ k, v }) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function SignInBlock({ onSignIn, note }) {
  return (
    <div className="stack" style={{ gap: 14, alignItems: "center" }}>
      <GoogleButton onClick={onSignIn} />
      <div className="txt-sm" style={{ textAlign: "center", maxWidth: 320 }}>
        {note || "Use your Cleo account to enter."}
      </div>
    </div>
  );
}

/* ============================================================
   STYLE 1 — TITLE SCREEN  (arcade attract mode)
   ============================================================ */
function LandingTitleScreen({ onSignIn }) {
  return (
    <div className="center-screen">
      <div style={{ width: "100%", maxWidth: 720, textAlign: "center" }}>
        <div className="stack" style={{ gap: 10, alignItems: "center", marginBottom: 26 }}>
          <Coin />
          <div className="txt-sm pixel" style={{ fontSize: 10, color: "var(--teal)", letterSpacing: 2 }}>
            CLEO · FRONT-END CHAPTER PRESENTS
          </div>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 11vw, 96px)", color: "var(--gold)", textShadow: "6px 6px 0 var(--shadow)", lineHeight: 1.15 }}>
          FE&nbsp;DAY
        </h1>
        <div className="pixel" style={{ fontSize: "clamp(16px,4vw,30px)", color: "var(--orange)", marginTop: 4, textShadow: "4px 4px 0 var(--shadow)" }}>
          2026
        </div>

        <div className="txt-lg" style={{ color: "var(--ink-dim)", marginTop: 22, fontSize: 24 }}>
          {FE_DAY.tagline}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "34px 0 32px" }}>
          <DetailStat k="WHEN" v="JUL 1" />
          <DetailStat k="TIME" v="10–17" />
          <DetailStat k="WHERE" v="LION'S SHARE" />
        </div>

        <div className="pixel blink" style={{ fontSize: 14, color: "var(--ink)", marginBottom: 22 }}>
          ▶ PRESS START
        </div>
        <SignInBlock onSignIn={onSignIn} />
      </div>
    </div>
  );
}

/* ============================================================
   STYLE 2 — CARTRIDGE / POSTER  (info-rich card)
   ============================================================ */
function LandingCartridge({ onSignIn }) {
  return (
    <div className="center-screen">
      <PixelFrame frame="var(--gold)" surface="var(--bg-2)" shadow style={{ width: "100%", maxWidth: 760 }} pad={0}>
        <div>
          {/* cartridge top label bar */}
          <div style={{ background: "var(--gold)", color: "var(--bg)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="pixel" style={{ fontSize: 11 }}>CLEO · FE CHAPTER</span>
            <span className="pixel" style={{ fontSize: 11 }}>★ 2026 ★</span>
          </div>

          <div style={{ padding: "30px 30px 34px" }}>
            <h1 style={{ fontSize: "clamp(34px,8vw,64px)", color: "var(--gold)", textShadow: "5px 5px 0 var(--shadow)" }}>FE DAY</h1>
            <div className="txt-lg" style={{ color: "var(--orange)", fontSize: 26, marginTop: 8 }}>{FE_DAY.tagline}</div>

            {/* poster image placeholder */}
            <div style={{ margin: "24px 0", height: 150, background: "repeating-linear-gradient(45deg, var(--panel) 0 12px, var(--bg) 12px 24px)", display: "grid", placeItems: "center", border: "4px solid var(--panel)" }}>
              <span className="pixel" style={{ fontSize: 10, color: "var(--ink-dim)" }}>[ EVENT KEY ART · 760×150 ]</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              <DetailStat k="WHEN" v="JUL 1" />
              <DetailStat k="TIME" v="10–17" />
              <DetailStat k="WHERE" v="LION'S SHARE + REMOTE" />
            </div>

            <div className="pdiv" style={{ margin: "26px 0" }}></div>

            <div className="row between" style={{ gap: 20, flexWrap: "wrap" }}>
              <div className="txt-sm" style={{ maxWidth: 280 }}>
                A full day of talks, lightning rounds and a hands-on workshop — built by the chapter, for the chapter.
              </div>
              <SignInBlock onSignIn={onSignIn} note="Sign in to view the agenda & pitch a talk." />
            </div>
          </div>
        </div>
      </PixelFrame>
    </div>
  );
}

/* ============================================================
   STYLE 3 — COIN-OP SPLIT  (marquee + detail list)
   ============================================================ */
function LandingCoinOp({ onSignIn }) {
  const rows = [
    ["DATE", FE_DAY.date],
    ["TIME", FE_DAY.time],
    ["PLACE", FE_DAY.loc],
    ["FORMAT", "TALKS · LIGHTNING · WORKSHOP"],
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* marquee header */}
      <div className="marquee" style={{ background: "var(--orange)", color: "var(--bg)", padding: "10px 0", flex: "none" }}>
        <span className="pixel" style={{ fontSize: 12 }}>
          ★ FE DAY 2026 ★ INSERT IDEA TO CONTINUE ★ TALKS · LIGHTNING · WORKSHOP ★ JULY 1 ★ LION'S SHARE + REMOTE ★&nbsp;&nbsp;&nbsp;
          ★ FE DAY 2026 ★ INSERT IDEA TO CONTINUE ★ TALKS · LIGHTNING · WORKSHOP ★ JULY 1 ★ LION'S SHARE + REMOTE ★&nbsp;&nbsp;&nbsp;
        </span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 0, alignItems: "stretch", minHeight: 0 }} className="coinop-grid">
        {/* left — title */}
        <div style={{ display: "grid", placeItems: "center", padding: "48px 36px", borderRight: "4px solid var(--bg-2)" }}>
          <div style={{ textAlign: "center" }}>
            <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", letterSpacing: 2, marginBottom: 18 }}>CLEO · FRONT-END CHAPTER</div>
            <h1 style={{ fontSize: "clamp(44px,9vw,90px)", color: "var(--gold)", textShadow: "6px 6px 0 var(--shadow)" }}>FE<br/>DAY</h1>
            <div className="pixel" style={{ fontSize: 24, color: "var(--orange)", marginTop: 14, textShadow: "4px 4px 0 var(--shadow)" }}>2026</div>
            <div style={{ marginTop: 26 }}><Coin /></div>
          </div>
        </div>

        {/* right — details + sign in */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 36px", gap: 8 }}>
          <h2 style={{ fontSize: 16, color: "var(--ink)", marginBottom: 16 }}>{FE_DAY.tagline}</h2>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 14, padding: "12px 0", borderBottom: "4px solid var(--bg-2)" }}>
              <span className="pixel" style={{ fontSize: 10, color: "var(--gold)" }}>{k}</span>
              <span className="txt" style={{ fontSize: 20 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 28 }}>
            <SignInBlock onSignIn={onSignIn} note="Sign in to see the full agenda and submit your talk." />
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing({ style, onSignIn }) {
  if (style === "cartridge") return <LandingCartridge onSignIn={onSignIn} />;
  if (style === "coinop") return <LandingCoinOp onSignIn={onSignIn} />;
  return <LandingTitleScreen onSignIn={onSignIn} />;
}

Object.assign(window, { Landing });
