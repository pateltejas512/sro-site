import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import QuestionCard from '@/components/QuestionCard';
import FeedPromo from '@/components/FeedPromo';
import { Fragment } from 'react';
import Practice from '@/components/Practice';
import PrintButton from '@/components/PrintButton';
import PrintBrand, { PrintEnd } from '@/components/PrintBrand';
import ExamCover from '@/components/ExamCover';
import I3D from '@/components/I3D';
import { ICal, IClock, IList, IGlobe, IPlay, ITelegram, IWhatsApp, IAward } from '@/components/Icons';
import { plain, papers, getExam, getPaper, questionsForPaper, papersForExam, topicGroups, playable, paperUrl, examUrl, topicUrl, LANG_LABEL, SITE, formatDate, seoText, truncate, orderLangs, partsOf, partOfQ } from '@/lib/data';
import { meta, graph, breadcrumbLd, quizLd, titles } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return papers.filter(playable).map((p) => ({ exam: p.examSlug, paper: p.slug })); }

export function generateMetadata({ params }: { params: { exam: string; paper: string } }) {
  const p = getPaper(params.exam, params.paper);
  if (!p) return {};
  const qs = questionsForPaper(p);
  return meta({ title: titles.paper(p), description: p.seoDescription || truncate(`${p.title}: ${qs.length} solved questions with verified answers and step-by-step explanations. Practise free, attempt in real CBT mode or download the PDF. Q1: ${plain(seoText(qs[0]).stem)}`, 158), path: paperUrl(p) });
}

export default function PaperPage({ params }: { params: { exam: string; paper: string } }) {
  const p = getPaper(params.exam, params.paper);
  if (!p) notFound();
  const e = getExam(p.examSlug)!;
  const qs = questionsForPaper(p);
  const topics = topicGroups(qs);
  const others = papersForExam(e.slug).filter((x) => x.slug !== p.slug);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Previous Year Papers', path: '/pyq/' }, { name: `${e.short} PYQ`, path: examUrl(e) }, { name: p.shortTitle, path: paperUrl(p) }];
  const chapters = [...new Set(qs.map((q) => q.chapter))].map((c) => ({ c, n: qs.filter((q) => q.chapter === c).length })).sort((a, b) => b.n - a.n);
  const share = `${p.title} – solved with answers ${SITE.url}${paperUrl(p)}`;
  const parts = partsOf(p, qs);

  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead">
        <div className="phead-in">
          <ExamCover exam={e} tag="PYQ" sub={String(p.year)} />
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{p.status === 'complete' ? 'Full paper' : 'Verified questions'} · Free</span>
            <h1>{p.title} with Answers</h1>
            <div className="facts" style={{ marginBottom: 14 }}>
              <span><ICal /> {p.heldOn ? formatDate(p.heldOn) : p.year}{p.shift ? ` · ${p.shift}` : ''}</span>
              <span><IList /> {qs.length}{p.totalQuestions ? ` of ${p.totalQuestions}` : ''} questions</span>
              {p.minutes && <span><IClock /> {p.minutes} min</span>}
              {p.negative ? <span><IAward /> −{p.negative === 1 / 3 ? '1/3' : p.negative} per wrong</span> : null}
              <span><IGlobe /> {orderLangs(p.languages).map((l) => LANG_LABEL[l]).join(' · ')}</span>
            </div>
            {p.status === 'partial' && (
              <div className="notice" style={{ marginBottom: 14 }}><I3D name="hourglass" size={22} /><span><b>{qs.length} verified questions are live{p.totalQuestions ? ` of ${p.totalQuestions}` : ''}.</b> The rest are being checked against the official key. Real exam mode uses the published questions with the same time per question.</span></div>
            )}
            <div className="row">
              <Link className="btn btn-gold" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Attempt in Real exam mode</Link>
              <PrintButton what={`the ${p.shortTitle} PDF`} />
              <a className="btn btn-glass" href={`https://wa.me/?text=${encodeURIComponent(share)}`} rel="noopener nofollow"><IWhatsApp /> Share</a>
            </div>
          </div>
          <I3D name="stopwatch" size={120} className="side-art" />
        </div>
      </header>

      <PrintBrand title={`${p.title} — questions with answers`} path={paperUrl(p)} kind={p.year ? `PYQ ${p.year}` : 'PYQ PDF'} meta={`${e.authority} · ${qs.length} questions${p.minutes ? ` · ${p.minutes} min` : ''}${p.heldOn ? ` · held on ${formatDate(p.heldOn)}` : ''}`} />

      <div className="layout section" style={{ marginTop: 20 }}>
        <div>
          <div className="practice-bar no-print">
            <I3D name="target" size={28} />
            <b>Practice mode</b>
            <span className="muted small hint">Tap an option — answer and solution open instantly.</span>
            <span className="grow" />
            <Practice storageKey={`${p.examSlug}/${p.slug}`} total={qs.length} recent={{ url: paperUrl(p), title: p.title, exam: e.short }} />
          </div>
          {parts.length > 1 && (
            <section className="parts card pad no-print" aria-labelledby="parts-h">
              <h2 id="parts-h" className="parts-h">Practise part by part</h2>
              <div className="parts-grid">{parts.map((r) => (
                <div key={r.slug} className="part">
                  <div className="part-top"><b>{r.name}</b><span className="muted tiny">Q{r.from}–{r.to} · {r.count} questions</span></div>
                  {r.sub && <p className="tiny muted part-sub">{r.sub}</p>}
                  <div className="part-act"><a className="btn btn-ghost btn-sm" href={`#part-${r.slug}`}>Practise</a><Link className="btn btn-primary btn-sm" href={`${paperUrl(p)}test/?part=${r.slug}`} prefetch={false} rel="nofollow" aria-label={`Attempt ${r.name} as a timed test`}><IPlay /> Timed test</Link></div>
                </div>
              ))}</div>
            </section>
          )}
          <h2 className="sr-only">All questions with answers</h2>
          <div className="stack">{qs.map((q, i) => { const r = parts.length > 1 ? partOfQ(parts, q.qNo) : undefined; const first = r && (i === 0 || partOfQ(parts, qs[i - 1].qNo)?.slug !== r.slug); return (<Fragment key={q.id}>{first && <h2 id={`part-${r!.slug}`} className="part-title">{r!.name}{r!.sub ? <span className="muted small"> · {r!.sub}</span> : null}</h2>}<QuestionCard q={q} mode="paper" />{i % 5 === 4 && i < qs.length - 1 && <FeedPromo n={Math.floor(i / 5)} ctx={{ exam: e.short, url: paperUrl(p), title: p.title }} />}</Fragment>); })}</div>
          <div className="promo dark section">
            <div className="content"><h3>Ready for the real thing?</h3><p>Take this paper with a timer, palette and negative marking — then see your chapter-wise analysis.</p><Link className="btn btn-gold btn-sm" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Start Real exam mode</Link></div>
            <I3D name="rocket" lg size={120} className="art" />
          </div>
        </div>

        <aside className="aside">
          <div className="card pad">
            <h3 className="row" style={{ gap: 8 }}><I3D name="chart" size={24} /> Questions by chapter</h3>
            <table className="tbl"><tbody>{chapters.map((c) => (<tr key={c.c}><td>{c.c}</td><td className="num"><b>{c.n}</b></td></tr>))}</tbody></table>
          </div>
          <div className="card pad">
            <h3 className="row" style={{ gap: 8 }}><I3D name="numbers" size={24} /> Jump to question</h3>
            <div className="palette">{qs.map((q) => (<a key={q.id} href={`#q${q.qNo}`} className="pal">{q.qNo}</a>))}</div>
          </div>
          <div className="card pad">
            <h3 className="row" style={{ gap: 8 }}><I3D name="muscle" size={24} /> Practise these topics</h3>
            <ul className="list-plain">{topics.slice(0, 6).map((t) => (<li key={t.topicSlug}><Link href={topicUrl(t.questions[0])}><span className="grow">{t.topic}</span><span className="chip brand">{t.questions.length}</span></Link></li>))}</ul>
          </div>
          {others.length > 0 && (
            <div className="card pad">
              <h3>More {e.short} papers</h3>
              <ul className="list-plain">{others.map((o) => (<li key={o.slug}>{playable(o) ? <Link href={paperUrl(o)}>{o.title}</Link> : <span className="muted small" style={{ display: 'block', padding: '10px 0' }}>{o.title} · coming soon</span>}</li>))}</ul>
            </div>
          )}
          <div className="promo tg"><div className="content"><h3>Discuss this paper</h3><p>Doubts, key updates and cut-off talk.</p><a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join</a></div></div>
        </aside>
      </div>
      <PrintEnd exam={e.short} series={`/test-series/${e.slug}/`} />
      <JsonLd data={graph(breadcrumbLd(crumbs), quizLd(qs, p.title, qs[0].subject, paperUrl(p)))} />
    </div>
  );
}
