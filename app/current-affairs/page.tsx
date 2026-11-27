import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import { ITelegram, IArrowRight } from '@/components/Icons';
import { currentAffairs } from '@/data/current-affairs';
import { SITE, formatDate } from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';

export const metadata = meta({
  title: 'Current Affairs Today – Daily Current Affairs MCQ Quiz with Free PDF',
  description: 'Daily current affairs MCQs with answers for SSC, Railway, Banking, Police and State exams. A new set every morning, day-wise archive and monthly PDF.',
  path: '/current-affairs/',
});

const FAQS = [
  { q: 'When is the daily current affairs set published?', a: 'Every morning. The Telegram channel posts the link as soon as the set is live.' },
  { q: 'Can I download current affairs as PDF?', a: 'Yes. Every day page has a free PDF download after a quick sign-in; SRO Jeet members also get the monthly compilation.' },
  { q: 'Which exams is this useful for?', a: 'SSC, Railway, Banking, Police, Teaching and every State exam with a General Awareness section.' },
];

export default function CAHub() {
  const days = [...currentAffairs].sort((a, b) => b.date.localeCompare(a.date));
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))];
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Current Affairs', path: '/current-affairs/' }];
  const monthName = (m: string) => new Date(m + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead"><div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div>
        <span className="chip gold" style={{ marginBottom: 10 }}>New set every morning</span>
        <h1>Current Affairs — day-wise MCQs with answers</h1>
        <p>The day&apos;s important national, international, economy, sports and awards news as exam questions. Read, solve, download the PDF.</p>
        <div className="row" style={{ marginTop: 12 }}><Link className="btn btn-gold" href="/current-affairs/today/">Today&apos;s current affairs</Link><a className="btn btn-glass" href={SITE.telegram} rel="noopener"><ITelegram /> Daily on Telegram</a></div>
      </div><I3D name="newspaper" size={120} className="side-art" /></div></header>

      {days.length === 0 ? (
        <section className="section card pad-lg ca-empty">
          <I3D name="calendar2" size={64} />
          <div><h2 style={{ margin: 0 }}>The day-wise archive starts with the first daily set</h2><p className="muted" style={{ margin: '4px 0 0' }}>Each day gets its own page with 10–15 MCQs, the fact behind each answer and a free PDF. Join Telegram to get the first set.</p></div>
        </section>
      ) : months.map((m) => (
        <section key={m} className="section">
          <div className="sec-head"><h2>{monthName(m)}</h2></div>
          <div className="grid g4">
            {days.filter((d) => d.date.startsWith(m)).map((d) => (
              <Link key={d.date} href={`/current-affairs/${d.date}/`} className="card tile">
                <span className="ic tint-orange"><I3D name="calendar2" size={34} /></span>
                <span className="grow"><b>{formatDate(d.date)}</b><span className="muted small">{d.items.length} MCQs</span></span><IArrowRight />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="section card pad-lg faq"><h2>Current affairs FAQs</h2>{FAQS.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}</section>
      <JsonLd data={graph(breadcrumbLd(crumbs), faqLd(FAQS), ...(days.length ? [itemListLd(days.slice(0, 30).map((d) => ({ name: `${formatDate(d.date)} current affairs`, path: `/current-affairs/${d.date}/` })))] : []))} />
    </div>
  );
}
