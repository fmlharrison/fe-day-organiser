/* global React */
const { useState, useEffect, useRef } = React;

/* ============ DATA ============ */

const FE_DAY = {
  title: "FE DAY",
  year: "2026",
  date: "WED · JULY 1 · 2026",
  time: "10:00 — 17:00",
  loc: "LION'S SHARE + REMOTE",
  tagline: "INSERT COIN — SHARE WHAT YOU KNOW",
};

const TALK_TYPES = [
  {
    id: "lightning",
    name: "LIGHTNING",
    dur: "3–5 MIN",
    color: "var(--gold)",
    desc: "A quick spark. One idea, one demo, one hot take — in and out before the timer runs down.",
  },
  {
    id: "talk",
    name: "LONG TALK",
    dur: "15–25 MIN",
    color: "var(--orange)",
    desc: "Room to go deep. Tell a story, teach a thing, walk through how you shipped it.",
  },
  {
    id: "workshop",
    name: "WORKSHOP",
    dur: "45–60 MIN",
    color: "var(--teal)",
    desc: "Hands on deck. The whole crew builds, breaks or tries something together — live.",
  },
];

const TYPE_BY_ID = Object.fromEntries(TALK_TYPES.map((t) => [t.id, t]));

// kind: talk | lightning | workshop | break | fixed
const AGENDA = [
  { t: "10:00", end: "10:30", kind: "fixed", title: "Doors Open + Ice Breaker", desc: "Grab a coffee (or a tea, we don't judge) and a quick warm-up game to get the chapter talking." },
  { t: "10:30", end: "10:40", kind: "lightning", title: "Lightning Slot #1", desc: "A 10-minute spark to kick things off." },
  { t: "10:40", end: "11:10", kind: "talk", title: "Talk Slot #1", desc: "30 minutes to go deep on something you love." },
  { t: "11:10", end: "11:20", kind: "lightning", title: "Lightning Slot #2", desc: "Another quick hit before the break." },
  { t: "11:20", end: "11:50", kind: "break", title: "Morning Break", desc: "Stretch those legs. Refill the mug. Back in 30." },
  { t: "11:50", end: "12:20", kind: "talk", title: "Talk Slot #2", desc: "30 minutes — your stage." },
  { t: "12:20", end: "12:30", kind: "lightning", title: "Lightning Slot #3", desc: "One more spark before lunch." },
  { t: "12:30", end: "13:00", kind: "talk", title: "Talk Slot #3", desc: "30 minutes to teach us something new." },
  { t: "13:00", end: "14:00", kind: "break", title: "Lunch", desc: "Fuel up. An hour to eat, chat and recharge." },
  { t: "14:00", end: "15:00", kind: "workshop", title: "Workshop", desc: "60 minutes, hands on deck — the whole chapter builds something together." },
  { t: "15:00", end: "15:10", kind: "lightning", title: "Lightning Slot #4", desc: "Post-lunch energy spark." },
  { t: "15:10", end: "15:40", kind: "talk", title: "Talk Slot #4", desc: "Our final long-form slot of the day." },
  { t: "15:40", end: "16:10", kind: "break", title: "Afternoon Break", desc: "Last refuel before the home stretch." },
  { t: "16:10", end: "16:45", kind: "fixed", title: "Open Demos + Show & Tell", desc: "Anyone can jump up and show a side project, a hack or a thing they made." },
  { t: "16:45", end: "17:00", kind: "fixed", title: "Closing + FE Day Awards", desc: "Wrap-up, thank-yous and entirely-serious awards. Then: socials." },
];

const KIND_META = {
  lightning: { label: "LIGHTNING", color: "var(--gold)", open: true },
  talk:      { label: "LONG TALK", color: "var(--orange)", open: true },
  workshop:  { label: "WORKSHOP",  color: "var(--teal)", open: true },
  break:     { label: "BREAK",     color: "var(--ink-dim)", open: false },
  fixed:     { label: "SESSION",   color: "#7c6f9e", open: false },
};

/* ============ PIXEL FRAME ============ */
function PixelFrame({ children, frame, surface, shadow, className = "", style = {}, ...rest }) {
  const fStyle = {};
  if (frame) fStyle["--frame"] = frame;
  if (surface) fStyle["--surface"] = surface;
  return (
    <div className={`pf ${shadow ? "shadow" : ""} ${className}`} style={{ ...fStyle, ...style }} {...rest}>
      <div className="pf-in" style={{ padding: rest.pad || 24 }}>
        {children}
      </div>
    </div>
  );
}

/* ============ BUTTON ============ */
function Btn({ children, variant = "", className = "", ...rest }) {
  return (
    <button className={`btn ${variant} ${className}`} {...rest}>{children}</button>
  );
}

/* ============ GOOGLE (mock) SIGN-IN ============ */
function GoogleButton({ onClick }) {
  return (
    <button className="gbtn" onClick={onClick}>
      <svg className="gicon" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.5 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.2C12.3 13.2 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.4z"/>
        <path fill="#FBBC05" d="M10.4 28.5c-.5-1.4-.8-3-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.2z"/>
        <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.3 0-11.7-3.7-13.6-9.1l-7.9 6.2C6.4 42.6 14.6 48 24 48z"/>
      </svg>
      Sign in with Google
    </button>
  );
}

/* ============ TALK TYPE ICON (pixel art via blocks) ============ */
function TypeIcon({ id }) {
  // simple chunky pixel glyphs drawn with rects on a grid
  const c = TYPE_BY_ID[id]?.color || "var(--ink)";
  if (id === "lightning") {
    return (
      <svg className="tc-icon" viewBox="0 0 64 48" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
        <g fill={c}>
          <rect x="34" y="4"  width="8" height="8"/>
          <rect x="28" y="12" width="8" height="8"/>
          <rect x="22" y="20" width="8" height="8"/>
          <rect x="28" y="20" width="16" height="8"/>
          <rect x="22" y="28" width="8" height="8"/>
          <rect x="16" y="36" width="8" height="8"/>
        </g>
      </svg>
    );
  }
  if (id === "talk") {
    return (
      <svg className="tc-icon" viewBox="0 0 64 48" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
        <g fill={c}>
          <rect x="10" y="6"  width="44" height="6"/>
          <rect x="10" y="12" width="6"  height="20"/>
          <rect x="48" y="12" width="6"  height="20"/>
          <rect x="10" y="32" width="44" height="6"/>
          <rect x="22" y="38" width="20" height="4"/>
          {/* speech text lines */}
          <rect x="18" y="18" width="22" height="4" fill="var(--bg)"/>
          <rect x="18" y="24" width="28" height="4" fill="var(--bg)"/>
        </g>
      </svg>
    );
  }
  // workshop — wrench/blocks
  return (
    <svg className="tc-icon" viewBox="0 0 64 48" preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges">
      <g fill={c}>
        <rect x="14" y="8"  width="12" height="12"/>
        <rect x="30" y="8"  width="12" height="12"/>
        <rect x="22" y="22" width="12" height="12"/>
        <rect x="6"  y="22" width="12" height="12"/>
        <rect x="38" y="22" width="12" height="12"/>
        <rect x="14" y="36" width="12" height="8"/>
        <rect x="30" y="36" width="12" height="8"/>
      </g>
    </svg>
  );
}

/* tiny inline pixel sprite for landing decoration */
function Coin() {
  return (
    <svg viewBox="0 0 16 16" width="28" height="28" shapeRendering="crispEdges" aria-hidden="true">
      <g fill="var(--gold)">
        <rect x="4" y="1" width="8" height="2"/><rect x="2" y="3" width="2" height="2"/><rect x="12" y="3" width="2" height="2"/>
        <rect x="1" y="5" width="2" height="6"/><rect x="13" y="5" width="2" height="6"/>
        <rect x="2" y="11" width="2" height="2"/><rect x="12" y="11" width="2" height="2"/><rect x="4" y="13" width="8" height="2"/>
      </g>
      <rect x="6" y="4" width="2" height="8" fill="var(--bg)"/><rect x="8" y="4" width="2" height="8" fill="var(--bg)"/>
    </svg>
  );
}

Object.assign(window, {
  FE_DAY, TALK_TYPES, TYPE_BY_ID, AGENDA, KIND_META,
  PixelFrame, Btn, GoogleButton, TypeIcon, Coin,
});
