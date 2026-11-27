import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import ExamCover from '@/components/ExamCover';
import { IArrowRight } from '@/components/Icons';
import { exams, categories, papersForExam, playable, SITE, formatDate, mocksForExam } from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd } from '@/lib/seo';

const YEAR = Number(SITE.updated.slice(0, 4));
export const metadata = meta({
  title: `Online Test Series ${YEAR} – Free Mock Tests for Govt Exams with All-India Rank`,
  description: `Free mock tests and full test series for SSC, Railway, Engineering JE/AE and State exams. Real exam interface, instant result, All-India rank and detailed analysis. Updated ${formatDate(SITE.updated)}.`,
  path: '/test-series/',
});

export default function TestSeriesHub() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Test Series', path: '/test-series/' }];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead"><div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div>
        <span className="chip gold" style={{ marginBottom: 10 }}>Updated {formatDate(SITE.updated)}</span>
        <h1>Online test series {YEAR} — free mock tests with All-India rank</h1>
        <p>Every exam&apos;s previous papers as free full tests, plus SRO Jeet full mocks, chapter tests and live tests in the real exam interface.</p>
      </div><I3D name="stopwatch" size={120} className="side-art" /></div></header>
      {categories.filter((c) => exams.some((e) => e.category === c.slug)).map((c) => (
        <section key={c.slug} className="section">
          <div className="sec-head"><h2><I3D name={c.i3d} size={28} /> {c.name} mock tests</h2></div>
          <div className="grid g3">
            {exams.filter((e) => e.category === c.slug).map((e) => {
              const free = papersForExam(e.slug).filter(playable).length;
              const m = mocksForExam(e.slug).length;
              return (
                <Link key={e.slug} href={`/test-series/${e.slug}/`} className="card ts-card">
                  <ExamCover exam={e} tag="TEST" />
                  <span className="grow" style={{ minWidth: 0 }}><b>{e.short} Mock Test {YEAR}</b><span className="muted small">{m ? `${m} mock test${m === 1 ? '' : 's'} · ` : ''}{free} free PYQ test{free === 1 ? '' : 's'}</span></span>
                  <IArrowRight />
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <JsonLd data={graph(breadcrumbLd(crumbs), itemListLd(exams.map((e) => ({ name: `${e.short} Mock Test ${YEAR}`, path: `/test-series/${e.slug}/` }))))} />
    </div>
  );
}
