import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import DailyQuiz from '@/components/DailyQuiz';
import { ITelegram } from '@/components/Icons';
import { SITE } from '@/lib/data';
import { meta, graph, breadcrumbLd, faqLd } from '@/lib/seo';

export const metadata = meta({
  title: 'Daily Quiz for Govt Exams – 10 PYQs Every Day (Free)',
  description: 'Free daily quiz of 10 real previous year questions from RRB, SSC, State and Engineering exams in English, Hindi and Gujarati. 5 minutes a day, keep your streak, challenge friends on WhatsApp.',
  path: '/daily-quiz/',
});

const FAQS = [
  { q: 'When does the new daily quiz open?', a: 'A new set of 10 questions opens every day at midnight; the Telegram reminder goes out at 7 AM. Every student plays the same questions on the same day.' },
  { q: 'Are the questions from real exams?', a: 'Yes. Each question comes from a previous year paper on SarkariResultOut, with the verified answer and a link to the full solution.' },
  { q: 'Is the daily quiz free?', a: 'Yes, always. SRO Jeet members also see their All-India rank for the day.' },
];

export default function DailyQuizPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Daily Quiz', path: '/daily-quiz/' }];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>New every day · free</span>
            <h1>SRO Daily Quiz — 10 PYQs in 5 minutes</h1>
            <p>Real RRB, SSC, State and Engineering questions in English, हिन्दी and ગુજરાતી. Keep your streak and challenge your friends.</p>
          </div>
          <I3D name="fire" lg={false} size={120} className="side-art" eager />
        </div>
      </header>
      <div className="layout" style={{ marginTop: 18 }}>
        <div><DailyQuiz /></div>
        <aside className="aside">
          <div className="promo tg"><div className="content"><h3>7 AM quiz reminder</h3><p>Get the quiz link on Telegram every morning.</p><a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join</a></div><I3D name="bell" size={90} className="art" /></div>
          <div className="card pad faq">
            <h2 style={{ fontSize: '1.05rem' }}>Daily Quiz FAQs</h2>
            {FAQS.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
          </div>
        </aside>
      </div>
      <JsonLd data={graph(breadcrumbLd(crumbs), faqLd(FAQS))} />
    </div>
  );
}
