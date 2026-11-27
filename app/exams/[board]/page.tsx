import { notFound } from 'next/navigation';
import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import BoardSeal from '@/components/BoardSeal';
import ActionIcon from '@/components/ActionIcon';
import { IArrowRight } from '@/components/Icons';
import { BOARDS, getBoard, boardExams, requestUrl } from '@/data/boards';
import { getExam, papersForExam, questionsForExam, examUrl } from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';

export function generateStaticParams() { return BOARDS.map((b) => ({ board: b.slug })); }

export function generateMetadata({ params }: { params: { board: string } }) {
  const b = getBoard(params.board);
  if (!b) return {};
  const names = boardExams(b).slice(0, 5).map((e) => e.short).join(', ');
  return meta({
    title: `${b.short} Exams 2026 – ${names} Previous Year Papers & Mock Tests`,
    description: `${b.name}: ${names} and more — solved previous year question papers, free practice, mock tests with All-India rank, in English, Hindi and Gujarati.`,
    path: `/exams/${b.slug}/`,
  });
}

export default function BoardPage({ params }: { params: { board: string } }) {
  const b = getBoard(params.board);
  if (!b) notFound();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'All Exams', path: '/exams/' }, { name: `${b.short} Exams`, path: `/exams/${b.slug}/` }];
  const all = boardExams(b);
  const faqs = [
    { q: `Which ${b.short} exams have solved papers on SRO?`, a: all.filter((e) => e.exam).length ? `${all.filter((e) => e.exam).map((e) => e.short).join(', ')} have solved previous year papers live now. The other ${b.short} exams are being added — request yours and you will be notified.` : `${b.short} papers are being added now. Request the exam you are preparing for and you will be notified when it is live.` },
    { q: `Are ${b.short} previous year papers free?`, a: 'Yes. Reading every question with its answer and solution, and practising in Practice mode, is free. SRO Jeet adds full mock tests with All-India rank.' },
  ];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="board-head card">
        <BoardSeal board={b} size={88} />
        <div>
          <span className="eyebrow">{b.scope === 'Central' ? 'Central government' : 'Gujarat government'}</span>
          <h1>{b.short} Exams — Previous Year Papers</h1>
          <p className="lead">{b.name}. {b.blurb}</p>
        </div>
      </header>

      {b.groups.map((g) => (
        <section key={g.title} className="section" aria-label={g.title}>
          <h2 className="sec-h">{g.title}</h2>
          <div className="bx-grid">
            {g.exams.map((e) => {
              const ex = e.exam ? getExam(e.exam) : undefined;
              if (ex) {
                const ps = papersForExam(ex.slug).length;
                const qs = questionsForExam(ex.slug).length;
                return (
                  <Link key={e.short} href={examUrl(ex)} className="bx card live">
                    <span className="bx-tag">Live</span>
                    <h3>{e.name}</h3>
                    {e.posts && <p className="bx-posts">{e.posts}</p>}
                    <p className="bx-stats"><b>{ps}</b> paper{ps === 1 ? '' : 's'} · <b>{qs}</b> solved questions</p>
                    <span className="bx-cta">Open papers <IArrowRight /></span>
                  </Link>
                );
              }
              return (
                <a key={e.short} href={requestUrl(b, e)} className="bx card">
                  <span className="bx-tag soon">Coming soon</span>
                  <h3>{e.name}</h3>
                  {e.posts && <p className="bx-posts">{e.posts}</p>}
                  <p className="bx-stats">Have this paper? Send it — we solve and publish it.</p>
                  <span className="bx-cta">Request paper <IArrowRight /></span>
                </a>
              );
            })}
          </div>
        </section>
      ))}

      <section className="section">
        <a href={requestUrl(b)} className="card req-band">
          <span className="ic tint-gray"><ActionIcon name="request" size={40} /></span>
          <div><h2>Need another {b.short} paper?</h2><p>Tell us the exam, year and shift. Upload the question paper if you have it.</p></div>
          <span className="btn btn-primary btn-sm">Request a paper <IArrowRight /></span>
        </a>
      </section>

      <section className="section faq" aria-labelledby="bfaq">
        <h2 id="bfaq" className="sec-h">Questions</h2>
        {faqs.map((f) => (<details key={f.q} className="card"><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>
      <JsonLd data={graph(breadcrumbLd(crumbs), itemListLd(all.filter((e) => e.exam).map((e) => ({ name: e.name, path: examUrl(getExam(e.exam!)!) }))), faqLd(faqs))} />
    </div>
  );
}
