/* global React, FE_DAY, AGENDA, KIND_META, TALK_TYPES, TYPE_BY_ID, PixelFrame, Btn, TypeIcon */
const { useState: useStateA, useRef: useRefA } = React;

/* ============ TOP BAR ============ */
function TopBar({ user, onHome, onSignOut, right }) {
  const initials = (user?.name || "FE").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="topbar">
      <button onClick={onHome} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span className="brand">FE DAY ’26</span>
      </button>
      <div className="row" style={{ gap: 14 }}>
        {right}
        <div className="row" style={{ gap: 10 }}>
          <div className="avatar" title={user?.email}>{initials}</div>
          <Btn variant="ghost sm" onClick={onSignOut}>EXIT</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============ AGENDA SCREEN ============ */
function Agenda({ user, onSubmitTalk, onHome, onSignOut, submissionCount }) {
  return (
    <div>
      <TopBar
        user={user} onHome={onHome} onSignOut={onSignOut}
        right={<Btn variant="orange sm" onClick={onSubmitTalk}>+ PITCH A TALK</Btn>}
      />
      <div className="wrap">
        {/* header */}
        <div className="row between" style={{ gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div className="pixel" style={{ fontSize: 10, color: "var(--teal)", marginBottom: 12 }}>WELCOME, PLAYER {user?.name?.split(" ")[0]?.toUpperCase()}</div>
            <h1 style={{ fontSize: "clamp(26px,5vw,42px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)" }}>THE AGENDA</h1>
          </div>
        </div>

        {/* event meta strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "22px 0 14px" }}>
          <div className="stat"><div className="k">DATE</div><div className="v">JUL 1</div></div>
          <div className="stat"><div className="k">TIME</div><div className="v">10:00–17:00</div></div>
          <div className="stat"><div className="k">WHERE</div><div className="v">LION'S SHARE + REMOTE</div></div>
        </div>

        {/* legend */}
        <div className="row" style={{ gap: 10, flexWrap: "wrap", margin: "20px 0 30px" }}>
          {TALK_TYPES.map((t) => (
            <span className="chip" key={t.id}><span className="sw" style={{ background: t.color }}></span>{t.name}</span>
          ))}
          <span className="chip"><span className="sw" style={{ background: "var(--ink-dim)" }}></span>BREAK</span>
        </div>

        {/* call to action banner */}
        <PixelFrame frame="var(--orange)" surface="var(--bg-2)" style={{ marginBottom: 34 }} pad={22}>
          <div className="row between" style={{ gap: 18, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 460 }}>
              <h3 style={{ fontSize: 14, color: "var(--orange)", marginBottom: 10 }}>OPEN SLOTS NEED YOU</h3>
              <div className="txt" style={{ fontSize: 20 }}>
                The talk, lightning &amp; workshop slots below are wide open. Grab one — pitch the thing you’ve been dying to share.
              </div>
            </div>
            <Btn variant="orange" onClick={onSubmitTalk}>SUBMIT A TALK IDEA ▶</Btn>
          </div>
        </PixelFrame>

        {/* timeline */}
        <div>
          {AGENDA.map((row, i) => {
            const meta = KIND_META[row.kind];
            const isLast = i === AGENDA.length - 1;
            return (
              <div className="ag-row" key={i}>
                <div className="ag-time">{row.t}<br/><span style={{ color: "var(--ink-dim)" }}>{row.end}</span></div>
                <div className="ag-rail">
                  <div className="dot" style={{ background: meta.color }}></div>
                  {!isLast && <div className="line"></div>}
                </div>
                <div className="ag-card" style={{ "--type-color": meta.color }}>
                  <span className="ag-tag" style={{ "--type-color": meta.color }}>{meta.label}</span>
                  <div className="ag-title">{row.title}</div>
                  <div className="ag-desc">{row.desc}</div>
                  {meta.open && (
                    <button className="ag-open" onClick={onSubmitTalk} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      ▶ OPEN SLOT — CLAIM IT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pdiv" style={{ margin: "40px 0 24px" }}></div>
        <div className="row between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="txt-sm">Times are a rough map — final running order set once talks are in.</div>
          <Btn variant="orange" onClick={onSubmitTalk}>+ PITCH A TALK</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============ TALK TYPE CARDS ============ */
function TypeCards({ value, onChange, columns }) {
  return (
    <div className="type-grid" style={{ gridTemplateColumns: columns || "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {TALK_TYPES.map((t) => (
        <button
          type="button" key={t.id}
          className={`type-card ${value === t.id ? "sel" : ""}`}
          style={{ "--accent": t.color }}
          onClick={() => onChange(t.id)}
        >
          <span className="tc-check">✓</span>
          <TypeIcon id={t.id} />
          <span className="tc-name" style={{ color: t.color }}>{t.name}</span>
          <span className="tc-dur">{t.dur}</span>
          <span className="tc-desc">{t.desc}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ FORM FIELDS ============ */
function FormFields({ form, set, errors }) {
  return (
    <React.Fragment>
      <div className="field">
        <label>TALK TITLE *</label>
        <input className="inp" maxLength={70} placeholder="e.g. We Deleted 40% Of Our CSS And Lived"
          value={form.title} onChange={(e) => set("title", e.target.value)} />
        {errors.title && <div className="txt-sm" style={{ color: "var(--orange)" }}>{errors.title}</div>}
      </div>

      <div className="field">
        <label>WHAT’S IT ABOUT? *</label>
        <textarea className="ta" maxLength={400} placeholder="A few lines on what you’ll cover and why the chapter will care."
          value={form.desc} onChange={(e) => set("desc", e.target.value)} />
        <div className="char-count">{form.desc.length}/400</div>
        {errors.desc && <div className="txt-sm" style={{ color: "var(--orange)" }}>{errors.desc}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="field">
          <label>YOUR NAME *</label>
          <input className="inp" placeholder="Player 1" value={form.name} onChange={(e) => set("name", e.target.value)} />
          {errors.name && <div className="txt-sm" style={{ color: "var(--orange)" }}>{errors.name}</div>}
        </div>
        <div className="field">
          <label>YOUR TEAM *</label>
          <input className="inp" placeholder="e.g. Web Platform" value={form.team} onChange={(e) => set("team", e.target.value)} />
          {errors.team && <div className="txt-sm" style={{ color: "var(--orange)" }}>{errors.team}</div>}
        </div>
      </div>
    </React.Fragment>
  );
}

/* ============ TALK FORM SCREEN ============ */
function TalkForm({ user, layout, onBack, onSubmit, onHome, onSignOut }) {
  const [form, setForm] = useStateA({
    type: "", title: "", desc: "", name: user?.name || "", team: "",
  });
  const [errors, setErrors] = useStateA({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.type) e.type = "Pick a talk type.";
    if (!form.title.trim()) e.title = "Give your talk a title.";
    if (form.desc.trim().length < 10) e.desc = "Tell us a little more (10+ chars).";
    if (!form.name.trim()) e.name = "We need your name.";
    if (!form.team.trim()) e.team = "Which team are you on?";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit({ ...form, ts: Date.now() });
  };

  const header = (
    <div style={{ marginBottom: 26 }}>
      <button onClick={onBack} className="pixel" style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: 11, marginBottom: 16 }}>◀ BACK TO AGENDA</button>
      <h1 style={{ fontSize: "clamp(24px,5vw,38px)", color: "var(--gold)", textShadow: "4px 4px 0 var(--shadow)" }}>PITCH A TALK</h1>
      <div className="txt" style={{ fontSize: 20, color: "var(--ink-dim)", marginTop: 12 }}>
        Three sizes of slot. Pick one, tell us about it, hit submit. That’s the whole game.
      </div>
    </div>
  );

  const submitBar = (
    <div className="row between" style={{ gap: 16, marginTop: 30, flexWrap: "wrap" }}>
      <Btn variant="ghost" onClick={onBack}>CANCEL</Btn>
      <Btn variant="orange lg" onClick={handleSubmit}>SUBMIT IDEA ▶</Btn>
    </div>
  );

  /* --- SPLIT (two-column) layout --- */
  if (layout === "split") {
    return (
      <div>
        <TopBar user={user} onHome={onHome} onSignOut={onSignOut} />
        <div className="wrap wrap-wide">
          {header}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.9fr) 1.1fr", gap: 26, alignItems: "start" }} className="form-split">
            <div>
              <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 16 }}>1 · CHOOSE A SLOT TYPE</h3>
              <TypeCards value={form.type} onChange={(v) => set("type", v)} columns="1fr" />
              {errors.type && <div className="txt-sm" style={{ color: "var(--orange)", marginTop: 10 }}>{errors.type}</div>}
            </div>
            <PixelFrame surface="var(--bg-2)" pad={26}>
              <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 18 }}>2 · THE DETAILS</h3>
              <div className="stack" style={{ gap: 20 }}>
                <FormFields form={form} set={set} errors={errors} />
              </div>
              {submitBar}
            </PixelFrame>
          </div>
        </div>
      </div>
    );
  }

  /* --- STACKED (single-column) layout --- */
  return (
    <div>
      <TopBar user={user} onHome={onHome} onSignOut={onSignOut} />
      <div className="wrap" style={{ maxWidth: 760 }}>
        {header}
        <div className="stack" style={{ gap: 30 }}>
          <div>
            <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 16 }}>1 · CHOOSE A SLOT TYPE</h3>
            <TypeCards value={form.type} onChange={(v) => set("type", v)} />
            {errors.type && <div className="txt-sm" style={{ color: "var(--orange)", marginTop: 10 }}>{errors.type}</div>}
          </div>
          <PixelFrame surface="var(--bg-2)" pad={26}>
            <h3 style={{ fontSize: 12, color: "var(--gold)", marginBottom: 18 }}>2 · THE DETAILS</h3>
            <div className="stack" style={{ gap: 20 }}>
              <FormFields form={form} set={set} errors={errors} />
            </div>
          </PixelFrame>
        </div>
        {submitBar}
      </div>
    </div>
  );
}

/* ============ SUCCESS MODAL ============ */
function SuccessModal({ data, onClose }) {
  const t = TYPE_BY_ID[data?.type];
  const stars = ["★", "✦", "✸", "✦", "★"];
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <PixelFrame frame="var(--teal)" surface="var(--bg-2)" shadow pad={0}>
          <div style={{ textAlign: "center", padding: "34px 30px 36px", position: "relative" }}>
            {/* particle stars */}
            <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "space-around", pointerEvents: "none" }}>
              {stars.map((s, i) => (
                <span key={i} className="pixel" style={{ fontSize: 14, color: "var(--gold)", animation: `floatup 1.2s ${i * 0.12}s steps(6) infinite` }}>{s}</span>
              ))}
            </div>

            <div className="pixel" style={{ fontSize: 20, color: "var(--teal)", marginTop: 14, marginBottom: 18 }}>★ IDEA GET! ★</div>
            <h2 style={{ fontSize: 18, color: "var(--gold)", lineHeight: 1.5 }}>YOUR TALK<br/>IS IN THE QUEUE</h2>

            <div style={{ background: "var(--bg)", padding: "16px 18px", margin: "24px 0", textAlign: "left", borderLeft: `6px solid ${t?.color || "var(--gold)"}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="pixel" style={{ fontSize: 8, color: t?.color }}>{t?.name} · {t?.dur}</div>
              <div className="txt-lg" style={{ color: "var(--ink)", lineHeight: 1.15 }}>“{data?.title}”</div>
              <div className="txt-sm">— {data?.name}, {data?.team}</div>
            </div>

            <div className="txt" style={{ fontSize: 19, color: "var(--ink-dim)", marginBottom: 24 }}>
              We’ll slot it into the running order and shout when it’s confirmed. Pitch another any time.
            </div>
            <Btn variant="teal" onClick={onClose}>◀ BACK TO AGENDA</Btn>
          </div>
        </PixelFrame>
      </div>
    </div>
  );
}

Object.assign(window, { Agenda, TalkForm, SuccessModal, TopBar });
