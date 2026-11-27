'use client';
import { useEffect, useState } from 'react';
import { recent, type Recent } from '@/lib/local';
import { IPlay } from './Icons';
import I3D from './I3D';

/** "Continue where you left" (from this device). Shows a starter card for new visitors. */
export default function ContinueCard({ starter }: { starter: { url: string; title: string; exam: string } }) {
  const [r, setR] = useState<Recent | null | undefined>(undefined);
  useEffect(() => { setR(recent()[0] ?? null); }, []);
  const item = r ?? { ...starter, done: 0, total: 0 };
  const pct = r && r.total ? Math.round((r.done / r.total) * 100) : 0;
  return (
    <div className="card continue">
      <div className="cover c-gujarat" aria-hidden="true" style={{ display: 'grid', placeItems: 'center' }}><I3D name={r ? 'rocket' : 'target'} size={46} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="tiny muted" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>{r ? 'Continue where you left' : 'Start here · most attempted today'}</div>
        <b className="clamp2" style={{ lineHeight: 1.3 }}>{item.title}</b>
        {r ? (
          <div className="row" style={{ gap: 8, marginTop: 6 }}>
            <div className="progress grow" style={{ maxWidth: 260 }}><i style={{ width: `${pct}%` }} /></div>
            <span className="tiny muted nums">{r.done}/{r.total} done · {pct}%</span>
          </div>
        ) : (
          <div className="tiny muted" style={{ marginTop: 4 }}>{item.exam} · free · instant answers · English, हिन्दी, ગુજરાતી</div>
        )}
      </div>
      <a className="btn btn-primary" href={item.url}><IPlay /> {r ? 'Continue' : 'Start practice'}</a>
    </div>
  );
}
