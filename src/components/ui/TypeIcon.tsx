import { TYPE_BY_ID, type TalkTypeId } from "@/lib/feday-data";

type TypeIconProps = {
  id: TalkTypeId;
};

export function TypeIcon({ id }: TypeIconProps) {
  const c = TYPE_BY_ID[id]?.color || "var(--ink)";

  if (id === "lightning") {
    return (
      <svg
        className="tc-icon"
        viewBox="0 0 64 48"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
      >
        <g fill={c}>
          <rect x="34" y="4" width="8" height="8" />
          <rect x="28" y="12" width="8" height="8" />
          <rect x="22" y="20" width="8" height="8" />
          <rect x="28" y="20" width="16" height="8" />
          <rect x="22" y="28" width="8" height="8" />
          <rect x="16" y="36" width="8" height="8" />
        </g>
      </svg>
    );
  }

  if (id === "talk") {
    return (
      <svg
        className="tc-icon"
        viewBox="0 0 64 48"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
      >
        <g fill={c}>
          <rect x="10" y="6" width="44" height="6" />
          <rect x="10" y="12" width="6" height="20" />
          <rect x="48" y="12" width="6" height="20" />
          <rect x="10" y="32" width="44" height="6" />
          <rect x="22" y="38" width="20" height="4" />
          <rect x="18" y="18" width="22" height="4" fill="var(--bg)" />
          <rect x="18" y="24" width="28" height="4" fill="var(--bg)" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className="tc-icon"
      viewBox="0 0 64 48"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
    >
      <g fill={c}>
        <rect x="14" y="8" width="12" height="12" />
        <rect x="30" y="8" width="12" height="12" />
        <rect x="22" y="22" width="12" height="12" />
        <rect x="6" y="22" width="12" height="12" />
        <rect x="38" y="22" width="12" height="12" />
        <rect x="14" y="36" width="12" height="8" />
        <rect x="30" y="36" width="12" height="8" />
      </g>
    </svg>
  );
}
