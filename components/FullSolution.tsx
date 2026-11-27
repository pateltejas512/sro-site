'use client';
// The complete step-by-step solution inside a paper / chapter list. It is fetched (≈1–2 KB, cached) the first
// time its "View answer & solution" panel opens — by the student or by Practice after an option is tapped —
// so a 200-question paper does not ship 200 long solutions up front.
import { useEffect, useRef, useState } from 'react';
import Md, { Inline } from './Md';
import I3D, { asset } from './I3D';
import { qui } from '@/lib/qui';

type Sol = { p: string; d: Record<string, string>; q?: Record<string, string>; f?: Record<string, string[]>; t?: Record<string, string>; i?: string[] };
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';
const cache = new Map<string, Promise<Sol | null>>();
let all: Promise<Record<string, Sol>> | null = null;
const json = (u: string) => fetch(asset(u)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
export const loadSol = (id: string): Promise<Sol | null> => {
  if (PREVIEW) { all ??= json('/sol/all.json').then((a) => a ?? {}); return all.then((a) => a[id] ?? null); }
  if (!cache.has(id)) cache.set(id, json(`/sol/${id}.json`));
  return cache.get(id)!;
};

export default function FullSolution({ id, lang, withQuick = false }: { id: string; lang: string; withQuick?: boolean }) {
  const ui = qui(lang);
  const ref = useRef<HTMLDivElement>(null);
  const [sol, setSol] = useState<Sol | null | undefined>(undefined); // undefined = not requested yet
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = ref.current?.closest('details');
    if (!d) return;
    let done = false;
    const go = () => {
      if (done || !d.open) return;
      done = true; setBusy(true);
      loadSol(id).then((s) => { setSol(s); setBusy(false); if (!s) { done = false; cache.delete(id); if (PREVIEW) all = null; } });
    };
    go();
    d.addEventListener('toggle', go);
    return () => d.removeEventListener('toggle', go);
  }, [id]);

  const own = sol?.d[lang];
  const detailed = own ?? (sol ? sol.d[sol.p] ?? Object.values(sol.d)[0] : undefined);
  const borrowed = !own && !!detailed;
  const quick = withQuick ? sol?.q?.[lang] ?? (sol ? sol.q?.[sol.p] : undefined) : undefined;
  const formula = withQuick ? sol?.f?.[lang] ?? (sol ? sol.f?.[sol.p] : undefined) : undefined;
  const tip = sol?.t?.[lang] ?? (sol ? sol.t?.[sol.p] : undefined);

  return (
    <div ref={ref} className="full-sol" aria-busy={busy}>
      {(busy || sol === undefined) && <div className="pane-loading" aria-hidden="true"><span className="skel" /><span className="skel" /><span className="skel short" /></div>}
      {sol === null && !busy && <p className="muted small" style={{ margin: 0 }}>{ui.retry}</p>}
      {sol && (
        <>
          {quick && <div className="callout concept"><I3D name="brain" size={26} /><div><b>{ui.quick}</b><Md text={quick} className="md-quick" /></div></div>}
          {formula && <div className="formula" aria-label={ui.formula}>{formula.map((f, i) => <div key={i}><Inline text={/\$|\\\(/.test(f) ? f : `$${f}$`} /></div>)}</div>}
          {detailed && (
            <section className="steps" aria-label={ui.steps}>
              <h4 className="steps-h">{ui.steps}</h4>
              {borrowed && <p className="dh-note">{ui.detailIn}</p>}
              <div lang={borrowed ? sol.p : lang}><Md text={detailed} /></div>
            </section>
          )}
          {sol.i?.map((src) => (<figure key={src} className="sol-img"><img src={src} alt={ui.diagramAlt} loading="lazy" decoding="async" width={720} height={405} /></figure>))}
          {tip && <div className="callout tip"><I3D name="target" size={26} /><div><b>{ui.tip}</b><Inline text={tip} /></div></div>}
        </>
      )}
    </div>
  );
}
