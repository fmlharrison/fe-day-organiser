import { Coin } from "@/components/ui/Coin";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { FE_DAY } from "@/lib/data/fe-day";

function DetailStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

type SignInBlockProps = {
  onSignIn: () => void;
  signingIn?: boolean;
  note?: string;
};

function SignInBlock({ onSignIn, signingIn, note }: SignInBlockProps) {
  return (
    <div className="stack" style={{ gap: 14, alignItems: "center" }}>
      <GoogleButton onClick={onSignIn} disabled={signingIn} />
      <div className="txt-sm" style={{ textAlign: "center", maxWidth: 320 }}>
        {note || "Use your Cleo account to enter."}
      </div>
    </div>
  );
}

type LandingTitleScreenProps = {
  onSignIn: () => void;
  signingIn?: boolean;
  authError?: string | null;
};

export function LandingTitleScreen({
  onSignIn,
  signingIn,
  authError,
}: LandingTitleScreenProps) {
  return (
    <div className="center-screen">
      <div style={{ width: "100%", maxWidth: 720, textAlign: "center" }}>
        {authError && (
          <div className="auth-error txt-sm" style={{ margin: "0 auto 24px" }}>
            {authError}
          </div>
        )}

        <div
          className="stack"
          style={{ gap: 10, alignItems: "center", marginBottom: 26 }}
        >
          <Coin />
          <div
            className="txt-sm pixel"
            style={{ fontSize: 10, color: "var(--teal)", letterSpacing: 2 }}
          >
            CLEO · FRONT-END CHAPTER PRESENTS
          </div>
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 11vw, 96px)",
            color: "var(--gold)",
            textShadow: "6px 6px 0 var(--shadow)",
            lineHeight: 1.15,
          }}
        >
          FE&nbsp;DAY
        </h1>
        <div
          className="pixel"
          style={{
            fontSize: "clamp(16px,4vw,30px)",
            color: "var(--orange)",
            marginTop: 4,
            textShadow: "4px 4px 0 var(--shadow)",
          }}
        >
          {FE_DAY.year}
        </div>

        <div
          className="txt-lg"
          style={{ color: "var(--ink-dim)", marginTop: 22, fontSize: 24 }}
        >
          {FE_DAY.tagline}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            margin: "34px 0 32px",
          }}
        >
          <DetailStat k="WHEN" v="JUL 1" />
          <DetailStat k="TIME" v="10–17" />
          <DetailStat k="WHERE" v="LION'S SHARE" />
        </div>

        <div
          className="pixel blink"
          style={{ fontSize: 14, color: "var(--ink)", marginBottom: 22 }}
        >
          ▶ PRESS START
        </div>
        <SignInBlock onSignIn={onSignIn} signingIn={signingIn} />
      </div>
    </div>
  );
}
