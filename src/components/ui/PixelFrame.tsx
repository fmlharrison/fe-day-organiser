import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type PixelFrameProps = HTMLAttributes<HTMLDivElement> & {
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
  pad = 24,
  className = "",
  style,
  ...rest
}: PixelFrameProps) {
  const frameStyle: CSSProperties & Record<string, string> = { ...style };
  if (frame) frameStyle["--frame"] = frame;
  if (surface) frameStyle["--surface"] = surface;

  return (
    <div
      className={`pf ${shadow ? "shadow" : ""} ${className}`.trim()}
      style={frameStyle}
      {...rest}
    >
      <div className="pf-in" style={{ padding: pad }}>
        {children}
      </div>
    </div>
  );
}
