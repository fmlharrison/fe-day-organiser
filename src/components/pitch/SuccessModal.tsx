import Link from "next/link";
import { PixelFrame } from "@/components/ui/PixelFrame";
import { TYPE_BY_ID } from "@/lib/feday-data";
import type { SubmittedTalk } from "@/lib/validation";

type SuccessModalProps = {
  submission: SubmittedTalk;
  onClose: () => void;
};

const STARS = ["★", "✦", "✸", "✦", "★"];

export function SuccessModal({ submission, onClose }: SuccessModalProps) {
  const t = TYPE_BY_ID[submission.type];

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <PixelFrame frame="var(--teal)" surface="var(--bg-2)" shadow pad={0}>
          <div style={{ textAlign: "center", padding: "34px 30px 36px", position: "relative" }}>
            <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "space-around", pointerEvents: "none" }}>
              {STARS.map((s, i) => (
                <span key={i} className="pixel" style={{ fontSize: 14, color: "var(--gold)", animation: `floatup 1.2s ${i * 0.12}s steps(6) infinite` }}>
                  {s}
                </span>
              ))}
            </div>

            <div className="pixel" style={{ fontSize: 20, color: "var(--teal)", marginTop: 14, marginBottom: 18 }}>
              ★ IDEA GET! ★
            </div>
            <h2 style={{ fontSize: 18, color: "var(--gold)", lineHeight: 1.5 }}>
              YOUR TALK
              <br />
              IS IN THE QUEUE
            </h2>

            <div style={{ background: "var(--bg)", padding: "16px 18px", margin: "24px 0", textAlign: "left", borderLeft: `6px solid ${t.color}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="pixel" style={{ fontSize: 8, color: t.color }}>
                {t.name} · {t.dur}
              </div>
              <div className="txt-lg" style={{ color: "var(--ink)", lineHeight: 1.15 }}>
                “{submission.title}”
              </div>
              <div className="txt-sm">
                — {submission.name}, {submission.team}
              </div>
            </div>

            <div className="txt" style={{ fontSize: 19, color: "var(--ink-dim)", marginBottom: 24 }}>
              We’ll slot it into the running order and shout when it’s confirmed. Pitch another any time.
            </div>
            <Link href="/agenda" className="btn teal">
              ◀ BACK TO AGENDA
            </Link>
          </div>
        </PixelFrame>
      </div>
    </div>
  );
}
