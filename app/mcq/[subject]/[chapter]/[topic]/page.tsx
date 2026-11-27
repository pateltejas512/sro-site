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
import { topicPageGroups, topicGroups, topicGroupUrl, subtopicGroups, subjectUrl, chapterUrl, examOf, SITE, formatDate } from '@/lib/data';
import { getSubject } from '@/lib/taxonomy';
import { meta, graph, breadcrumbLd, quizLd, titles } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return topicPageGroups().map((g) => ({ subject: g.subjectSlug, chapter: g.chapterSlug, topic: g.topicSlug })); }
type P = { params: { subject: string; chapter: string; topic: string } };
const find = ({ params: p }: P) => topicPageGroups().find((g) => g.subjectSlug === p.subject && g.chapterSlug === p.chapter && g.topicSlug === p.topic);

export function generateMetadata(props: P) {
  const g = find(props);
  if (!g) return {};
  const ex = [...new Set(g.questions.map((q) => examOf(q).short))].join(', ');
  const subs = subtopicGroups(g.questions).filter((x) => x.name !== 'General').slice(0, 3).map((x) => x.name);
  return meta({ title: titles.topic(g.topic, g.questions.length), description: `${g.questions.length} ${g.topic} questions (${g.chapter}) asked in ${ex}${subs.length ? ` – ${subs.join(', ')}` : ''}. Answers, step-by-step solutions and free PDF.`, path: topicGroupUrl(g) });
}

export default function TopicPage(props: P) {
  const g = find(props);
  if (!g) notFound();
  const s = getSubject(g.subjectSlug)!;
  const path = topicGroupUrl(g);
  const ex = [...new Set(g.questions.map((q) => examOf(q).short))];
  const subs = subtopicGroups(g.questions);
  const siblings = topicGroups().filter((x) => x.subjectSlug === g.subjectSlug && x.chapterSlug === g.chapterSlug && x.topicSlug !== g.topicSlug);
  const chUrl = chapterUrl(g.subjectSlug, g.chapterSlug);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Practice MCQs', path: '/mcq/' }, { name: g.subject, path: subjectUrl(g.subject) }, { name: g.chapter, path: chUrl }, { name: g.topic, path }];
  let n = 0;
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <PrintBrand title={`${g.topic} MCQ — ${g.questions.length} questions with answers`} path={path} meta="Previous year questions with answers and solutions" />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{g.subject} › {g.chapter}</span>
            <h1>{titles.topic(g.topic, g.questions.length)}</h1>
            <p>Every {g.topic} question asked in {ex.join(', ')} — solve, check instantly, then read the formula and exam tip.</p>
            <div className="facts"><span>{g.questions.length} PYQs</span><span>{subs.length} subtopic{subs.length > 1 ? 's' : ''}</span><span>{ex.length} exam{ex.length > 1 ? 's' : ''}</span><span>Updated {formatDate(SITE.updated)}</span></div>
            <div className="row no-print" style={{ marginTop: 12 }}><PrintButton className="btn btn-gold" label={`Download ${g.topic} PDF`} what={`the ${g.topic} MCQ PDF`} /></div>
          </div>
          <I3D name={s.chapters.find((c) => c.name === g.chapter)?.i3d ?? 'muscle'} size={120} className="side-art" />
        </div>
      </header>
      {subs.length > 1 && (
        <nav className="topic-nav no-print" aria-label={`${g.topic} subtopics`}>
          {subs.map((x) => <a key={x.anchor} href={`#${x.anchor}`} className="chip brand">{x.name} · {x.questions.length}</a>)}
        </nav>
      )}
      <div className="layout section" style={{ marginTop: 16 }}>
        <div>
          <div className="practice-bar"><I3D name="target" size={28} /><b>Topic practice</b><span className="grow" /><Practice storageKey={`topic/${g.subjectSlug}/${g.chapterSlug}/${g.topicSlug}`} total={g.questions.length} recent={{ url: path, title: `${g.topic} MCQ`, exam: g.subject }} /></div>
          {subs.map((x) => (
            <section key={x.anchor} id={x.anchor} className="sub-sec">
              {x.name !== 'General' && <h2 className="sub-h">{x.name} <span className="muted small">({x.questions.length})</span></h2>}
              <div className="stack">
                {x.questions.map((q) => {
                  n++;
                  return (
                    <Fragment key={q.id}>
                      <QuestionCard q={q} mode="list" number={n} />
                      {(n === 2 || n % 6 === 0) && n < g.questions.length && <FeedPromo n={n === 2 ? 1 : n / 6 + 1} ctx={{ exam: ex[0], url: path, title: `${g.topic} PYQs` }} />}
                    </Fragment>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <aside className="aside">
          <div className="card pad"><h3>{g.chapter} topics</h3>
            <ul className="list-plain">
              <li><Link href={chUrl}><span className="grow"><b>All {g.chapter} MCQs</b></span></Link></li>
              {siblings.map((x) => (<li key={x.topicSlug}><Link href={topicGroupUrl(x)}><span className="grow">{x.topic}</span><span className="chip brand">{x.questions.length}</span></Link></li>))}
            </ul>
          </div>
          <div className="promo"><div className="content"><h3>Weak in {g.topic}?</h3><p>SRO Jeet builds a daily drill from your mistakes.</p><button type="button" className="btn btn-white btn-sm" data-checkout="jeet-yr">Get SRO Jeet ₹349</button></div><I3D name="brain" size={96} className="art" /></div>
        </aside>
      </div>
      <PrintEnd />
      <JsonLd data={graph(breadcrumbLd(crumbs), quizLd(g.questions, `${g.topic} previous year questions`, g.subject, path))} />
    </div>
  );
}
