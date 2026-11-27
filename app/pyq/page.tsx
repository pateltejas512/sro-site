import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SeriesCard } from '@/components/PaperCard';
import HubSearch from '@/components/HubSearch';
import ContinueCard from '@/components/ContinueCard';
import I3D from '@/components/I3D';
import ExamIcon from '@/components/ExamIcon';
import { ICheck, IArrowRight, ITelegram } from '@/components/Icons';
import {
  exams, papers, categories, papersForExam, questionsForExam, topicGroups, playable, totalStats,
  examUrl, paperUrl, topicUrl, questionUrl, seoText, truncate, SITE, formatDate, allQuestions, getExam, LANGS, LIVE_LANGS,
} from '@/lib/data';
import { meta, graph, breadcrumbLd, itemListLd } from '@/lib/seo';

export const metadata = meta({
  title: 'Previous Year Question Papers with Solutions [PDF] – All Govt Exams',
  description: 'Solved previous year question papers for RRB JE, SSC, State and Engineering exams — shift-wise, in English, Hindi and Gujarati, with verified answers, real CBT practice and free PDF.',
  path: '/pyq/',
});


export default function PyqHub() {
  const stats = totalStats();
  const live = papers.filter(playable);
  const latest = [...papers].sort((a, b) => Number(playable(b)) - Number(playable(a)) || b.year - a.year);
  const topics = topicGroups();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Previous Year Papers', path: '/pyq/' }];
  const starter = live.find((p) => p.examSlug === 'gsssb-cce') ?? live[0];

  const practice = [
    { name: 'Number Series', i3d: 'numbers', tint: 'tint-violet', g: topics.find((t) => t.topicSlug === 'number-series') },
    { name: 'Blood Relations', i3d: 'handshake', tint: 'tint-pink', g: topics.find((t) => t.topicSlug === 'blood-relations') },
    { name: 'Induction Motors', i3d: 'gear', tint: 'tint-teal', g: topics.find((t) => t.topicSlug === 'induction-motors') },
    { name: 'AC Circuits', i3d: 'bolt', tint: 'tint-gold', g: topics.find((t) => t.topicSlug === 'ac-circuits') },
    { name: 'Measurement', i3d: 'stopwatch', tint: 'tint-sky', g: topics.find((t) => t.topicSlug === 'analog-instruments') },
    { name: 'Current Affairs', i3d: 'news', tint: 'tint-orange' },
    { name: 'General Knowledge', i3d: 'globe', tint: 'tint-green' },
    { name: 'Maths', i3d: 'abacus', tint: 'tint-red' },
  ];

  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />

      <section className="hero" aria-labelledby="hub-h1">
        <div className="hero-in">
          <div>
            <span className="eyebrow"><span className="live" /> Updated {formatDate(SITE.updated)}<span className="long"> · new shifts weekly</span></span>
            <h1 id="hub-h1">Previous Year Papers <em>with Solutions</em></h1>
            <p className="lead">Real GSSSB, GPSC, RRB and GUVNL papers — practise free with instant answers, or attempt the full paper like the real CBT and see where you stand.</p>
            <ul className="checks">
              <li><ICheck /> Real exam pattern &amp; timer</li>
              <li><ICheck /> Answers verified by editors</li>
              <li><ICheck /> English · हिन्दी · ગુજરાતી</li>
              <li><ICheck /> Free, no login to practise</li>
            </ul>
            <HubSearch tags={[{ label: 'GSSSB CCE 2024', q: 'CCE' }, { label: 'RRB JE Electrical', q: 'RRB JE' }, { label: 'Number series', q: 'number series' }, { label: 'Induction motor', q: 'induction' }]} />
            <div className="hero-stats">
              <div><I3D name="memo" size={34} eager /><span><b className="nums">{stats.questions}</b><span>solved questions live</span></span></div>
              <div><I3D name="books" size={34} eager /><span><b className="nums">{stats.papersInDb}</b><span>papers in library</span></span></div>
              <div><I3D name="target" size={34} eager /><span><b className="nums">{stats.exams}</b><span>exams covered</span></span></div>
              <div><I3D name="globe" size={34} eager /><span><b className="nums">{LIVE_LANGS.length} + {LANGS.length - LIVE_LANGS.length}</b><span>languages live + ready</span></span></div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <span className="halo" />
            <I3D name="trophy" lg size={210} eager className="trophy" />
            <div className="float-card fc-1"><I3D name="medal" size={36} eager /><div><b>Shift-wise rank</b><span>after every full paper</span></div></div>
            <div className="float-card fc-3"><I3D name="fire" size={36} eager /><div><b>Daily streak</b><span>practise a little every day</span></div></div>
            <div className="float-card fc-2"><I3D name="check" size={36} eager /><div><b>Instant answers</b><span>with formula &amp; exam tip</span></div></div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Exam categories">
        <div className="cat-row">
          {categories.map((c) => {
            const n = exams.filter((e) => e.category === c.slug).length;
            return (
              <a key={c.slug} href={n ? `#${c.slug}` : '#request'} className="cat">
                <span className={`ic ${c.tint}`}><I3D name={c.i3d} size={34} /></span>
                {c.name}
                <span className="tiny muted" style={{ fontWeight: 600 }}>{n ? `${n} exam${n > 1 ? 's' : ''}` : 'Soon'}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ marginTop: 18 }} aria-label="Your progress">
        <ContinueCard starter={{ url: paperUrl(starter), title: starter.title, exam: getExam(starter.examSlug)!.short }} />
      </section>

      <section className="section" aria-labelledby="latest-h">
        <div className="sec-head">
          <div><h2 id="latest-h"><I3D name="pages" size={30} /> Latest papers</h2><p>Free · practise with instant answers or attempt in Real exam mode</p></div>
        </div>
        <div className="hscroll cols-3">
          {latest.map((p, i) => <SeriesCard key={p.slug} p={p} ribbon={i === 0 ? 'hot' : i === 1 ? 'new' : 'free'} />)}
        </div>
      </section>

      <section className="section" aria-labelledby="exams-h">
        <div className="sec-head"><div><h2 id="exams-h"><I3D name="award" size={30} /> Popular exams</h2><p>Every exam page has shift-wise papers, topic weightage and the exam pattern.</p></div></div>
        <div className="grid g3">
          {exams.map((e) => {
            const c = categories.find((x) => x.slug === e.category)!;
            const ps = papersForExam(e.slug);
            const qn = questionsForExam(e.slug).length;
            return (
              <Link key={e.slug} id={e.category} href={examUrl(e)} className="card tile" style={{ scrollMarginTop: 90 }}>
                <span className={`ic ${c.tint}`}><ExamIcon exam={e} size={38} /></span>
                <span style={{ minWidth: 0 }} className="grow">
                  <span className="tiny muted" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block' }}>{c.name}</span>
                  <b>{e.short}</b>
                  <span className="muted">{ps.length} paper{ps.length > 1 ? 's' : ''}{qn ? ` · ${qn} solved Qs` : ' · importing'}</span>
                </span>
                <IArrowRight />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" aria-labelledby="prac-h">
        <div className="sec-head"><div><h2 id="prac-h"><I3D name="muscle" size={30} /> Practise by topic</h2><p>Every PYQ on one topic across all exams — the fastest way to fix a weak area.</p></div><Link href="/mcq/" className="more">All topics →</Link></div>
        <div className="grid g4">
          {practice.map((t) => t.g ? (
            <Link key={t.name} href={topicUrl(t.g.questions[0])} className="card tile v">
              <span className={`ic ${t.tint}`}><I3D name={t.i3d} size={38} /></span>
              <b>{t.name}</b>
              <span className="chip brand">{t.g.questions.length} PYQs</span>
            </Link>
          ) : (
            <div key={t.name} className="card tile v" style={{ opacity: 0.75 }}>
              <span className={`ic ${t.tint}`}><I3D name={t.i3d} size={38} /></span>
              <b>{t.name}</b>
              <span className="chip">Coming soon</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section grid g2" aria-label="Why SRO">
        <div className="promo dark" style={{ padding: 24 }}>
          <div className="content" style={{ maxWidth: '68%' }}>
            <span className="chip gold" style={{ marginBottom: 10 }}>SRO Jeet · launch price</span>
            <h3 style={{ fontSize: '1.4rem' }}>Know your rank before the result does</h3>
            <p>All-India rank and percentile on every paper, full mock series for every exam, live tests, PDFs and a daily drill built from your mistakes.</p>
            <div className="row" style={{ marginBottom: 12 }}><b style={{ fontSize: '2rem', color: '#fff' }}>₹349</b><s style={{ color: 'var(--on-dark-2)' }}>₹499</s><span className="chip good">per year · every exam</span></div>
            <button type="button" className="btn btn-gold" data-checkout="jeet-yr">Get SRO Jeet in 1 tap</button>
          </div>
          <I3D name="crown" lg size={150} className="art" />
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
          {[
            { i: 'stopwatch', t: 'Real CBT interface', d: 'Timer, palette, mark for review — like TCS iON.' },
            { i: 'chart', t: 'Deep analysis', d: 'Chapter accuracy, time per question, strengths.' },
            { i: 'medal', t: 'All-India rank', d: 'Your rank among everyone who took the same paper.' },
            { i: 'speak', t: '3 languages', d: 'Switch English, हिन्दी, ગુજરાતી on any question.' },
            { i: 'bookmark', t: 'Save & revise', d: 'Bookmark tough questions, revise later.' },
            { i: 'fire', t: 'Daily streak', d: 'Small daily practice that compounds.' },
          ].map((f) => (
            <div key={f.t} className="card feat"><I3D name={f.i} size={40} /><div><b>{f.t}</b><p>{f.d}</p></div></div>
          ))}
        </div>
      </section>

      <section className="section grid g2" aria-label="Offers">
        <div className="promo">
          <div className="content">
            <span className="chip gold" style={{ marginBottom: 8 }}>Refer &amp; earn</span>
            <h3>Invite 3 friends, get 1 month of SRO Jeet free</h3>
            <p>Share your link on WhatsApp. When 3 friends sign up, SRO Jeet unlocks for you — and they get ₹50 off.</p>
            <Link className="btn btn-white btn-sm" href="/refer/">Get my link</Link>
          </div>
          <I3D name="gem" lg size={120} className="art" />
        </div>
        <div className="promo tg">
          <div className="content">
            <h3>Join SRO on Telegram</h3>
            <p>New shifts the day they are added, 7 AM daily PYQ quiz, answer-key and rank predictor alerts.</p>
            <a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join channel</a>
          </div>
          <I3D name="bell" lg={false} size={110} className="art" />
        </div>
      </section>

      <section id="request" className="section card pad-lg row between" style={{ scrollMarginTop: 90 }}>
        <div className="row" style={{ gap: 14 }}><I3D name="inbox" size={48} /><div><h2 style={{ margin: 0 }}>Your exam not here yet?</h2><p className="muted small" style={{ margin: 0 }}>Tell us the exam and shift — the most requested papers are added first.</p></div></div>
        <a className="btn btn-primary" href={SITE.telegram} rel="noopener">Request a paper</a>
      </section>

      <JsonLd data={graph(
        breadcrumbLd(crumbs),
        { '@type': 'CollectionPage', name: 'Previous Year Question Papers with Solutions', url: `${SITE.url}/pyq/`, dateModified: SITE.updated },
        itemListLd(exams.map((e) => ({ name: `${e.short} previous year papers`, path: examUrl(e) }))),
      )} />
    </div>
  );
}
