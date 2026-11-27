import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import { SUBJECTS } from '@/lib/taxonomy';
import { subjectStats } from '@/lib/practice';
import { SITE, formatDate, chapterUrl, topicGroupUrl } from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return SUBJECTS.map((s) => ({ subject: s.slug })); }
export function generateMetadata({ params }: { params: { subject: string } }) {
  const st = subjectStats(params.subject);
  if (!st) return {};
  const s = st.subject;
  return meta({
    title: `${s.name} MCQ [Free PDF] – Chapter-wise Objective Questions with Answers`,
    description: `${s.name} MCQs for every government exam: ${s.chapters.slice(0, 5).map((c) => c.name).join(', ')} and more. Previous year questions with answers and solutions. Download free PDF.`,
    path: `/mcq/${s.slug}/`,
  });
}

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const st = subjectStats(params.subject);
  if (!st) notFound();
  const s = st.subject;
  const path = `/mcq/${s.slug}/`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Practice MCQs', path: '/mcq/' }, { name: s.name, path }];
  const live = st.chapters.filter((c) => c.count > 0);
  const faqs = [
    { q: `Are these ${s.name} MCQs from real exams?`, a: `Yes. Every question is a previous year question from a real paper; the exam and shift are shown on each question with a verified answer and solution.` },
    { q: `Can I download ${s.name} MCQs as PDF?`, a: `Yes. Open any chapter and tap Download PDF — it is free after a quick sign-in, with every solution included.` },
    { q: `Which exams ask ${s.name} questions?`, a: s.group === 'engineering' ? 'SSC JE, RRB JE, state AE/JE exams, PSU and electricity board recruitments ask these chapters.' : 'SSC, Railway, Banking, Police, Teaching and state PSC/SSB exams ask these chapters.' },
  ];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>{s.chapters.length} chapters · updated {formatDate(SITE.updated)}</span>
            <h1>{s.name} MCQ — chapter-wise objective questions</h1>
            <p>{s.blurb}. Every chapter with previous year questions, answers and solutions.</p>
            <div className="facts"><span>{st.count} solved PYQs</span><span>{live.length} chapters live</span><span>Free PDF</span></div>
          </div>
          <I3D name={s.i3d} size={120} className="side-art" />
        </div>
      </header>

      <div className="grid g3 section" style={{ marginTop: 18 }}>
        {[...st.chapters].sort((a, b) => Number(b.count > 0) - Number(a.count > 0)).map((c) => (
          <section key={c.slug} id={c.slug} className={`card chap${c.count ? ' live' : ' soon'}`} aria-labelledby={`h-${c.slug}`}>
            <div className="chap-top">
              <span className={`ic ${s.tint}`}><I3D name={c.chapter.i3d} size={40} /></span>
              <div style={{ minWidth: 0 }}>
                <h2 id={`h-${c.slug}`}>{c.count ? <Link href={chapterUrl(s.slug, c.slug)} className="stretch">{c.chapter.name}</Link> : c.chapter.name}</h2>
                <span className="tiny muted">{c.count ? `${c.count} PYQs · ${c.topics.length} topic${c.topics.length > 1 ? 's' : ''}` : 'Adding questions now'}</span>
              </div>
              {c.count > 0 && <span className="chap-go" aria-hidden="true">→</span>}
            </div>
            <div className="chap-topics">
              {c.topics.map((t) => <Link key={t.topicSlug} className="chip brand" href={topicGroupUrl(t)}>{t.topic} · {t.questions.length}</Link>)}
              {c.planned.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </section>
        ))}
      </div>

      <section className="section promo dark" style={{ padding: 24 }}>
        <div className="content"><h3>Chapter tests with All-India rank</h3><p>SRO Jeet adds timed chapter tests, full mocks and a PDF of every {s.short} chapter.</p><button type="button" className="btn btn-gold btn-sm" data-checkout="jeet-yr">Get SRO Jeet · ₹349/yr</button></div>
        <I3D name="crown" lg size={120} className="art" />
      </section>

      <section className="section card pad-lg faq" aria-labelledby="sfaq">
        <h2 id="sfaq">{s.name} MCQ FAQs</h2>
        {faqs.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>
      <JsonLd data={graph(breadcrumbLd(crumbs), itemListLd(live.map((c) => ({ name: `${c.chapter.name} MCQ`, path: chapterUrl(s.slug, c.slug) }))), faqLd(faqs))} />
    </div>
  );
}
