import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import RequestPaper from '@/components/RequestPaper';
import { BOARDS, boardExams } from '@/data/boards';
import { meta, graph, breadcrumbLd } from '@/lib/seo';

export const metadata = meta({
  title: 'Request a Previous Year Paper – Upload & Get Full Solutions Free',
  description: 'Exam or paper missing on SarkariResultOut? Request it or upload the question paper PDF/photos — SRO editors solve every question and publish it free with answers in English, Hindi and Gujarati.',
  path: '/request-paper/',
});

export default function RequestPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'All Exams', path: '/exams/' }, { name: 'Request a paper', path: '/request-paper/' }];
  const opts = BOARDS.map((b) => ({ slug: b.slug, short: b.short === 'Police' ? 'Gujarat Police' : b.short, exams: boardExams(b).map((e) => e.short) }));
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="page-head">
        <h1>Request a paper</h1>
        <p className="lead">Tell us which exam paper you need. Have the question paper? Upload it — our editors solve every question, check it against the official answer key and publish it free.</p>
      </header>
      <div className="rq">
        <RequestPaper boards={opts} />
        <aside className="rq-side card">
          <h2 className="sec-h">What happens next</h2>
          <ol>
            <li><b>We review</b> your request — the most-requested exams are published first.</li>
            <li><b>Editors solve</b> each question with a short explanation, and match it with the official key.</li>
            <li><b>It goes live</b> with free practice, real-exam mode and rank — you get a message if you left your number or email.</li>
          </ol>
          <p className="tiny muted" style={{ marginTop: 12 }}>Please upload only papers you are allowed to share (your own copy or a public paper). We never show your contact details.</p>
        </aside>
      </div>
      <JsonLd data={graph(breadcrumbLd(crumbs))} />
    </div>
  );
}
