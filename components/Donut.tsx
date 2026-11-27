/** Server-rendered SVG donut (no chart library). */
export default function Donut({ parts, size = 160, label, sub, thickness = 22 }: { parts: { v: number; c: string }[]; size?: number; label?: string; sub?: string; thickness?: number }) {
  const r = 50 - thickness / 4;
  const C = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.v, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label ?? ''} ${sub ?? ''}`.trim()} style={{ maxWidth: '100%', margin: '0 auto', display: 'block' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness / 2} />
      {parts.map((p, i) => {
        const len = (p.v / total) * C;
        const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={p.c} strokeWidth={thickness / 2} strokeDasharray={`${Math.max(0, len - 0.6)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 50 50)" />;
        acc += len;
        return el;
      })}
      {label && <text x="50" y={sub ? 49 : 54} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)">{label}</text>}
      {sub && <text x="50" y="61" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--muted)">{sub}</text>}
    </svg>
  );
}
