import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import QuestionCard from '@/components/QuestionCard';
import FeedPromo from '@/components/FeedPromo';
import Practice from '@/components/Practice';
import I3D from '@/components/I3D';
import PrintButton from '@/components/PrintButton';
import PrintBrand, { PrintEnd } from '@/components/PrintBrand';
import { SUBJECTS } from '@/lib/taxonomy';
import { chapterStat, subjectStats } from '@/lib/practice';
import { subjectUrl, chapterUrl, topicGroupUrl, subtopicGroups, paperOf, examOf, paperUrl, SITE, formatDate, MIN_TOPIC_PAGE } from '@/lib/data';
import type { Question } from '@/lib/types';
import { meta, graph, breadcrumbLd, quizLd, faqLd, itemListLd, titles } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() {
  return SUBJECTS.flatMap((s) => subjectStats(s.slug)!.chapters.filter((c) => c.count > 0).map((c) => ({ subject: s.slug, chapter: c.slug })));
}

function papersOf(qs: Question[]) {
  const m = new Map<string, { label: string; url: string; n: number; year: number }>();
  for (const q of qs) {
    const p = paperOf(q);
    const k = `${p.examSlug}/${p.slug}`;
    if (!m.has(k)) m.set(k, { label: `${examOf(q).short} · ${p.shortTitle}`, url: paperUrl(p), n: 0, year: p.year });
    m.get(k)!.n++;
  }
  return [...m.values()].sort((a, b) => b.n - a.n || b.year - a.year);
}

export function generateMetadata({ params }: { params: { subject: string; chapter: string } }) {
  const c = chapterStat(params.subject, params.chapter);
  if (!c) return {};
  const ex = [...new Set(c.topics.flatMap((t) => t.questions.map((q) => examOf(q).short)))];
  return meta({
    title: titles.topic(c.chapter.name, c.count),
    description: `${c.count} ${c.chapter.name} MCQs with answers from ${ex.slice(0, 3).join(', ')} papers – ${c.topics.slice(0, 4).map((t) => t.topic).join(', ')} and more. Topic-wise, with exam name, step-by-step solution and free PDF.`,
    path: chapterUrl(params.subject, params.chapter),
  });
}

export default function ChapterPage({ params }: { params: { subject: string; chapter: string } }) {
  const c = chapterStat(params.subject, params.chapter);
  if (!c) notFound();
  const s = c.subject;
  const name = c.chapter.name;
  const path = chapterUrl(s.slug, c.slug);
  const all = c.topics.flatMap((t) => t.questions);
  const papers = papersOf(all);
  const exams = [...new Set(all.map((q) => examOf(q).short))];
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Practice MCQs', path: '/mcq/' }, { name: s.name, path: subjectUrl(s.name) }, { name, path }];
  const faqs = [
    { q: `How many ${name} MCQs are on SarkariResultOut?`, a: `${c.count} previous year ${name} questions across ${c.topics.length} topics, each with the exam it was asked in, the verified answer and a step-by-step solution.` },
    { q: `Which exams asked these ${name} questions?`, a: `${papers.slice(0, 5).map((p) => p.label).join('; ')}${papers.length > 5 ? ' and more' : ''}.` },
    { q: `Can I download ${name} MCQs as a PDF?`, a: `Yes. Tap “Download ${name} PDF” — it is free after a quick sign-in and includes every answer and solution.` },
  ];
  let n = 0;
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <PrintBrand title={`${name} MCQ — ${c.count} questions with answers`} path={path} meta="Topic-wise previous year questions with answers and solutions" />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{s.name} · updated {formatDate(SITE.updated)}</span>
            <h1>{name} MCQ – {c.count} previous year questions with solutions</h1>
            <p>Every {name} question asked in {exams.slice(0, 4).join(', ')}{exams.length > 4 ? ' and more' : ''} — arranged topic by topic, with the exam and paper shown on each question.</p>
            <div className="facts"><span>{c.count} PYQs</span><span>{c.topics.length} topics</span><span>{papers.length} paper{papers.length > 1 ? 's' : ''}</span><span>Free PDF</span></div>
            <div className="row no-print" style={{ marginTop: 12 }}><PrintButton className="btn btn-gold" label={`Download ${name} PDF`} what={`the ${name} MCQ PDF`} /></div>
          </div>
          <I3D name={c.chapter.i3d} size={120} className="side-art" />
        </div>
      </header>

      <nav className="topic-nav no-print" aria-label={`${name} topics`}>
        {c.topics.map((t) => <a key={t.topicSlug} href={`#${t.topicSlug}`} className="chip brand">{t.topic} · {t.questions.length}</a>)}
      </nav>

      <div className="layout section" style={{ marginTop: 16 }}>
        <div>
          <div className="practice-bar"><I3D name="target" size={28} /><b>Chapter practice</b><span className="grow" /><Practice storageKey={`chapter/${s.slug}/${c.slug}`} total={c.count} recent={{ url: path, title: `${name} MCQ`, exam: s.name }} /></div>
          {c.topics.map((t) => (
            <section key={t.topicSlug} id={t.topicSlug} className="topic-sec" aria-labelledby={`h-${t.topicSlug}`}>
              <div className="topic-head">
                <h2 id={`h-${t.topicSlug}`}>{t.topic} MCQs <span className="chip">{t.questions.length}</span></h2>
                {t.questions.length >= MIN_TOPIC_PAGE && <Link href={topicGroupUrl(t)} className="small">Open {t.topic} page →</Link>}
              </div>
              {subtopicGroups(t.questions).map((g) => (
                <div key={g.anchor} id={g.anchor} className="sub-sec">
                  {g.name !== 'General' && <h3 className="sub-h">{t.topic} › {g.name} <span className="muted small">({g.questions.length})</span></h3>}
                  <div className="stack">
                    {g.questions.map((q) => {
                      n++;
                      return (
                        <Fragment key={q.id}>
                          <QuestionCard q={q} mode="list" number={n} />
                          {(n === 2 || n % 6 === 0) && n < c.count && <FeedPromo n={n === 2 ? 1 : n / 6 + 1} ctx={{ exam: examOf(q).short, url: path, title: `${name} PYQs` }} />}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
        <aside className="aside">
          <div className="card pad"><h3 className="row" style={{ gap: 8 }}><I3D name="pages" size={24} /> Asked in these papers</h3>
            <ul className="list-plain">{papers.slice(0, 10).map((p) => (<li key={p.url}><Link href={p.url}><span className="grow">{p.label}</span><span className="chip brand">{p.n}</span></Link></li>))}</ul>
          </div>
          <div className="card pad"><h3>More {s.short} chapters</h3>
            <ul className="list-plain">{c.others.filter((o) => o.count > 0).map((o) => (<li key={o.slug}><Link href={chapterUrl(s.slug, o.slug)}><I3D name={o.chapter.i3d} size={22} /><span className="grow">{o.chapter.name}</span><span className="chip brand">{o.count}</span></Link></li>))}</ul>
          </div>
          <div className="promo dark"><div className="content"><h3>{name} chapter test</h3><p>Timed test with All-India rank in SRO Jeet.</p><button type="button" className="btn btn-gold btn-sm" data-checkout="jeet-yr">Get SRO Jeet ₹349</button></div><I3D name="trophy" size={96} className="art" /></div>
        </aside>
      </div>

      <section className="section card pad-lg faq" aria-labelledby="cfaq">
        <h2 id="cfaq">{name} MCQ FAQs</h2>
        {faqs.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>
      <PrintEnd />
      <JsonLd data={graph(
        breadcrumbLd(crumbs),
        quizLd(all.slice(0, 60), `${name} previous year questions`, s.name, path),
        itemListLd(c.topics.filter((t) => t.questions.length >= MIN_TOPIC_PAGE).map((t) => ({ name: `${t.topic} MCQ`, path: topicGroupUrl(t) }))),
        faqLd(faqs),
      )} />
    </div>
  );
}
