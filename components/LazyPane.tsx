'use client';
// Another language of a question on paper/chapter pages. Only the page's own language is in the HTML;
// the others (≈1–2 KB JSON each, /i18n/q/<id>.json, cached) load the moment a student switches language.
// This keeps long paper pages 2–3× lighter than shipping every language pane up front.
import { useEffect, useRef, useState } from 'react';
import Md, { Inline, Stem } from './Md';
import I3D, { asset } from './I3D';
import { ICheckCircle } from './Icons';
import FullSolution from './FullSolution';
import { qui } from '@/lib/qui';

type T = { stem: string; options: string[]; quick?: string; formula?: string[] };
const KEYS = ['A', 'B', 'C', 'D'] as const;
const cache = new Map<string, Promise<Record<string, T>>>();
// The shareable preview (file-count limit) reads one combined file instead of one file per question.
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';
let all: Promise<Record<string, Record<string, T>>> | null = null;
const load = (id: string) => {
  if (PREVIEW) {
    all ??= fetch(asset('/i18n/all.json')).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
    return all.then((a) => a[id] ?? {});
  }
  if (!cache.has(id)) cache.set(id, fetch(asset(`/i18n/q/${id}.json`)).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return cache.get(id)!;
};

export default function LazyPane({ id, lang, answer }: { id: string; lang: string; answer: string }) {
  const ui = qui(lang);
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<T | null>(null);

  useEffect(() => {
    const el = ref.current!;
    let done = false;
    const go = () => {
      if (done || el.hidden) return;
      done = true;
      load(id).then((all) => { if (all[lang]) setT(all[lang]); });
    };
    go();
    const mo = new MutationObserver(go);
    mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
    return () => mo.disconnect();
  }, [id, lang]);

  // Re-apply the student's answer marks to the freshly rendered options.
  useEffect(() => { if (t) window.dispatchEvent(new CustomEvent('sro:pane', { detail: id })); }, [t, id]);

  return (
    <div ref={ref} data-lang={lang} hidden lang={lang}>
      {!t ? <div className="q-stem pane-loading" aria-busy="true"><span className="skel" /><span className="skel" /><span className="skel short" /></div> : (
        <>
          <div className={`q-stem ${lang}`}><Stem text={t.stem} /></div>
          <ul className="opts">
            {t.options.map((o, k) => (
              <li key={k}><button type="button" className="opt" data-k={KEYS[k]}><span className="k">{KEYS[k]}</span><span><Inline text={o} /></span></button></li>
            ))}
          </ul>
          <details className="sol">
            <summary><I3D name="bulb" size={22} /> {ui.view}</summary>
            <div className="sol-body">
              <div className="answer-line"><ICheckCircle size={18} /> {ui.ans}: {answer}. <Inline text={t.options[KEYS.indexOf(answer as 'A')] ?? ''} /></div>
              {t.quick && <div className="callout concept"><I3D name="brain" size={26} /><div><b>{ui.quick}</b><Md text={t.quick} className="md-quick" /></div></div>}
              {t.formula && <div className="formula" aria-label={ui.formula}>{t.formula.join('\n')}</div>}
              <FullSolution id={id} lang={lang} />
            </div>
          </details>
        </>
      )}
    </div>
  );
}
