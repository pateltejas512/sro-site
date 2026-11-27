import Link from '@/components/SmartLink';
import type { Question, Lang } from '@/lib/types';
import { LANG_SHORT, langsOf, questionUrl, topicUrl, chapterInfo, chapterUrlOf, subtopicAnchor, paperUrl, paperOf, examOf, truncate, stemText } from '@/lib/data';
import { ICheckCircle, IShield, IBookmark, IShare, IFlag } from './Icons';
import Md, { Inline, Stem } from './Md';
import I3D from './I3D';
import LazyPane from './LazyPane';
import FullSolution from './FullSolution';
import { qui as ui } from '@/lib/qui';

const KEYS = ['A', 'B', 'C', 'D'] as const;
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';
// Labels follow the language of the question pane, so a Hindi question reads fully in Hindi.


/**
 * One question. mode:
 *  - paper: inside a paper (number = paper question no.)
 *  - list:  inside a chapter/topic page (shows where it was asked + topic › subtopic)
 *  - page:  the question's own page (solution open, stem is the H1)
 */
export default function QuestionCard({ q, mode = 'paper', number, first, showTopic = true }: { q: Question; mode?: 'paper' | 'page' | 'list'; number?: number; first?: Lang; showTopic?: boolean }) {
  const all = langsOf(q);
  const langs = first && all.includes(first) ? [first, ...all.filter((l) => l !== first)] : all;
  const open = mode === 'page';
  const p = paperOf(q);
  const e = examOf(q);
  const ch = chapterInfo(q);
  return (
    <article className="q card" id={mode === 'paper' ? `q${q.qNo}` : `q-${q.slug}`} data-q={q.id} data-ans={q.answer}>
      <div className="q-head">
        <span className="q-no">Q{number ?? q.qNo}</span>
        <span className={`chip ${q.difficulty === 'Easy' ? 'good' : q.difficulty === 'Hard' ? 'bad' : 'warn'}`}>{q.difficulty}</span>
        {mode !== 'list' && <Link href={topicUrl(q)} className="chip">{q.topic}</Link>}
        <div className="q-tools no-print">
          {langs.length > 1 && (
            <div className="seg" role="group" aria-label="Question language">
              {langs.map((l, i) => (<button key={l} type="button" data-setlang={l} aria-pressed={i === 0}>{LANG_SHORT[l]}</button>))}
            </div>
          )}
          <button type="button" className="tool" data-bm={q.id} data-url={questionUrl(q)} data-text={truncate(stemText(q), 90)} data-topic={q.topic} aria-pressed="false" aria-label="Bookmark question"><IBookmark /> <span className="hide-sm">Save</span></button>
          <button type="button" className="tool" data-share={questionUrl(q)} aria-label="Copy link to this question"><IShare /></button>
        </div>
      </div>

      {mode !== 'paper' && (
        <div className="q-meta">
          {mode === 'list' && <Link href={paperUrl(p)} className="asked"><I3D name="pages" size={18} /> <span>Asked in: <b>{e.short}</b> · {p.shortTitle}{q.year && !p.shortTitle.includes(String(q.year)) ? ` · ${q.year}` : ''}</span></Link>}
          {showTopic && (
            <nav className="q-path" aria-label="Topic">
              {mode === 'page' && <><Link href={chapterUrlOf(q)}>{ch.name}</Link><span aria-hidden="true">›</span></>}
              <Link href={topicUrl(q)}>{q.topic}</Link>
              {q.subtopic && <><span aria-hidden="true">›</span><Link href={`${chapterUrlOf(q)}#${subtopicAnchor(q)}`}>{q.subtopic}</Link></>}
            </nav>
          )}
        </div>
      )}

      {q.figureMissing && (
        <div className="notice light" style={{ marginBottom: 12 }}>This question uses a figure from the original paper. The figure is being added; the answer and explanation are already verified.</div>
      )}

      {q.figure && (
        // eslint-disable-next-line @next/next/no-img-element
        <figure className="q-fig"><img src={q.figure} alt={`${q.topic}${q.concept ? ` – ${q.concept}` : ''}: figure for question ${q.qNo}`} loading="lazy" decoding="async" /></figure>
      )}

      <p className="lang-miss no-print" hidden aria-live="polite" />

      {langs.map((l, i) => {
        // Long lists ship only the first language; the others load on demand (see LazyPane).
        if (i > 0 && mode !== 'page' && q.lazyLangs) {
          return <LazyPane key={l} id={q.id} lang={l} answer={q.answer} />;
        }
        const t = q.text[l]!;
        const u = ui(l);
        const correct = t.options[KEYS.indexOf(q.answer)];
        const detailed = t.detailed ?? (l !== q.primaryLang ? q.text[q.primaryLang]?.detailed : undefined);
        const borrowed = !t.detailed && !!detailed;
        return (
          <div key={l} data-lang={l} hidden={i > 0} lang={l}>
            {mode === 'page' ? <h1 className={`q-stem ${l}`} style={{ fontSize: '1.14rem', fontWeight: 700 }}><Stem text={t.stem} /></h1> : <div className={`q-stem ${l}`}><Stem text={t.stem} /></div>}
            <ul className="opts">
              {t.options.map((o, k) => (
                <li key={k}>
                  <button type="button" className={`opt${open && KEYS[k] === q.answer ? ' is-correct' : ''}`} data-k={KEYS[k]}>
                    <span className="k">{KEYS[k]}</span><span><Inline text={o} /></span>
                  </button>
                </li>
              ))}
            </ul>
            <details className="sol" open={open}>
              <summary><I3D name="bulb" size={22} /> {open ? u.full : u.view}</summary>
              <div className="sol-body">
                <div className="answer-line"><ICheckCircle size={18} /> {u.ans}: {q.answer}. <Inline text={correct} /></div>
                {mode !== 'paper' && <div className="callout concept"><I3D name="brain" size={26} /><div><b>{u.quick}</b><Md text={t.quick} className="md-quick" /></div></div>}
                {mode !== 'paper' && t.formula && <div className="formula" aria-label={u.formula}>{t.formula.map((f, i) => <div key={i}><Inline text={/\$|\\\(/.test(f) ? f : `$${f}$`} /></div>)}</div>}
                {open ? (
                  <>
                    {borrowed && <p className="dh-note">{u.detailIn}</p>}
                    {detailed && <div lang={borrowed ? q.primaryLang : l}><Md text={detailed} /></div>}
                    {!PREVIEW && q.solutionImages?.map((src) => (
                      <figure key={src} className="sol-img"><img src={src} alt={`Solution diagram – ${truncate(stemText(q, l), 80)}`} loading="lazy" decoding="async" width={720} height={405} /></figure>
                    ))}
                    {t.tip && <div className="callout tip"><I3D name="target" size={26} /><div><b>{u.tip}</b><Inline text={t.tip} /></div></div>}
                  </>
                ) : (
                  <FullSolution id={q.id} lang={l} withQuick={mode === 'paper'} />
                )}
              </div>
            </details>
          </div>
        );
      })}

      <div className="q-foot">
        <span className="verified"><IShield /> Verified · {q.verifiedBy}</span>
        {mode === 'paper' && <Link href={questionUrl(q)}>Open as a page →</Link>}
        {mode === 'list' && <Link href={questionUrl(q)}>Solution page →</Link>}
        <a href={`/report/?q=${q.id}`} className="muted" rel="nofollow"><IFlag /> Report</a>
      </div>
    </article>
  );
}
