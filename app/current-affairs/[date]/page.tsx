import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import PrintButton from '@/components/PrintButton';
import PrintBrand, { PrintEnd } from '@/components/PrintBrand';
import { ITelegram } from '@/components/Icons';
import { currentAffairs, type CADay } from '@/data/current-affairs';
import { SITE, formatDate } from '@/lib/data';
import { meta, graph, breadcrumbLd } from '@/lib/seo';

// /current-affairs/{yyyy-mm-dd}/ — one indexable page per day. '/current-affairs/today/' always exists and shows the latest set.
export const dynamicParams = false;
export function generateStaticParams() { return [{ date: 'today' }, ...currentAffairs.map((d) => ({ date: d.date }))]; }
const sorted = () => [...currentAffairs].sort((a, b) => b.date.localeCompare(a.date));
const dayOf = (p: string): CADay | null | undefined => (p === 'today' ? sorted()[0] ?? null : currentAffairs.find((d) => d.date === p));

export function generateMetadata({ params }: { params: { date: string } }) {
  const d = dayOf(params.date);
  if (d === undefined) return {};
  if (!d) return meta({ title: "Today's Current Affairs MCQ", description: 'Daily current affairs MCQs with answers.', path: '/current-affairs/today/', noindex: true });
  const nice = formatDate(d.date);
  return meta({ title: `${nice} Current Affairs MCQ [Free PDF] – ${d.items.length} Questions with Answers`, description: `Current affairs of ${nice} for SSC, Railway, Banking and State exams: ${d.items.slice(0, 3).map((i) => i.fact).join(' ')}`.slice(0, 158), path: `/current-affairs/${d.date}/`, noindex: params.date === 'today' });
}

export default function CADayPage({ params }: { params: { date: string } }) {
  const d = dayOf(params.date);
  if (d === undefined) notFound();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Current Affairs', path: '/current-affairs/' }, { name: d ? formatDate(d.date) : 'Today', path: `/current-affairs/${params.date}/` }];
  if (!d) {
    return (
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className="card pad-lg section" style={{ textAlign: 'center' }}>
          <I3D name="newspaper" size={84} />
          <h1 style={{ fontSize: '1.4rem' }}>Today&apos;s current affairs set is being prepared</h1>
          <p className="muted">A new set of current affairs MCQs is published every morning. Get it on Telegram the moment it is live.</p>
          <a className="btn btn-primary" href={SITE.telegram} rel="noopener"><ITelegram /> Get it on Telegram</a>
        </div>
      </div>
    );
  }
  const K = ['A', 'B', 'C', 'D'] as const;
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <PrintBrand title={`${formatDate(d.date)} Current Affairs MCQ`} path={`/current-affairs/${d.date}/`} kind="Free PDF" meta="Daily current affairs MCQs with answers and explanations" />
      <header className="phead"><div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div>
        <span className="chip gold" style={{ marginBottom: 10 }}>{d.items.length} questions</span>
        <h1>{formatDate(d.date)} Current Affairs MCQ with answers</h1>
        <p>The day&apos;s most important news for SSC, Railway, Banking and State exams — read the fact, then test yourself.</p>
        <div className="row no-print" style={{ marginTop: 12 }}><PrintButton className="btn btn-gold" label="Download PDF" what={`the ${formatDate(d.date)} current affairs PDF`} /></div>
      </div><I3D name="newspaper" size={120} className="side-art" /></div></header>
      <ol className="stack section ca-list">
        {d.items.map((it, i) => (
          <li key={i} className="card q">
            <span className="chip">{it.topic}</span>
            <p className="ca-fact">{it.fact}{it.source && <> <a href={it.source} rel="noopener nofollow" className="tiny">Source</a></>}</p>
            <p className="q-stem"><b>Q{i + 1}.</b> {it.q}</p>
            <ul className="opts">{it.options.map((o, k) => (<li key={k}><span className={`opt${K[k] === it.answer ? ' is-correct' : ''}`}><span className="k">{K[k]}</span><span>{o}</span></span></li>))}</ul>
          </li>
        ))}
      </ol>
      <PrintEnd />
      <JsonLd data={graph(breadcrumbLd(crumbs))} />
      <p className="section"><Link href="/current-affairs/">All current affairs →</Link></p>
    </div>
  );
}
