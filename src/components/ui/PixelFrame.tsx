import type { CSSProperties, ReactNode } from "react";

type PixelFrameProps = {
  children: ReactNode;
  frame?: string;
  surface?: string;
  shadow?: boolean;
  pad?: number;
  className?: string;
  style?: CSSProperties;
};

export function PixelFrame({
  children,
  frame,
  surface,
  shadow,
  pad,
  className,
  style,
}: PixelFrameProps) {
  const frameStyle: CSSProperties = { ...style };
  if (frame) (frameStyle as Record<string, string>)["--frame"] = frame;
  if (surface) (frameStyle as Record<string, string>)["--surface"] = surface;

  return (
    <div
      className={`pf${shadow ? " shadow" : ""}${className ? " " + className : ""}`}
      style={frameStyle}
    >
      <div className="pf-in" style={{ padding: pad ?? 24 }}>
        {children}
      </div>
    </div>
  );
}
