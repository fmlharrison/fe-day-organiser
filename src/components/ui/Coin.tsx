export function Coin() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="28"
      height="28"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="var(--gold)">
        <rect x="4" y="1" width="8" height="2" />
        <rect x="2" y="3" width="2" height="2" />
        <rect x="12" y="3" width="2" height="2" />
        <rect x="1" y="5" width="2" height="6" />
        <rect x="13" y="5" width="2" height="6" />
        <rect x="2" y="11" width="2" height="2" />
        <rect x="12" y="11" width="2" height="2" />
        <rect x="4" y="13" width="8" height="2" />
      </g>
      <rect x="6" y="4" width="2" height="8" fill="var(--bg)" />
      <rect x="8" y="4" width="2" height="8" fill="var(--bg)" />
    </svg>
  );
}
