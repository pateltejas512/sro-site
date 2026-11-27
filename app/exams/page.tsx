import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import BoardSeal from '@/components/BoardSeal';
import ActionIcon from '@/components/ActionIcon';
import { IArrowRight } from '@/components/Icons';
import { BOARDS, boardExams, liveCount } from '@/data/boards';
import { meta, graph, breadcrumbLd, itemListLd } from '@/lib/seo';

export const metadata = meta({
  title: 'All Government Exams – RRB, SSC, Banking, GSSSB, GPSC Previous Year Papers',
  description: 'Every government exam in one place — RRB JE, NTPC, Group D, SSC CGL, CHSL, IBPS, SBI, GSSSB CCE, GPSC, GPSSB Talati and more. Solved previous year papers, mock tests and practice MCQs.',
  path: '/exams/',
});

export default function ExamsHub() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'All Exams', path: '/exams/' }];
  const central = BOARDS.filter((b) => b.scope === 'Central');
  const gujarat = BOARDS.filter((b) => b.scope === 'Gujarat');
  const total = BOARDS.reduce((n, b) => n + boardExams(b).length, 0);
  const Grid = ({ list }: { list: typeof BOARDS }) => (
    <div className="board-grid">
      {list.map((b) => (
        <Link key={b.slug} href={`/exams/${b.slug}/`} className="board-card card">
          <BoardSeal board={b} size={58} />
          <div className="bc-body">
            <h3>{b.short === 'Banking' || b.short === 'Police' || b.short === 'Teaching' ? b.name : `${b.short} Exams`}</h3>
            <p>{b.blurb}</p>
            <div className="bc-chips">
              {boardExams(b).slice(0, 4).map((e) => <span key={e.short} className={`chip${e.exam ? ' chip-live' : ''}`}>{e.short}</span>)}
              {boardExams(b).length > 4 && <span className="chip">+{boardExams(b).length - 4}</span>}
            </div>
          </div>
          <span className="bc-meta">{liveCount(b) ? <b>{liveCount(b)} with papers</b> : <span>Papers coming</span>}<IArrowRight /></span>
        </Link>
      ))}
    </div>
  );
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="page-head">
        <h1>All Government Exams</h1>
        <p className="lead">{BOARDS.length} recruitment boards · {total} exams. Pick your exam to get solved previous year papers, mock tests and chapter-wise practice. Exam not live yet? Send us the paper and we publish it with full solutions.</p>
      </header>
      <section className="section" aria-labelledby="central-h"><h2 id="central-h" className="sec-h">Central government exams</h2><Grid list={central} /></section>
      <section className="section" aria-labelledby="guj-h"><h2 id="guj-h" className="sec-h">Gujarat state exams</h2><Grid list={gujarat} /></section>
      <section className="section">
        <Link href="/request-paper/" className="card req-band">
          <span className="ic tint-gray"><ActionIcon name="request" size={40} /></span>
          <div><h2>Don&rsquo;t see your exam or paper?</h2><p>Request it — upload the PDF or photos if you have them. Our editors solve every question and notify you when it is live.</p></div>
          <span className="btn btn-primary btn-sm">Request a paper <IArrowRight /></span>
        </Link>
      </section>
      <JsonLd data={graph(breadcrumbLd(crumbs), itemListLd(BOARDS.map((b) => ({ name: b.name, path: `/exams/${b.slug}/` }))))} />
    </div>
  );
}
