// SRO action icons — original duotone SVGs drawn for each quick action (no external assets, crisp at any size).
// Each icon uses one hue (the action's colour) + white + a gold accent, so the set reads as one family.

type Name = 'jobs' | 'result' | 'admit' | 'answerkey' | 'pyq' | 'mock' | 'practice' | 'current' | 'rank' | 'request';

const HUE: Record<Name, [string, string]> = {
  // [main, deep]
  jobs: ['#2f7fd1', '#1d5a9c'],
  result: ['#e08a12', '#b06604'],
  admit: ['#d64578', '#a52a57'],
  answerkey: ['#f2662a', '#c9480f'],
  pyq: ['#7a4fd6', '#5634a8'],
  mock: ['#12968a', '#0b6d64'],
  practice: ['#1f9d55', '#137240'],
  current: ['#d6463a', '#a62d23'],
  rank: ['#c9480f', '#8a3207'],
  request: ['#5b6475', '#394150'],
};
const GOLD = '#f5b82e';

function Shape({ n, m, d }: { n: Name; m: string; d: string }) {
  switch (n) {
    case 'jobs': // briefcase + "new" spark
      return (<>
        <path d="M18 13h12a3 3 0 0 1 3 3v2h-4v-2.5h-10V18h-4v-2a3 3 0 0 1 3-3z" fill={d} />
        <rect x="7" y="17" width="34" height="23" rx="5" fill={m} />
        <path d="M7 25.5c11 4 23 4 34 0V22a5 5 0 0 0-5-5H12a5 5 0 0 0-5 5z" fill={d} opacity=".55" />
        <rect x="20.5" y="24" width="7" height="6" rx="1.8" fill="#fff" />
        <path d="M39 4.5l1.4 3.6 3.6 1.4-3.6 1.4L39 14.5l-1.4-3.6L34 9.5l3.6-1.4z" fill={GOLD} />
      </>);
    case 'result': // marksheet + medal
      return (<>
        <rect x="8" y="5" width="25" height="33" rx="4" fill={m} />
        <rect x="12" y="11" width="17" height="3" rx="1.5" fill="#fff" />
        <rect x="12" y="17" width="13" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <rect x="12" y="22.5" width="15" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <path d="M30 33l-3 11 5-2.5 4 3.5 1-11.5zM37 33l3 11-5-2.5-4 3.5-1-11.5z" fill={d} />
        <circle cx="33.5" cy="30" r="8" fill={GOLD} stroke="#fff" strokeWidth="2" />
        <path d="M33.5 25.8l1.3 2.7 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4z" fill="#fff" />
      </>);
    case 'admit': // admit card with photo + barcode
      return (<>
        <rect x="5" y="10" width="38" height="28" rx="5" fill={m} />
        <rect x="5" y="10" width="38" height="7" rx="3.5" fill={d} />
        <circle cx="10" cy="13.5" r="1.4" fill={GOLD} />
        <rect x="10" y="20" width="11" height="13" rx="2" fill="#fff" />
        <circle cx="15.5" cy="25" r="2.6" fill={m} opacity=".7" />
        <path d="M11.5 32.5c.6-3 7.4-3 8 0z" fill={m} opacity=".7" />
        <rect x="24" y="21" width="14" height="2.6" rx="1.3" fill="#fff" />
        <rect x="24" y="26" width="10" height="2.4" rx="1.2" fill="#fff" opacity=".8" />
        <path d="M24 30.5h1.4v4H24zm2.6 0h.9v4h-.9zm2 0h1.6v4h-1.6zm2.8 0h.9v4h-.9zm2 0h1.4v4h-1.4zm2.6 0h.9v4H36z" fill="#fff" />
      </>);
    case 'answerkey': // sheet with ticks + key
      return (<>
        <rect x="7" y="5" width="26" height="34" rx="4" fill={m} />
        <path d="M11.5 13l2 2 3.5-4M11.5 21l2 2 3.5-4M11.5 29l2 2 3.5-4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="20" y="12" width="9" height="2.6" rx="1.3" fill="#fff" opacity=".85" />
        <rect x="20" y="20" width="9" height="2.6" rx="1.3" fill="#fff" opacity=".85" />
        <rect x="20" y="28" width="6" height="2.6" rx="1.3" fill="#fff" opacity=".85" />
        <circle cx="33" cy="33" r="7" fill={GOLD} stroke="#fff" strokeWidth="2" />
        <circle cx="33" cy="33" r="2.4" fill={d} />
        <path d="M38 37.5l5 5-2 2-1.5-1.5-1.5 1.5-1.8-1.8 1.5-1.5-1.7-1.7z" fill={d} />
      </>);
    case 'pyq': // stacked papers + year tag
      return (<>
        <rect x="13" y="4" width="25" height="32" rx="4" fill={d} opacity=".55" transform="rotate(8 25 20)" />
        <rect x="9" y="8" width="26" height="33" rx="4" fill={m} />
        <rect x="13" y="14" width="18" height="3" rx="1.5" fill="#fff" />
        <rect x="13" y="20" width="14" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <rect x="13" y="25" width="16" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <rect x="13" y="30" width="10" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <rect x="27" y="31" width="17" height="10" rx="3" fill={GOLD} stroke="#fff" strokeWidth="1.8" />
        <text x="35.5" y="38.6" textAnchor="middle" fontSize="7" fontWeight="800" fill={d} fontFamily="system-ui, sans-serif">PYQ</text>
      </>);
    case 'mock': // CBT screen + stopwatch
      return (<>
        <rect x="4" y="8" width="34" height="24" rx="4" fill={m} />
        <rect x="8" y="12" width="26" height="16" rx="2" fill="#fff" opacity=".95" />
        <path d="M11 17h4v4h-4zM17 17h4v4h-4zM23 17h4v4h-4z" fill={m} opacity=".35" />
        <path d="M17 17h4v4h-4z" fill={m} />
        <path d="M16 32h10l2 6H14z" fill={d} />
        <rect x="11" y="38" width="20" height="3" rx="1.5" fill={d} />
        <circle cx="36" cy="31" r="9" fill={GOLD} stroke="#fff" strokeWidth="2" />
        <rect x="34.5" y="19" width="3" height="3.4" rx="1" fill={d} />
        <path d="M36 26v5l3 2" stroke={d} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </>);
    case 'practice': // OMR bubbles with one filled per row
      return (<>
        <rect x="6" y="5" width="36" height="38" rx="6" fill={m} />
        {[13, 22, 31].map((y, r) => (
          <g key={y}>
            {[14, 21, 28, 35].map((x, c) => (
              <circle key={x} cx={x} cy={y} r="3" fill={c === [1, 3, 0][r] ? GOLD : '#fff'} stroke={c === [1, 3, 0][r] ? '#fff' : 'none'} strokeWidth="1.4" opacity={c === [1, 3, 0][r] ? 1 : 0.85} />
            ))}
          </g>
        ))}
        <rect x="11" y="37" width="14" height="2.6" rx="1.3" fill="#fff" opacity=".7" />
        <path d="M34 36.5l2 2 3.6-4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);
    case 'current': // newspaper + globe
      return (<>
        <rect x="5" y="7" width="31" height="34" rx="4" fill={m} />
        <rect x="9" y="12" width="23" height="4" rx="2" fill="#fff" />
        <rect x="9" y="20" width="10" height="8" rx="1.6" fill="#fff" opacity=".85" />
        <rect x="21" y="20" width="11" height="2.4" rx="1.2" fill="#fff" opacity=".8" />
        <rect x="21" y="25" width="8" height="2.4" rx="1.2" fill="#fff" opacity=".8" />
        <rect x="9" y="31" width="19" height="2.4" rx="1.2" fill="#fff" opacity=".8" />
        <circle cx="36" cy="33" r="9" fill={GOLD} stroke="#fff" strokeWidth="2" />
        <path d="M27 33h18M36 24c3 2.6 3 15.4 0 18M36 24c-3 2.6-3 15.4 0 18" stroke={d} strokeWidth="1.6" fill="none" />
      </>);
    case 'rank': // podium with star
      return (<>
        <rect x="17" y="18" width="14" height="25" rx="3" fill={m} />
        <rect x="4" y="26" width="13" height="17" rx="3" fill={d} opacity=".75" />
        <rect x="31" y="31" width="13" height="12" rx="3" fill={d} opacity=".55" />
        <text x="24" y="33" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">1</text>
        <path d="M24 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L24 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill={GOLD} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />      </>);
    case 'request': // paper with upload arrow
      return (<>
        <path d="M9 5h18l9 9v25a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" fill={m} />
        <path d="M27 5v6a3 3 0 0 0 3 3h6z" fill={d} />
        <rect x="10" y="20" width="16" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <rect x="10" y="26" width="12" height="2.6" rx="1.3" fill="#fff" opacity=".8" />
        <circle cx="35" cy="34" r="9" fill={GOLD} stroke="#fff" strokeWidth="2" />
        <path d="M35 39v-9m-3.6 3.6L35 30l3.6 3.6" stroke={d} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>);
  }
}

export default function ActionIcon({ name, size = 34, className = '' }: { name: Name; size?: number; className?: string }) {
  const [m, d] = HUE[name];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={`aico ${className}`}>
      <Shape n={name} m={m} d={d} />
    </svg>
  );
}
export type ActionIconName = Name;
