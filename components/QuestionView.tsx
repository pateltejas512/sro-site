import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import QuestionCard from '@/components/QuestionCard';
import Practice from '@/components/Practice';
import ExamCover from '@/components/ExamCover';
import I3D from '@/components/I3D';
import { IPlay, ITelegram, IArrowRight } from '@/components/Icons';
import type { Question, Lang } from '@/lib/types';
import { paperOf, examOf, relatedQuestions, neighbours, stemText, truncate, paperUrl, examUrl, topicUrl, subjectUrl, chapterInfo, chapterUrlOf, subtopicAnchor, questionUrl, questionUrlIn, textOf, plain, defaultLang, pageLangs, hreflangs, SITE, formatDate } from '@/lib/data';
import { LANG_INFO } from '@/lib/langs';
import { meta, graph, breadcrumbLd, quizLd } from '@/lib/seo';
import { coverOf } from '@/lib/covers';

const SOLVED: Partial<Record<Lang, [string, string, string]>> = {
  en: ['[Solved]', 'Answer', 'Asked in'],
  gu: ['[જવાબ સાથે]', 'જવાબ', 'પરીક્ષા'],
  hi: ['[हल सहित]', 'उत्तर', 'परीक्षा'],
};

/** Metadata for a question page in one language, with hreflang links to the other language pages. */
export function questionMeta(q: Question, lang: Lang) {
  const t = textOf(q, lang);
  const [solved, ans, asked] = SOLVED[lang] ?? SOLVED.en!;
  const path = questionUrlIn(q, lang === defaultLang(q) ? undefined : lang);
  const p = paperOf(q);
  return meta({
    // Question text first (what students paste into Google), then exam + year for the "<exam> <year> question" searches.
    title: `${solved} ${truncate(plain(t.stem), 56)} | ${examOf(q).short} ${q.year ?? p.year}`,
    image: coverOf(p) ?? '/icon-512.png',
    description: truncate(plain(`${ans}: ${q.answer}. ${t.options['ABCD'.indexOf(q.answer)]}. ${t.quick} ${asked}: ${paperOf(q).title}.`), 158),
    path, type: 'article', languages: hreflangs(q), locale: LANG_INFO[lang].locale.replace('-', '_'),
  });
}

export default function QuestionView({ q, lang }: { q: Question; lang: Lang }) {
  const tx = textOf(q, lang);
  const url = questionUrlIn(q, lang === defaultLang(q) ? undefined : lang);
  const others = pageLangs(q).filter((l) => l !== lang);
  const p = paperOf(q);
  const e = examOf(q);
  const rel = relatedQuestions(q, 6);
  const nb = neighbours(q);
  const ch = chapterInfo(q);
  const crumbs = [{ name: 'Home', path: '/' }, { name: q.subject, path: subjectUrl(q.subject) }, { name: ch.name, path: chapterUrlOf(q) }, ...(topicUrl(q).includes('#') ? [] : [{ name: q.topic, path: topicUrl(q) }]), { name: truncate(plain(tx.stem), 48), path: url }];

  return (
    <div className="wrap" lang={lang}>
      <Breadcrumbs items={crumbs} />
      <div className="layout section" style={{ marginTop: 14 }}>
        <div className="stack">
          <Link href={paperUrl(p)} className="card continue" style={{ color: 'var(--ink)' }}>
            <ExamCover exam={e} tag="PYQ" sub={String(p.year)} />
            <span style={{ minWidth: 0 }}>
              <span className="tiny muted" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block' }}>This question was asked in</span>
              <b style={{ display: 'block' }}>{p.title}</b>
              <span className="tiny muted">Question {nb.index + 1} of {nb.total} published · {e.authority}</span>
            </span>
            <span className="btn btn-soft btn-sm">Open paper <IArrowRight /></span>
          </Link>
          {others.length > 0 && (
            <nav className="row lang-links" aria-label="Read this question in">
              <span className="tiny muted">Also in:</span>
              {others.map((l) => <Link key={l} hrefLang={LANG_INFO[l].locale} lang={l} className="chip" href={questionUrlIn(q, l === defaultLang(q) ? undefined : l)}>{LANG_INFO[l].native}</Link>)}
            </nav>
          )}
          <QuestionCard q={q} mode="page" number={q.qNo} first={lang} />
          <div className="practice-bar no-print" style={{ position: 'static' }}><I3D name="target" size={26} /><span className="small muted grow">Try it before reading the solution — tap an option.</span><Practice storageKey={`q/${q.slug}`} total={1} /></div>
          <nav className="row between" aria-label="Question navigation">
            {nb.prev ? <Link className="btn btn-ghost" href={questionUrl(nb.prev)}>← Q{nb.prev.qNo}</Link> : <span />}
            <Link className="btn btn-primary" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Attempt full paper</Link>
            {nb.next ? <Link className="btn btn-ghost" href={questionUrl(nb.next)}>Q{nb.next.qNo} →</Link> : <span />}
          </nav>
          {rel.length > 0 && (
            <section className="card pad-lg" aria-labelledby="rel-h">
              <h2 id="rel-h" className="row" style={{ gap: 10 }}><I3D name="books" size={30} /> More {q.topic} questions</h2>
              <ul className="list-plain">
                {rel.map((r) => (<li key={r.slug}><Link href={questionUrl(r)}><span className="grow">{truncate(stemText(r), 120)}</span><span className="chip">{examOf(r).short} {paperOf(r).year}</span></Link></li>))}
              </ul>
              <div className="row" style={{ marginTop: 10, gap: 8 }}><Link href={topicUrl(q)} className="btn btn-soft btn-sm">Practise all {q.topic} PYQs</Link><Link href={chapterUrlOf(q)} className="btn btn-ghost btn-sm">All {ch.name} MCQs</Link></div>
            </section>
          )}
        </div>
        <aside className="aside">
          <div className="card pad">
            <h3 className="row" style={{ gap: 8 }}><I3D name="clipboard" size={24} /> Question details</h3>
            <table className="tbl small"><tbody>
              <tr><td className="muted">Exam</td><td><Link href={examUrl(e)}>{e.short}</Link></td></tr>
              <tr><td className="muted">Paper</td><td><Link href={paperUrl(p)}>{p.shortTitle}</Link></td></tr>
              <tr><td className="muted">Year</td><td>{q.year ?? p.year}</td></tr>
              <tr><td className="muted">Subject</td><td><Link href={subjectUrl(q.subject)}>{q.subject}</Link></td></tr>
              <tr><td className="muted">Chapter</td><td><Link href={chapterUrlOf(q)}>{ch.name}</Link></td></tr>
              <tr><td className="muted">Topic</td><td><Link href={topicUrl(q)}>{q.topic}</Link></td></tr>
              {q.subtopic && <tr><td className="muted">Subtopic</td><td><Link href={`${chapterUrlOf(q)}#${subtopicAnchor(q)}`}>{q.subtopic}</Link></td></tr>}
              {q.concept && <tr><td className="muted">Concept</td><td>{q.concept}</td></tr>}
              <tr><td className="muted">Difficulty</td><td>{q.difficulty}</td></tr>
              <tr><td className="muted">Updated</td><td>{formatDate(q.updated ?? SITE.updated)}</td></tr>
            </tbody></table>
          </div>
          <div className="card pad"><h3 className="row" style={{ gap: 8 }}><I3D name="stopwatch" size={24} /> {e.short} mock test</h3><p className="small muted" style={{ margin: '4px 0 10px' }}>Free full tests from real papers with All-India rank.</p><Link className="btn btn-primary btn-sm btn-block" href={`/test-series/${e.slug}/`}>Start free mock test</Link></div>
          <div className="promo dark"><div className="content"><h3>Full {e.short} paper</h3><p>All questions, timer, analysis and rank.</p><Link className="btn btn-gold btn-sm" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow">Start now</Link></div><I3D name="trophy" size={100} className="art" /></div>
          <div className="promo tg"><div className="content"><h3>Daily PYQ on Telegram</h3><p>One solved question every morning.</p><a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join</a></div></div>
        </aside>
      </div>
      <JsonLd data={graph(breadcrumbLd(crumbs), quizLd([q], `${q.topic} – ${e.short} ${p.year} question`, q.subject, url, lang))} />
    </div>
  );
}
