// SRO board badge: an original circular seal (monogram + a motif for what the board recruits for).
// Deliberately NOT a copy of any official logo/emblem — it is SRO's own design, sharp at any resolution (SVG).
import type { Board } from '@/data/boards';

function Motif({ k, c }: { k: Board['seal']['motif']; c: string }) {
  const s = { fill: 'none', stroke: c, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (k) {
    case 'rail': return (<g {...s}><rect x="42" y="16" width="16" height="15" rx="4" /><path d="M45 22h10M46 34l-3 4M54 34l3 4" /><circle cx="46.5" cy="27.5" r=".9" fill={c} /><circle cx="53.5" cy="27.5" r=".9" fill={c} /></g>);
    case 'book': return (<g {...s}><path d="M50 19c-3-2-7-2-9-1v14c2-1 6-1 9 1 3-2 7-2 9-1V18c-2-1-6-1-9 1zM50 19v14" /></g>);
    case 'bank': return (<g {...s}><path d="M40 23l10-6 10 6zM42 25v8M47 25v8M53 25v8M58 25v8M40 35h20" /></g>);
    case 'clipboard': return (<g {...s}><rect x="42" y="18" width="16" height="18" rx="2.5" /><path d="M46 18v-2h8v2M45.5 25l2 2 4-4M45.5 31h9" /></g>);
    case 'scales': return (<g {...s}><path d="M50 16v19M44 35h12M41 21h18M41 21l-3 7h6zM59 21l-3 7h6z" /></g>);
    case 'village': return (<g {...s}><path d="M41 26l9-8 9 8M43 24v11h14V24M48 35v-6h4v6" /></g>);
    case 'bolt': return (<g {...s}><path d="M52 15l-8 12h6l-2 10 8-13h-6z" fill={c} fillOpacity=".25" /></g>);
    case 'shield': return (<g {...s}><path d="M50 15l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12v-6z" /><path d="M50 21l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill={c} /></g>);
    case 'chalk': return (<g {...s}><rect x="40" y="17" width="20" height="14" rx="2" /><path d="M44 22h8M44 26h5M47 31l-3 6M53 31l3 6" /></g>);
  }
}

export default function BoardSeal({ board, size = 64, className = '' }: { board: Pick<Board, 'slug' | 'seal'>; size?: number; className?: string }) {
  const { mono, hue, deep, motif } = board.seal;
  const fs = mono.length > 4 ? 15 : mono.length > 3 ? 17.5 : mono.length > 2 ? 21 : 24;
  // No gradient <defs>: an id-based gradient breaks when the same seal also sits in a hidden menu (duplicate ids).
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={`seal ${className}`}>
      <circle cx="50" cy="50" r="48" fill={deep} />
      <circle cx="46" cy="44" r="43" fill={hue} />
      <ellipse cx="40" cy="30" rx="26" ry="16" fill="#fff" fillOpacity=".1" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return <circle key={i} cx={+(50 + Math.cos(a) * 45).toFixed(1)} cy={+(50 + Math.sin(a) * 45).toFixed(1)} r=".9" fill="#fff" fillOpacity=".5" />;
      })}
      <circle cx="50" cy="50" r="36" fill="#fff" fillOpacity=".1" />
      <Motif k={motif} c="#f5d27a" />
      <text x="50" y={fs > 20 ? 63 : 61} textAnchor="middle" fontSize={fs} fontWeight="800" fill="#fff" fontFamily="var(--font-jakarta), system-ui, sans-serif" letterSpacing=".5">{mono}</text>
      <path d="M30 72h40" stroke="#f5d27a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
