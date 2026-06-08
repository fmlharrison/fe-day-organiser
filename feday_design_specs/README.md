# Handoff: FE Day 2026 — Talk Pitch App

## Overview
A small web app for Cleo's Front-End chapter that lets members **submit talk ideas** for **FE Day 2026** (an internal mini-conference). The app has three screens:
1. **Landing** — event details + a (mock) Google sign-in.
2. **Agenda** — the full FE Day running order, with calls-to-action to pitch a talk.
3. **Pitch a Talk** — a form to submit a talk idea, followed by a success popup.

The whole thing is themed as a **retro 8-bit / arcade game** (CRT scanlines, pixel fonts, notched pixel borders, "PRESS START", "★ IDEA GET! ★").

## About the Design Files
The files in this bundle are **design references created in HTML/React+Babel** — prototypes showing the intended look, copy, and behavior. **They are not production code to ship directly.** The task is to **recreate these designs in your target codebase** using its established framework, component library, routing, auth, and data layer. If no codebase exists yet, pick an appropriate stack (e.g. React + Vite + your CSS approach of choice) and implement the designs there.

The prototype uses inline Babel-transpiled JSX loaded from separate `.jsx` files and global `window` exports — that pattern is a **prototype convenience only**; do not replicate it. Use normal modules/imports in the real app.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, layout, copy, and interactions are all intended as shown. Recreate the UI faithfully, but swap prototype mechanics (mock auth, localStorage) for real implementations (see "Backend / Integration TODOs").

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#211e20` | App background (warm near-black) |
| `--bg-2` | `#2c2628` | Top bar, stat panels, inset surfaces |
| `--panel` | `#34302f` | Card/surface fill |
| `--ink` | `#f2e9e4` | Primary text (cream) |
| `--ink-dim` | `#b9aaa2` | Muted/secondary text |
| `--gold` | `#e9c46a` | Primary accent, "Lightning" type, headings |
| `--orange` | `#e76f51` | CTAs, "Long Talk" type, marquee |
| `--teal` | `#2a9d8f` | "Workshop" type, links, success/positive |
| `--shadow` | `#14110f` | Hard pixel drop-shadows / text-shadows |
| `#7c6f9e` | (literal) | "Session" agenda tag (fixed-kind items) |
| Google button face | `#f6f4ef` / text `#2a2a2a` | Mock Google sign-in |

`--accent` defaults to `--gold` and is the single overridable accent (tweakable to gold / orange / teal / `#41a6f6`).

### Typography
- **Pixel/display font:** `"Press Start 2P"` (Google Fonts). Used for all headings, labels, buttons, tags, time stamps. `text-transform: uppercase`, `letter-spacing: 0.5px`, `line-height: 1.5`.
- **Body font:** `"VT323"` (Google Fonts). Used for paragraphs, descriptions, input text. VT323 reads small per-em, so body sizes are scaled up.
- Body text classes: `.txt` = 22px / lh 1.35, `.txt-lg` = 26px, `.txt-sm` = 19px (uses `--ink-dim`).
- Heading sizes use `clamp()` for responsiveness — e.g. hero title `clamp(40px, 11vw, 96px)`, screen titles `clamp(24px–26px, 5vw, 38–42px)`, section headings 12–14px, micro-labels 8–11px.
- `image-rendering: pixelated` and disabled font smoothing (`-webkit-font-smoothing: none`) for crisp pixels.

### Spacing & layout
- Content max-widths: standard `920px`, wide `1100px`, form (stacked) `760px`, modal `520px`.
- Page padding: `32px 22px 80px`.
- Common gaps: 12 / 16 / 18 / 20 / 26 / 30px. Stat grids `repeat(3,1fr)` gap 12.

### Borders, corners, shadows (the "8-bit" look)
- **Notched pixel corners:** elements use a `clip-path: polygon(...)` that cuts small 4–8px steps out of each corner instead of a `border-radius`. Two clip-path recipes exist: an 8px double-step notch (panels/`.pf`) and a 6px single-step notch (buttons). See `retro.css` `.pf`, `.pf > .pf-in`, `.btn`.
- **Pixel frame (`.pf`):** a double-layer border — an outer colored layer (`--frame`) with 4px padding wrapping an inner surface layer (`--surface`), both clipped with the notch polygon. Optional `.shadow` adds `filter: drop-shadow(6px 6px 0 var(--shadow))` (a hard, offset pixel shadow — **no blur**).
- **Buttons** get a pressed/3D look via `box-shadow: inset -4px -4px 0 rgba(0,0,0,0.28), inset 4px 4px 0 rgba(255,255,255,0.22)` and translate `(3px,3px)` on `:active`.
- All "shadows" in this design are **hard offset blocks (0 blur)**, never soft.
- No rounded corners anywhere — everything is either square or notched.

### Motion
- `steps()` timing functions everywhere (e.g. `steps(1)`, `steps(4)`) for chunky, non-smooth animation.
- `@keyframes blink` (1.1s steps(1)) on "▶ PRESS START".
- `@keyframes marq` horizontal marquee (18s linear) on the coin-op landing header.
- `@keyframes popin` (scale 0.85→1.04→1, steps(4)) on the success modal card.
- `@keyframes floatup` star particles drifting up in the success modal.
- All decorative motion is gated behind `@media (prefers-reduced-motion: reduce)` → disabled.
- **Important pitfall avoided:** never gate an element's *visibility* on an animation's end state (a throttled/paused tab leaves it stuck). The modal is `opacity:1` by default; animation is flourish only.

## Screens / Views

### 1. Landing (`landing.jsx`)
Three interchangeable styles (exposed as a tweak in the prototype; in production pick **one** — recommended default is **Title screen**, the strongest first impression).

**Shared content (all styles):**
- Event title: **FE DAY** + **2026**
- Tagline: **"INSERT COIN — SHARE WHAT YOU KNOW"**
- Details: **WED · JULY 1 · 2026**, **10:00 — 17:00**, **LION'S SHARE + REMOTE**, format **TALKS · LIGHTNING · WORKSHOP**
- Eyebrow: **CLEO · FRONT-END CHAPTER PRESENTS**
- A "Sign in with Google" button (mock) + helper note.

**Style A — Title Screen (arcade attract mode):** centered. Pixel coin sprite, eyebrow, huge gold `FE DAY` with 6px hard text-shadow, orange `2026`, tagline, a `repeat(3,1fr)` stat strip (WHEN / TIME / WHERE), blinking "▶ PRESS START", then Google button + note. Wrapped in `.center-screen` (min-height 100vh, grid place-items center).

**Style B — Cartridge / Poster:** a gold `.pf` frame styled like a game cartridge. A solid gold label bar at top (`CLEO · FE CHAPTER` / `★ 2026 ★`), then `FE DAY`, tagline, a **key-art placeholder** (diagonal-stripe box labeled `[ EVENT KEY ART · 760×150 ]`), the 3-stat strip, a pixel divider, and a row of blurb + sign-in.

**Style C — Coin-op Split:** full-height. An orange **marquee** header scrolling event text. Below, a 2-column grid: left = giant `FE / DAY / 2026` + coin sprite (centered, right border); right = tagline + a label/value detail list (DATE/TIME/PLACE/FORMAT, each row `92px 1fr`, 4px bottom border) + sign-in. Collapses to 1 column on narrow screens (`.coinop-grid`).

### 2. Agenda (`agenda-form.jsx` → `Agenda`)
- **Top bar** (`.topbar`, sticky): brand "FE DAY '26" (left, clickable → home), and right cluster = `+ PITCH A TALK` orange button, user avatar (teal square w/ initials), `EXIT` ghost button (sign out).
- **Header:** eyebrow "WELCOME, PLAYER {FIRSTNAME}", title "THE AGENDA".
- **Meta strip:** 3 stat panels — DATE `JUL 1`, TIME `10:00–17:00`, WHERE `LION'S SHARE + REMOTE`.
- **Legend:** chips for Lightning (gold), Long Talk (orange), Workshop (teal), Break (dim) — each a colored 12px swatch + label.
- **CTA banner:** an orange `.pf` frame, heading "OPEN SLOTS NEED YOU", blurb, and a `SUBMIT A TALK IDEA ▶` button.
- **Timeline:** vertical list. Each row is a 3-col grid `130px 14px 1fr`: (1) start/end time in gold pixel font, (2) a "rail" with a colored dot + connecting line, (3) a card with a left border in the type color, a type tag, title, description, and — for open slot kinds — a `▶ OPEN SLOT — CLAIM IT` button that opens the form.
- **Footer:** note "Times are a rough map…" + another pitch button.

**Agenda data (15 items, 10:00–17:00):**
| Start | End | Kind | Title | Note |
|---|---|---|---|---|
| 10:00 | 10:30 | fixed | Doors Open + Ice Breaker | coffee + warm-up game |
| 10:30 | 10:40 | lightning | Lightning Slot #1 | open |
| 10:40 | 11:10 | talk | Talk Slot #1 | open |
| 11:10 | 11:20 | lightning | Lightning Slot #2 | open |
| 11:20 | 11:50 | break | Morning Break | — |
| 11:50 | 12:20 | talk | Talk Slot #2 | open |
| 12:20 | 12:30 | lightning | Lightning Slot #3 | open |
| 12:30 | 13:00 | talk | Talk Slot #3 | open |
| 13:00 | 14:00 | break | Lunch | — |
| 14:00 | 15:00 | workshop | Workshop | open |
| 15:00 | 15:10 | lightning | Lightning Slot #4 | open |
| 15:10 | 15:40 | talk | Talk Slot #4 | open |
| 15:40 | 16:10 | break | Afternoon Break | — |
| 16:10 | 16:45 | fixed | Open Demos + Show & Tell | — |
| 16:45 | 17:00 | fixed | Closing + FE Day Awards | — |

Kind → colors: lightning `--gold`, talk `--orange`, workshop `--teal`, break `--ink-dim`, fixed `#7c6f9e`. Only lightning/talk/workshop are "open" (show the claim CTA).

### 3. Pitch a Talk (`agenda-form.jsx` → `TalkForm`)
Two layouts (tweakable; default **Stacked**):
- **Stacked:** max-width 760px. Section 1 "CHOOSE A SLOT TYPE" = 3 type cards in an auto-fit grid; Section 2 "THE DETAILS" = a `.pf` panel with the fields; submit bar below.
- **Split:** wide (1100px). 2-col grid `0.9fr 1.1fr` — type cards stacked in one column (left), details panel (right). Collapses on narrow screens.

**Header:** `◀ BACK TO AGENDA` link, title "PITCH A TALK", subtitle "Three sizes of slot. Pick one, tell us about it, hit submit. That's the whole game."

**Talk type cards** (the 3 accepted talk types):
| id | Name | Duration | Color | Description |
|---|---|---|---|---|
| `lightning` | LIGHTNING | 3–5 MIN | gold | "A quick spark. One idea, one demo, one hot take — in and out before the timer runs down." |
| `talk` | LONG TALK | 15–25 MIN | orange | "Room to go deep. Tell a story, teach a thing, walk through how you shipped it." |
| `workshop` | WORKSHOP | 45–60 MIN | teal | "Hands on deck. The whole crew builds, breaks or tries something together — live." |

Each card: pixel icon (chunky SVG rects — lightning bolt / speech-screen / blocks), name (in type color), duration (in accent), description (dim). Selected state: accent border + inset accent ring + a `✓` badge top-right. Cards lift `translateY(-3px)` on hover.

> ⚠️ **Note the duration mismatch to resolve with the user:** the original brief said lightning **3–5 min**, longer talks **15–25 min**, workshop ~**1 hr** — but the agenda slots were built as lightning **10 min**, talks **30 min**, workshop **60 min**. The type cards use the brief's durations (3–5 / 15–25 / 45–60). Pick one source of truth before building.

**Form fields:**
- **Talk title** (text, required, maxLength 70) — placeholder "e.g. We Deleted 40% Of Our CSS And Lived"
- **What's it about?** (textarea, required, min 10 chars, maxLength 400, with live char counter) — placeholder "A few lines on what you'll cover and why the chapter will care."
- **Your name** (text, required, prefilled from signed-in user)
- **Your team** (text, required) — placeholder "e.g. Web Platform"
- Name + team sit in a 2-col grid.

**Submit bar:** `CANCEL` (ghost, → back to agenda) + `SUBMIT IDEA ▶` (orange, large).

### 4. Success popup (`agenda-form.jsx` → `SuccessModal`)
Modal overlay (`rgba(20,17,15,0.82)` scrim, z-index 5000), centered card with a **teal pixel frame**. Top: a row of drifting star particles. Heading "★ IDEA GET! ★" (teal) + "YOUR TALK IS IN THE QUEUE" (gold). A recap box (left border in the chosen type color) showing `TYPE · DURATION`, the submitted **title** in quotes, and `— {name}, {team}`. Closing copy: "We'll slot it into the running order and shout when it's confirmed. Pitch another any time." + `◀ BACK TO AGENDA` (teal). Clicking scrim or button closes → returns to agenda. Card animates with `popin`; **stays visible regardless of animation** (opacity not gated on animation end).

## Interactions & Behavior
- **Routing/state:** a single `screen` value (`landing | agenda | form`) plus `user` (null until sign-in). Replace with your router (e.g. `/`, `/agenda`, `/pitch`).
- **Sign in (mock):** clicking Google button sets a fake user `{ name: "Ada Pixel", email: "ada@meetcleo.com" }` and routes to agenda. **Replace with real Google OAuth** (restrict to the Cleo workspace domain).
- **Sign out:** `EXIT` clears user, returns to landing.
- **Pitch CTA:** any "pitch/submit a talk" button or open-slot "claim" button → form screen.
- **Form validation (on submit):** type required, title non-empty, description ≥10 chars, name non-empty, team non-empty. Errors render inline in orange under each field.
- **Submit success:** prepends submission to a list, **persists to `localStorage`** (`feday26_submissions`) in the prototype, shows the success modal, returns to agenda. **Replace persistence with an API call** (see TODOs).
- **Responsive:** layouts use grid/flex with `clamp()` headings; split layouts collapse to single column on narrow viewports (`.coinop-grid`, `.form-split` breakpoints to add).
- **Hover/active:** buttons brighten on hover, translate down-right on active; cards lift on hover.

## State Management
- `screen`: current view.
- `user`: `{ name, email } | null`.
- `submissions`: array of `{ type, title, desc, name, team, ts }` (prototype: localStorage).
- `success`: the just-submitted record (drives the modal) or `null`.
- Form-local: `{ type, title, desc, name, team }` + `errors` map.

## Backend / Integration TODOs (prototype → production)
1. **Real Google auth** scoped to the Cleo domain; derive name/email from the session and prefill the form.
2. **Persist submissions** to a real datastore via API instead of localStorage; handle loading/empty/error states.
3. (Optional, was descoped) a shared "all submissions" board or "my submissions" list.
4. Replace the **key-art placeholder** on the cartridge landing with a real asset.
5. Confirm **agenda content** is final, and resolve the **talk-duration mismatch** noted above.
6. Decide whether the agenda is hard-coded or CMS/config-driven.

## Assets
- **Fonts:** Google Fonts "Press Start 2P" + "VT323" (linked via `<link>`; self-host in production).
- **Icons/sprites:** all drawn inline as chunky SVG `<rect>` blocks (talk-type icons, coin sprite, Google "G"). No external image files. Recreate as SVG components.
- **No raster images** are used except the intended key-art placeholder.

## Files (in this bundle)
- `index.html` — entry; loads fonts, React+Babel, and the JSX files (prototype loader — do not replicate).
- `retro.css` — **the source of truth for all visual styling** (tokens, pixel frames, buttons, inputs, type cards, agenda rows, modal, animations).
- `components.jsx` — data (`FE_DAY`, `TALK_TYPES`, `AGENDA`, `KIND_META`) + shared components (`PixelFrame`, `Btn`, `GoogleButton`, `TypeIcon`, `Coin`).
- `landing.jsx` — the 3 landing styles.
- `agenda-form.jsx` — `TopBar`, `Agenda`, `TalkForm`, `TypeCards`, `FormFields`, `SuccessModal`.
- `app.jsx` — routing, auth, submission flow, and the tweak wiring (prototype only).
- `tweaks-panel.jsx` — prototype tweak UI; **not part of the product**, ignore for the build.
- `screenshots/` — rendered reference images of each screen:
  - `01-landing-title.png`, `06-landing-cartridge.png`, `07-landing-coinop.png` — the 3 landing styles
  - `02-agenda.png`, `03-agenda-timeline.png` — agenda header + timeline
  - `04-pitch-form.png` — pitch form (stacked) with a talk type selected
  - `05-success-modal.png` — the "★ IDEA GET! ★" success popup

A developer who wasn't in the original conversation should be able to build the product from this README + `retro.css`.
