import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import { IArrowRight } from '@/components/Icons';
import { GROUPS } from '@/lib/taxonomy';
import { allSubjectStats } from '@/lib/practice';
import { meta, graph, breadcrumbLd, itemListLd } from '@/lib/seo';

export const metadata = meta({
  title: 'MCQ Questions with Answers [Free PDF] – Engineering, Reasoning, Maths, GK',
  description: 'Chapter-wise objective questions with answers for every government exam: Electrical, Civil and Mechanical Engineering, Reasoning, Quantitative Aptitude, GK, Science, English and daily Current Affairs. Free PDF.',
  path: '/mcq/',
});

export default function McqIndex() {
  const stats = allSubjectStats();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Practice MCQs', path: '/mcq/' }];
  const total = stats.reduce((a, s) => a + s.count, 0);
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{stats.length} subjects · {stats.reduce((a, s) => a + s.subject.chapters.length, 0)} chapters</span>
            <h1>Practice MCQs with answers — every subject, chapter-wise</h1>
            <p>Real previous year questions sorted into subjects and chapters. Solve, check instantly, read the solution, download the PDF.</p>
            <div className="facts"><span>{total} solved PYQs live</span><span>English · हिन्दी · ગુજરાતી</span><span>Free</span></div>
          </div>
          <I3D name="books" size={120} className="side-art" />
        </div>
      </header>

      <Link href="/current-affairs/" className="card ca-banner section">
        <span className="ic tint-orange"><I3D name="newspaper" size={44} /></span>
        <span className="grow" style={{ minWidth: 0 }}><b>Current Affairs — day-wise</b><span className="muted small">Today&apos;s current affairs MCQs, a new set every day, with a monthly PDF.</span></span>
        <IArrowRight />
      </Link>

      {GROUPS.map((g) => (
        <section key={g.id} className="section" aria-labelledby={`g-${g.id}`}>
          <div className="sec-head"><div><h2 id={`g-${g.id}`}>{g.name}</h2><p>{g.blurb}</p></div></div>
          <div className="grid g3">
            {stats.filter((s) => s.subject.group === g.id).map(({ subject: s, count, chapters }) => (
              <Link key={s.slug} href={`/mcq/${s.slug}/`} className="card subj">
                <span className={`ic ${s.tint}`}><I3D name={s.i3d} size={46} /></span>
                <span className="grow" style={{ minWidth: 0 }}>
                  <b>{s.name}</b>
                  <span className="muted small">{s.blurb}</span>
                  <span className="subj-meta"><span className="chip">{chapters.length} chapters</span>{count ? <span className="chip brand">{count} PYQs</span> : <span className="chip">Adding now</span>}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <JsonLd data={graph(breadcrumbLd(crumbs), itemListLd(stats.map((s) => ({ name: `${s.subject.name} MCQ`, path: `/mcq/${s.subject.slug}/` }))))} />
    </div>
  );
}
