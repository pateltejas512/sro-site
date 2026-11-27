import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { PaperRow } from '@/components/PaperCard';
import ExamCover from '@/components/ExamCover';
import I3D from '@/components/I3D';
import ExamIcon from '@/components/ExamIcon';
import Donut from '@/components/Donut';
import { ITelegram, IPlay, IArrowRight } from '@/components/Icons';
import {
  exams, getExam, papersForExam, questionsForExam, chapterWeightage, difficultySplit, topicGroups,
  playable, paperUrl, topicUrl, examUrl, LANG_LABEL, SITE, formatDate, orderLangs,
} from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd, faqLd, titles } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return exams.map((e) => ({ exam: e.slug })); }

export function generateMetadata({ params }: { params: { exam: string } }) {
  const e = getExam(params.exam);
  if (!e) return {};
  const years = papersForExam(e.slug).map((p) => p.year);
  return meta({ title: titles.exam(e, Math.min(...years), Math.max(...years)), description: e.seoDescription || `${e.description} Updated ${formatDate(SITE.updated)}.`, path: examUrl(e) });
}

const PALETTE = ['#c9480f', '#2f7fc1', '#f5b82e', '#12a150', '#e0457b', '#7a4fd6', '#12968a', '#a16207', '#ef5656', '#64748b'];

export default function ExamPage({ params }: { params: { exam: string } }) {
  const e = getExam(params.exam);
  if (!e) notFound();
  const ps = papersForExam(e.slug);
  const qs = questionsForExam(e.slug);
  const years = [...new Set(ps.map((p) => p.year))].sort((a, b) => b - a);
  const weight = chapterWeightage(e.slug);
  const diff = difficultySplit(qs);
  const topics = topicGroups(qs);
  const langs = orderLangs([...new Set(ps.flatMap((p) => p.languages))]);
  const firstLive = ps.find(playable);
  const related = exams.filter((x) => x.slug !== e.slug).slice(0, 5);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Previous Year Papers', path: '/pyq/' }, { name: `${e.short} PYQ`, path: examUrl(e) }];
  const h1 = titles.exam(e, Math.min(...years), Math.max(...years));

  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead">
        <div className="phead-in">
          <ExamCover exam={e} tag="PYQ" />
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{e.authority}</span>
            <h1>{h1}</h1>
            <p>{e.description}</p>
            <div className="row">
              {firstLive && <Link className="btn btn-gold" href={`${paperUrl(firstLive)}test/`} prefetch={false} rel="nofollow"><IPlay /> Attempt latest paper</Link>}
              {topics[0] && <Link className="btn btn-glass" href={topicUrl(topics[0].questions[0])}>Practise by topic</Link>}
            </div>
          </div>
          <ExamIcon exam={e} size={128} className="side-art" />
        </div>
        <div className="kpis">
          <div className="kpi"><I3D name="pages" size={30} /><span><b className="nums">{ps.length}</b><span>papers</span></span></div>
          <div className="kpi"><I3D name="memo" size={30} /><span><b className="nums">{qs.length}</b><span>solved questions</span></span></div>
          <div className="kpi"><I3D name="calendar" size={30} /><span><b className="nums">{years.length > 1 ? `${years.at(-1)}–${years[0]}` : years[0]}</b><span>years covered</span></span></div>
          <div className="kpi"><I3D name="speak" size={30} /><span><b>{langs.length}</b><span>{langs.map((l) => LANG_LABEL[l]).join(' · ')}</span></span></div>
        </div>
      </header>

      <nav className="tabs" aria-label="On this page">
        <a href="#papers" aria-current="true">Papers</a>
        {weight.length > 0 && <a href="#weightage">Topic weightage</a>}
        {e.pattern && <a href="#pattern">Exam pattern</a>}
        <a href="#how">How to use</a>
        {e.faqs && <a href="#faq">FAQs</a>}
      </nav>

      <div className="layout">
        <div>
          <section id="papers" style={{ scrollMarginTop: 130 }}>
            {years.length > 1 && (
              <div className="filters" style={{ marginBottom: 12 }} aria-label="Jump to year">
                {years.map((y, i) => <a key={y} href={`#y${y}`} aria-current={i === 0 ? 'true' : undefined}>{y}</a>)}
              </div>
            )}
            {years.map((y) => {
              const list = ps.filter((p) => p.year === y);
              return (
                <div key={y} id={`y${y}`} style={{ marginBottom: 24, scrollMarginTop: 130 }}>
                  <div className="sec-head"><h2>{e.short} {y} Question Papers <span className="chip brand">{list.length} {list.length > 1 ? 'papers' : 'paper'}</span></h2></div>
                  <div className="stack">{list.map((p) => <PaperRow key={p.slug} p={p} />)}</div>
                </div>
              );
            })}
          </section>

          {weight.length > 0 && (
            <section id="weightage" className="card pad-lg section" style={{ scrollMarginTop: 130 }}>
              <div className="sec-head"><div><h2><I3D name="chart" size={30} /> {e.short} topic weightage</h2><p>Calculated live from {qs.length} published questions — grows with every new shift.</p></div></div>
              <div className="grid wt-grid">
                <Donut size={200} label={`${qs.length}`} sub="questions" parts={weight.map((w, i) => ({ v: w.n, c: PALETTE[i % PALETTE.length] }))} />
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>Chapter</th><th className="num">Qs</th><th style={{ width: '38%' }}>Share</th></tr></thead>
                    <tbody>
                      {weight.map((w, i) => (
                        <tr key={w.chapter}>
                          <td><span className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length], flex: 'none' }} /><span><b style={{ fontSize: '0.88rem' }}>{w.chapter}</b><span className="tiny muted" style={{ display: 'block' }}>{topics.filter((t) => t.chapter === w.chapter).map((t) => t.topic).join(', ')}</span></span></span></td>
                          <td className="num">{w.n}</td>
                          <td><div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><div className="bar grow"><i style={{ width: `${Math.round(w.share * 100)}%`, background: PALETTE[i % PALETTE.length] }} /></div><span className="small nums">{Math.round(w.share * 100)}%</span></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="row small" style={{ marginTop: 14 }}>
                <span className="muted">Difficulty mix</span>
                <span className="chip good">Easy {diff.Easy}</span><span className="chip warn">Moderate {diff.Moderate}</span><span className="chip bad">Hard {diff.Hard}</span>
              </div>
            </section>
          )}

          {e.pattern && (
            <section id="pattern" className="card pad-lg section" style={{ scrollMarginTop: 130 }}>
              <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}><I3D name="clipboard" size={30} /> {e.short} exam pattern</h2>
              <div className="grid g4" style={{ marginTop: 10 }}>
                {e.pattern.map((r) => (<div key={r.label} className="card pad" style={{ boxShadow: 'none', background: 'var(--surface-2)' }}><div className="tiny muted">{r.label}</div><b>{r.value}</b></div>))}
              </div>
              <p className="tiny muted" style={{ margin: '12px 0 0' }}>Always confirm with the latest official notification.</p>
            </section>
          )}

          <section id="how" className="card pad-lg section" style={{ scrollMarginTop: 130 }}>
            <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}><I3D name="compass" size={30} /> How toppers use {e.short} previous papers</h2>
            <div className="grid g2" style={{ marginTop: 10 }}>
              {[
                ['stopwatch', 'Attempt the latest shift in Real exam mode', 'It shows your honest level, time management and rank.'],
                ['bulb', 'Read every wrong and skipped solution', 'Note the formula and exam tip; bookmark the hardest ones.'],
                ['chart', 'Fix the two weakest high-weightage chapters', 'Use the weightage table, then practise those topics.'],
                ['rocket', 'Re-attempt after 7 days', 'Aim for a higher score in less time — that is real progress.'],
              ].map(([i, t, d], n) => (
                <div key={t} className="feat card" style={{ boxShadow: 'none' }}><I3D name={i} size={38} /><div><b>{n + 1}. {t}</b><p>{d}</p></div></div>
              ))}
            </div>
          </section>

          {e.faqs && (
            <section id="faq" className="card pad-lg section faq" style={{ scrollMarginTop: 130 }}>
              <h2 style={{ display: 'flex', gap: 10, alignItems: 'center' }}><I3D name="chat" size={30} /> {e.short} previous paper FAQs</h2>
              {e.faqs.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
            </section>
          )}
        </div>

        <aside className="aside">
          <div className="promo dark">
            <div className="content"><h3>{e.short} Rank Predictor</h3><p>Paste your response-sheet link → score, normalised marks and expected rank.</p><a className="btn btn-gold btn-sm" href="/rank-predictor/">Check my rank</a></div>
            <I3D name="trophy" size={104} className="art" />
          </div>
          {topics.length > 0 && (
            <div className="card pad">
              <h3 className="row" style={{ gap: 8 }}><I3D name="fire" size={24} /> Most asked topics</h3>
              <ul className="list-plain">{topics.slice(0, 6).map((t) => (<li key={t.topicSlug}><Link href={topicUrl(t.questions[0])}><span className="grow">{t.topic}</span><span className="chip brand">{t.questions.length} Qs</span></Link></li>))}</ul>
            </div>
          )}
          <div className="card pad"><h3 className="row" style={{ gap: 8 }}><I3D name="stopwatch" size={24} /> {e.short} mock test {SITE.updated.slice(0, 4)}</h3><p className="small muted" style={{ margin: '4px 0 10px' }}>Free full tests, real exam screen, All-India rank.</p><Link className="btn btn-primary btn-sm btn-block" href={`/test-series/${e.slug}/`}>Open test series</Link></div>
          <div className="promo">
            <div className="content"><h3>SRO Jeet ₹349/yr</h3><p>All-India rank, full {e.short} mocks, live tests and PDFs.</p><button type="button" className="btn btn-white btn-sm" data-checkout="jeet-yr">Get SRO Jeet</button></div>
            <I3D name="gem" lg size={100} className="art" />
          </div>
          <div className="card pad">
            <h3>Other exams</h3>
            <ul className="list-plain">{related.map((r) => (<li key={r.slug}><Link href={examUrl(r)}><ExamIcon exam={r} size={26} /><span className="grow">{r.short}</span><IArrowRight /></Link></li>))}</ul>
          </div>
          <div className="promo tg"><div className="content"><h3>{e.short} updates on Telegram</h3><p>New shifts, answer keys, cut-offs.</p><a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join</a></div></div>
        </aside>
      </div>

      <JsonLd data={graph(
        breadcrumbLd(crumbs),
        { '@type': 'CollectionPage', name: h1, url: `${SITE.url}${examUrl(e)}`, dateModified: SITE.updated, about: { '@type': 'Thing', name: e.name } },
        itemListLd(ps.filter(playable).map((p) => ({ name: p.title, path: paperUrl(p) }))),
        ...(e.faqs ? [faqLd(e.faqs)] : []),
      )} />
    </div>
  );
}
