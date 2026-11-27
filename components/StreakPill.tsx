'use client';
import { useEffect, useState } from 'react';
import { streak } from '@/lib/local';
import I3D from './I3D';

export default function StreakPill() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => { setN(streak()); const h = () => setN(streak()); window.addEventListener('sro:active', h); return () => window.removeEventListener('sro:active', h); }, []);
  return (
    <a href="/my/" className="streak-pill" title="Daily practice streak" aria-label={`${n ?? 0} day practice streak`}>
      <I3D name="fire" size={24} eager />
      <span className="nums">{n ?? 0}</span>
    </a>
  );
}
