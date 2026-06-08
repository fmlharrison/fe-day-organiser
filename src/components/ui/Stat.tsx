type StatProps = {
  k: string;
  v: string;
};

export function Stat({ k, v }: StatProps) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}
