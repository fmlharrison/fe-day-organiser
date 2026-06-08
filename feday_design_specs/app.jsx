/* global React, ReactDOM, Landing, Agenda, TalkForm, SuccessModal,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "landingStyle": "title",
  "formLayout": "stacked",
  "accent": "#e9c46a",
  "scanlines": true
}/*EDITMODE-END*/;

const STORE_KEY = "feday26_submissions";

function loadSubs() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useStateApp("landing"); // landing | agenda | form
  const [user, setUser] = useStateApp(null);
  const [subs, setSubs] = useStateApp(loadSubs);
  const [success, setSuccess] = useStateApp(null);

  // apply accent + scanline tweaks to the document
  useEffectApp(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  const signIn = () => {
    setUser({ name: "Ada Pixel", email: "ada@meetcleo.com" });
    setScreen("agenda");
  };
  const signOut = () => { setUser(null); setScreen("landing"); };

  const handleSubmit = (data) => {
    const next = [data, ...subs];
    setSubs(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) {}
    setSuccess(data);
    setScreen("agenda");
  };

  let view;
  if (screen === "landing" || !user) {
    view = <Landing style={t.landingStyle} onSignIn={signIn} />;
  } else if (screen === "form") {
    view = (
      <TalkForm
        user={user} layout={t.formLayout}
        onBack={() => setScreen("agenda")}
        onSubmit={handleSubmit}
        onHome={() => setScreen("agenda")}
        onSignOut={signOut}
      />
    );
  } else {
    view = (
      <Agenda
        user={user} submissionCount={subs.length}
        onSubmitTalk={() => setScreen("form")}
        onHome={() => setScreen("agenda")}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="app-root">
      {view}
      {success && <SuccessModal data={success} onClose={() => setSuccess(null)} />}

      <div className={`crt-overlay ${t.scanlines ? "" : "off"}`}></div>

      <TweaksPanel>
        <TweakSection label="Landing screen" />
        <TweakRadio
          label="Style" value={t.landingStyle}
          options={[
            { value: "title", label: "Title" },
            { value: "cartridge", label: "Cartridge" },
            { value: "coinop", label: "Coin-op" },
          ]}
          onChange={(v) => { setTweak("landingStyle", v); if (user) setScreen("landing"); else setScreen("landing"); }}
        />

        <TweakSection label="Talk form" />
        <TweakRadio
          label="Layout" value={t.formLayout}
          options={[
            { value: "stacked", label: "Stacked" },
            { value: "split", label: "Split" },
          ]}
          onChange={(v) => setTweak("formLayout", v)}
        />

        <TweakSection label="Look" />
        <TweakColor
          label="Accent" value={t.accent}
          options={["#e9c46a", "#e76f51", "#2a9d8f", "#41a6f6"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakToggle label="Scanlines (CRT)" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
