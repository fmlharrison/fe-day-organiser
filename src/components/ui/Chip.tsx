import type { ReactNode } from "react";

type ChipProps = {
  swatch: string;
  children: ReactNode;
};

export function Chip({ swatch, children }: ChipProps) {
  return (
    <span className="chip">
      <span className="sw" style={{ background: swatch }} />
      {children}
    </span>
  );
}
