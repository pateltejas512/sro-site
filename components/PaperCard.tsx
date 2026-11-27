import Link from '@/components/SmartLink';
import type { Paper } from '@/lib/types';
import { orderLangs, LANG_SHORT, paperUrl, playable, questionsForPaper, formatDate, getExam, difficultySplit } from '@/lib/data';
import { ICal, IClock, IList, IGlobe, IPlay, IDownload, IGauge, IAward } from './Icons';
import ExamCover from './ExamCover';

function level(p: Paper) {
  const d = difficultySplit(questionsForPaper(p));
  const n = d.Easy + d.Moderate + d.Hard;
  if (!n) return '—';
  const score = (d.Moderate + d.Hard * 2) / n;
  return score > 0.9 ? 'Hard' : score > 0.45 ? 'Moderate' : 'Easy';
}

/** Grid card in the style of the SRO mock-test listing (cover, facts, price/CTA). */
export function SeriesCard({ p, ribbon }: { p: Paper; ribbon?: 'hot' | 'new' | 'free' }) {
  const e = getExam(p.examSlug)!;
  const qs = questionsForPaper(p);
  const live = playable(p);
  return (
    <div className="card series">
      {live ? ribbon && <span className={`ribbon ${ribbon}`}>{ribbon === 'hot' ? 'Popular' : ribbon === 'new' ? 'New' : 'Free'}</span> : <span className="ribbon soon">Soon</span>}
      <div className="series-top">
        <ExamCover exam={e} tag="PYQ" sub={String(p.year)} />
        <div style={{ minWidth: 0 }}>
          <h3>{live ? <Link href={paperUrl(p)}>{p.title}</Link> : p.title}</h3>
          <div className="muted tiny">{e.authority}</div>
        </div>
      </div>
      <div className="meta">
        <span><IList /> {live ? `${qs.length}${p.totalQuestions ? `/${p.totalQuestions}` : ''} Qs` : `${p.importedQuestions} Qs`}</span>
        <span><IClock /> {p.minutes ? `${p.minutes} min` : 'Untimed'}</span>
        <span><IAward /> {p.negative ? `−${p.negative === 1 / 3 ? '1/3' : p.negative} negative` : 'No negative'}</span>
        <span><IGauge /> {live ? level(p) : '—'}</span>
        <span><ICal /> {p.heldOn ? formatDate(p.heldOn) : p.year}</span>
        <span><IGlobe /> {orderLangs(p.languages).map((l) => LANG_SHORT[l]).join(' · ')}</span>
      </div>
      {live && p.totalQuestions ? (
        <div>
          <div className="row between tiny muted" style={{ marginBottom: 4 }}><span>Published</span><span className="nums">{Math.round((qs.length / p.totalQuestions) * 100)}%</span></div>
          <div className="progress"><i style={{ width: `${(qs.length / p.totalQuestions) * 100}%` }} /></div>
        </div>
      ) : null}
      <div className="series-foot">
        {live ? <span className="free-tag">FREE</span> : <span className="muted small">Importing this week</span>}
        {live ? (
          <Link className="btn btn-primary btn-sm" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Attempt</Link>
        ) : (
          <span className="btn btn-ghost btn-sm" aria-disabled="true">Notify me</span>
        )}
      </div>
    </div>
  );
}

/** Compact row for the exam page's year-wise list . */
export function PaperRow({ p }: { p: Paper }) {
  const e = getExam(p.examSlug)!;
  const qs = questionsForPaper(p);
  const live = playable(p);
  return (
    <div className="card paper-row">
      <ExamCover exam={e} tag="PYQ" sub={String(p.year)} />
      <div style={{ minWidth: 0 }}>
        <h3>{live ? <Link href={paperUrl(p)}>{p.title}</Link> : p.title}</h3>
        <div className="facts" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
          <span><ICal /> {p.heldOn ? formatDate(p.heldOn) : p.year}{p.shift ? ` · ${p.shift}` : ''}</span>
          <span><IList /> {live ? `${qs.length}${p.totalQuestions ? ` of ${p.totalQuestions}` : ''} questions` : `${p.importedQuestions} questions`}</span>
          {p.minutes && <span><IClock /> {p.minutes} min</span>}
          <span><IGlobe /> {orderLangs(p.languages).map((l) => LANG_SHORT[l]).join(' · ')}</span>
        </div>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          {p.status === 'complete' && <span className="chip good">Full paper</span>}
          {p.status === 'partial' && <span className="chip warn">Partial · being completed</span>}
          {p.status === 'import-pending' && <span className="chip">Moving to new system</span>}
          {live && <span className="chip brand">{level(p)}</span>}
          <span className="chip good">Free</span>
        </div>
      </div>
      <div className="paper-actions">
        {live ? (
          <>
            <Link className="btn btn-primary btn-sm" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Real exam</Link>
            <Link className="btn btn-soft btn-sm" href={paperUrl(p)}>Practice</Link>
            <Link className="btn btn-ghost btn-sm" href={`${paperUrl(p)}#pdf`} aria-label={`${p.title} PDF`}><IDownload /> PDF</Link>
          </>
        ) : (
          <span className="btn btn-ghost btn-sm" aria-disabled="true">Coming this week</span>
        )}
      </div>
    </div>
  );
}

export default PaperRow;
