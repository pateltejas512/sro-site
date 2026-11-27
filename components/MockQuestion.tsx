import type { Question } from '@/lib/types';
import { LANG_SHORT, langsOf } from '@/lib/data';
import { ICheckCircle } from './Icons';
import Md, { Inline, Stem } from './Md';
import I3D from './I3D';
import { qui as ui } from '@/lib/qui';

const KEYS = ['A', 'B', 'C', 'D'] as const;

/**
 * A sample question on a mock test page. Same markup as QuestionCard (so Practice gives tap-to-answer and the
 * language switch), but self-contained: mock questions have no page of their own, so the solution is inline.
 */
/** locked: premium sample — the student can answer (and sees right/wrong), but the solution is part of the paid test. */
export default function MockQuestion({ q, n, locked }: { q: Question; n: number; locked?: React.ReactNode }) {
  const langs = langsOf(q);
  return (
    <article className="q card" id={`q${n}`} data-q={q.id} data-ans={q.answer}>
      <div className="q-head">
        <span className="q-no">Q{n}</span>
        <span className="chip">{q.subject}</span>
        {q.topic && q.topic !== q.subject && <span className="chip">{q.topic}</span>}
        {langs.length > 1 && (
          <div className="q-tools no-print">
            <div className="seg" role="group" aria-label="Question language">
              {langs.map((l, i) => (<button key={l} type="button" data-setlang={l} aria-pressed={i === 0}>{LANG_SHORT[l]}</button>))}
            </div>
          </div>
        )}
      </div>
      {q.figure && (
        // eslint-disable-next-line @next/next/no-img-element
        <figure className="q-fig"><img src={q.figure} alt={`Figure for question ${n}`} loading="lazy" decoding="async" /></figure>
      )}
      <p className="lang-miss no-print" hidden aria-live="polite" />
      {langs.map((l, i) => {
        const t = q.text[l]!;
        const u = ui(l);
        return (
          <div key={l} data-lang={l} hidden={i > 0} lang={l}>
            <div className={`q-stem ${l}`}><Stem text={t.stem} /></div>
            <ul className="opts">
              {t.options.map((o, k) => (
                <li key={k}><button type="button" className="opt" data-k={KEYS[k]}><span className="k">{KEYS[k]}</span><span><Inline text={o} /></span></button></li>
              ))}
            </ul>
            {locked ? (
              <div className="sol-lock no-print">{locked}</div>
            ) : (
            <details className="sol">
              <summary><I3D name="bulb" size={22} /> {u.view}</summary>
              <div className="sol-body">
                <div className="answer-line"><ICheckCircle size={18} /> {u.ans}: {q.answer}. <Inline text={t.options[KEYS.indexOf(q.answer)]} /></div>
                {t.quick && <Md text={t.quick} className="md-quick" />}
                {t.detailed && <Md text={t.detailed} />}
                {t.tip && <div className="callout tip"><I3D name="target" size={26} /><div><b>{u.tip}</b><Inline text={t.tip} /></div></div>}
              </div>
            </details>
            )}
          </div>
        );
      })}
    </article>
  );
}
