import { Coin } from "@/components/ui/Coin";
import { Stat } from "@/components/ui/Stat";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { FE_DAY } from "@/lib/feday-data";

type LandingScreenProps = {
  error?: string | null;
  signInAction: () => void | Promise<void>;
};

function errorMessage(error: string | null | undefined): string | null {
  if (error === "domain") {
    return "That account isn't a Cleo address. Sign in with your @meetcleo.com Google account.";
  }
  if (error === "auth") {
    return "Something went wrong signing in. Please try again.";
  }
  return null;
}

export function LandingScreen({ error, signInAction }: LandingScreenProps) {
  const message = errorMessage(error);

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
          {FE_DAY.title}
        </h1>
        <div className="pixel" style={{ fontSize: "clamp(16px,4vw,30px)", color: "var(--orange)", marginTop: 4, textShadow: "4px 4px 0 var(--shadow)" }}>
          {FE_DAY.year}
        </div>

        <div className="txt-lg" style={{ color: "var(--ink-dim)", marginTop: 22, fontSize: 24 }}>
          {FE_DAY.tagline}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "34px 0 32px" }}>
          <Stat k="WHEN" v="JUL 1" />
          <Stat k="TIME" v="10–17" />
          <Stat k="WHERE" v="LION'S SHARE" />
        </div>

        <div className="pixel blink" style={{ fontSize: 14, color: "var(--ink)", marginBottom: 22 }}>
          ▶ PRESS START
        </div>

        <div className="stack" style={{ gap: 14, alignItems: "center" }}>
          <form action={signInAction}>
            <GoogleButton type="submit" />
          </form>
          <div className="txt-sm" style={{ textAlign: "center", maxWidth: 320 }}>
            Use your Cleo account to enter.
          </div>
          {message ? (
            <div role="alert" className="txt-sm" style={{ textAlign: "center", maxWidth: 320, color: "var(--orange)" }}>
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
