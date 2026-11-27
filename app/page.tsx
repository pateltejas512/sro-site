import Link from '@/components/SmartLink';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import ExamIcon from '@/components/ExamIcon';
import ActionIcon, { type ActionIconName } from '@/components/ActionIcon';
import BoardSeal from '@/components/BoardSeal';
import { BOARDS, boardExams, boardOfExam } from '@/data/boards';
import Banner from '@/components/Banner';
import LiveUpdates from '@/components/LiveUpdates';
import ContinueCard from '@/components/ContinueCard';
import { SeriesCard } from '@/components/PaperCard';
import { ICheck, ITelegram, IWhatsApp, IZap, ISearch } from '@/components/Icons';
import { exams, papers, categories, playable, papersForExam, questionsForExam, examUrl, paperUrl, getExam, SITE, totalStats, orderLangs, LANG_LABEL } from '@/lib/data';
import { getBoard } from '@/lib/wp';
import { PLANS, LAUNCH_COUPON } from '@/lib/plans';
import { meta, graph, itemListLd, faqLd } from '@/lib/seo';
import { allSubjectStats } from '@/lib/practice';

export const metadata = meta({
  title: 'SarkariResultOut – Sarkari Result 2026, Latest Govt Jobs, Admit Card, Answer Key & PYQ',
  description: 'Sarkari Result 2026: latest government jobs, results, admit cards and answer keys, plus free previous year papers, mock tests with All-India rank, chapter-wise MCQs and daily current affairs in English, Hindi and Gujarati.',
  path: '/',
});

const QUICK: { href: string; label: string; icon: ActionIconName; tint: string; app: boolean }[] = [
  { href: '/category/latest-jobs/', label: 'Latest Jobs', icon: 'jobs', tint: 'tint-sky', app: false },
  { href: '/category/result/', label: 'Result', icon: 'result', tint: 'tint-gold', app: false },
  { href: '/category/admit-card/', label: 'Admit Card', icon: 'admit', tint: 'tint-pink', app: false },
  { href: '/category/answer-key/', label: 'Answer Key', icon: 'answerkey', tint: 'tint-orange', app: false },
  { href: '/pyq/', label: 'PYQ Papers', icon: 'pyq', tint: 'tint-violet', app: true },
  { href: '/test-series/', label: 'Mock Test', icon: 'mock', tint: 'tint-teal', app: true },
  { href: '/rank-predictor/', label: 'Rank Predictor', icon: 'rank', tint: 'tint-orange', app: false },
  { href: '/current-affairs/', label: 'Current Affairs', icon: 'current', tint: 'tint-red', app: true },
];

const FAQS = [
  { q: 'What is SarkariResultOut?', a: 'SarkariResultOut (SRO) publishes the latest government job notifications, results, admit cards and answer keys, together with solved previous year papers, mock tests, chapter-wise MCQs and daily current affairs in English, Hindi and Gujarati.' },
  { q: 'Are previous year papers on SRO free?', a: 'Yes. Every previous year paper, its solutions, Practice mode and Real exam mode are free. SRO Jeet adds full mock tests, All-India rank, live tests and PDFs from ₹349 a year.' },
  { q: 'How do I get job alerts?', a: 'Join the SRO Telegram channel. New central and state notifications, results and answer keys are posted the day they are released.' },
];

export default async function Home() {
  const { board, asOf } = await getBoard();
  const live = papers.filter(playable);
  const stats = totalStats();
  const starter = live.find((p) => p.examSlug === 'rrb-je') ?? live[0];
  const best = PLANS.find((p) => p.best)!;
  const examPlan = PLANS.find((p) => p.id === 'jeet-exam')!;
  const subjectStats = allSubjectStats();
  const practice = ['electrical-engineering', 'civil-engineering', 'mechanical-engineering', 'reasoning', 'quantitative-aptitude', 'general-knowledge', 'english'].map((slug) => subjectStats.find((x) => x.subject.slug === slug)!);
  const series = exams.slice(0, 4);
  const topJob = board.jobs[0];

  return (
    <div className="wrap home">
      <h1 className="sr-only">SarkariResultOut – Sarkari Result, Latest Govt Jobs, Admit Card, Answer Key and Previous Year Papers</h1>

      {/* 1 · search + quick actions */}
      <section className="home-top" aria-label="Search and quick links">
        <form className="home-search" action="/" role="search">
          <ISearch />
          <label htmlFor="home-q" className="sr-only">Search jobs, results, papers</label>
          <input id="home-q" name="s" placeholder="Search jobs, results, admit card, PYQ…" autoComplete="off" enterKeyHint="search" />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
        <nav className="quick" aria-label="Quick links">
          {QUICK.map((q) => {
            const inner = (<><span className={`ic ${q.tint}`}><ActionIcon name={q.icon} size={36} /></span>{q.label}</>);
            return q.app ? <Link key={q.href} href={q.href} className="qk">{inner}</Link> : <a key={q.href} href={q.href} className="qk">{inner}</a>;
          })}
        </nav>
      </section>

      {/* 1b · popular exams by board */}
      <section className="section" style={{ marginTop: 16 }} aria-labelledby="pop-h">
        <div className="sec-head"><div><h2 id="pop-h">Popular exams</h2><p>Pick your board — papers, mocks and practice for every exam</p></div><Link className="more" href="/exams/">All exams →</Link></div>
        <div className="pop-boards">
          {BOARDS.filter((b) => b.popular).map((b) => (
            <Link key={b.slug} href={`/exams/${b.slug}/`} className="pb card">
              <BoardSeal board={b} size={56} />
              <b>{b.short}</b>
              <span>{boardExams(b).slice(0, 3).map((e) => e.short.replace(new RegExp(`^${b.short} `), '')).join(' · ')}</span>
            </Link>
          ))}
          <Link href="/exams/" className="pb pb-all card"><span className="pb-allic" aria-hidden="true">{BOARDS.length}</span><b>All exams</b><span>Every board &amp; post</span></Link>
        </div>
        <div className="pb-more">
          {BOARDS.filter((b) => !b.popular).map((b) => <Link key={b.slug} href={`/exams/${b.slug}/`} className="chip">{b.short === 'Police' ? 'Gujarat Police' : b.short}</Link>)}
          <a href="/request-paper/" className="chip chip-live">+ Request a paper</a>
        </div>
      </section>

      {/* 2 · banner carousel */}
      <section className="section" style={{ marginTop: 16 }} aria-label="Offers and highlights">
        <Banner count={4}>
          <div className="slide s-brand">
            <div className="s-copy">
              <span className="eyebrow"><span className="live" /> Launch offer · first 10,000 students</span>
              <h2>SRO <em>Jeet</em> at ₹{best.price}/year</h2>
              <p>Full mock tests, All-India rank, live tests and PDFs for every exam. Use <b>{LAUNCH_COUPON}</b> for ₹50 off.</p>
              <button type="button" className="btn btn-gold" data-checkout={best.id}><IZap /> Get SRO Jeet in 1 tap</button>
            </div>
            <I3D name="crown" lg size={170} className="s-art" eager />
          </div>
          {topJob && (
            <div className="slide s-sky">
              <div className="s-copy">
                <span className="eyebrow">New notification</span>
                <h2 className="clamp2">{topJob.t}</h2>
                <p>Eligibility, dates, fees, syllabus and apply link — plus free previous papers to start today.</p>
                <div className="row"><a className="btn btn-white" href={topJob.u}>View details</a><Link className="btn btn-glass" href="/pyq/">Start PYQ practice</Link></div>
              </div>
              <I3D name="news" lg={false} size={150} className="s-art" />
            </div>
          )}
          <div className="slide s-fire">
            <div className="s-copy">
              <span className="eyebrow">Every day · 7 AM</span>
              <h2>Daily Quiz — 10 PYQs, 5 minutes</h2>
              <p>Keep your streak alive, challenge friends on WhatsApp and climb the weekly All-India leaderboard.</p>
              <Link className="btn btn-white" href="/daily-quiz/">Play today&apos;s quiz</Link>
            </div>
            <I3D name="fire" lg={false} size={150} className="s-art" />
          </div>
          <div className="slide s-green">
            <div className="s-copy">
              <span className="eyebrow">Refer &amp; earn</span>
              <h2>Invite 3 friends, get 1 month of SRO Jeet free</h2>
              <p>Your friends get ₹50 off. Share your link on WhatsApp in one tap.</p>
              <Link className="btn btn-white" href="/refer/">Get my invite link</Link>
            </div>
            <I3D name="gift" lg={false} size={150} className="s-art" />
          </div>
        </Banner>
      </section>

      {/* 3 · sarkari updates */}
      <section className="section" aria-labelledby="upd-h">
        <div className="sec-head"><div><h2 id="upd-h"><I3D name="bell" size={30} /> Sarkari updates</h2><p>Jobs, results, admit cards and answer keys — posted the day they are out.</p></div><a className="more" href={SITE.telegram} rel="noopener">Get alerts →</a></div>
        <div className="upd-grid">
          <LiveUpdates initial={board} asOf={asOf} />
          <aside className="stack">
            <ContinueCard starter={{ url: paperUrl(starter), title: starter.title, exam: getExam(starter.examSlug)!.short }} />
            <div className="promo tg"><div className="content"><h3>Alerts on Telegram</h3><p>New jobs the day they are out, 7 AM quiz, answer keys.</p><a className="btn btn-white btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join channel</a></div><I3D name="bell" size={90} className="art" /></div>
          </aside>
        </div>
      </section>

      {/* 4 · popular exams */}
      <section className="section" aria-labelledby="ex-h">
        <div className="sec-head"><div><h2 id="ex-h"><I3D name="target" size={30} /> Solved papers live now</h2><p>Papers, pattern, weightage and mocks for each exam.</p></div><Link className="more" href="/pyq/">All papers →</Link></div>
        <div className="grid g3 exam-grid">
          {exams.map((e) => {
            const bd = boardOfExam(e.slug);
            const n = questionsForExam(e.slug).length;
            return (
              <Link key={e.slug} href={examUrl(e)} className="card ex">
                {bd ? <BoardSeal board={bd} size={52} /> : <span className="ic tint-gray"><ExamIcon exam={e} size={40} /></span>}
                <span style={{ minWidth: 0 }}><b>{e.short}</b>
                <span className="tiny muted">{papersForExam(e.slug).length} paper{papersForExam(e.slug).length > 1 ? 's' : ''} · {n ? `${n} Qs` : 'importing'}</span></span>
              </Link>
            );
          })}
          <a href="/request-paper/" className="card ex ex-req"><span className="ic tint-gray"><ActionIcon name="request" size={40} /></span><span><b>Request exam</b><span className="tiny muted">most asked added first</span></span></a>
        </div>
      </section>

      {/* 5 · Jeet series */}
      <section className="section" aria-labelledby="rp-h">
        <div className="sec-head"><div><h2 id="rp-h"><I3D name="crown" size={30} /> Mock test series</h2><p>Free tests from real papers, full mocks with SRO Jeet — All-India rank on every test.</p></div><Link className="more" href="/test-series/">All test series →</Link></div>
        <div className="hscroll cols-4">
          {series.map((e, i) => (
            <div key={e.slug} className="card rp-card">
              {i === 0 && <span className="ribbon hot">Popular</span>}
              <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
                <span className={`ic ${categories.find((c) => c.slug === e.category)!.tint}`}><ExamIcon exam={e} size={40} /></span>
                <div style={{ minWidth: 0 }}><h3><Link href={`/test-series/${e.slug}/`} style={{ color: 'inherit' }}>{e.short} Mock Test</Link></h3><div className="tiny muted">{e.authority}</div></div>
              </div>
              <ul className="rp-list">
                <li><ICheck size={14} /> Full mocks · real pattern</li>
                <li><ICheck size={14} /> Every PYQ with All-India rank</li>
                <li><ICheck size={14} /> {orderLangs([...new Set(papersForExam(e.slug).flatMap((p) => p.languages))]).map((l) => LANG_LABEL[l]).join(' · ')}</li>
              </ul>
              <div className="rp-foot">
                <div><b className="amt">₹{examPlan.price}</b> <s className="muted small">₹{examPlan.was}</s><div className="tiny muted">per year</div></div>
                <button type="button" className="btn btn-primary btn-sm" data-checkout={examPlan.id} data-exam={e.slug}>Buy now</button>
              </div>
            </div>
          ))}
          <div className="card rp-card rp-all">
            <span className="ribbon new">Best value</span>
            <I3D name="gem" size={54} />
            <h3>All exams · SRO Jeet</h3>
            <p className="small" style={{ margin: 0 }}>Every test series, live tests, PDFs and daily drill.</p>
            <div className="rp-foot"><div><b className="amt">₹{best.price}</b> <s className="small">₹{best.was}</s><div className="tiny">per year</div></div><button type="button" className="btn btn-gold btn-sm" data-checkout={best.id}>Get SRO Jeet</button></div>
          </div>
        </div>
      </section>

      {/* 6 · PYQ */}
      <section className="section" aria-labelledby="pyq-h">
        <div className="sec-head"><div><h2 id="pyq-h"><I3D name="pages" size={30} /> Previous year papers</h2><p>Free · {stats.questions} solved questions · real CBT mode</p></div><Link className="more" href="/pyq/">All papers →</Link></div>
        <div className="hscroll cols-3">
          {[...papers].sort((a, b) => Number(playable(b)) - Number(playable(a)) || b.year - a.year).slice(0, 6).map((p, i) => <SeriesCard key={p.slug} p={p} ribbon={i === 0 ? 'hot' : i === 1 ? 'new' : 'free'} />)}
        </div>
      </section>

      {/* 7 · free daily practice */}
      <section className="section" aria-labelledby="dp-h">
        <div className="sec-head"><div><h2 id="dp-h"><I3D name="muscle" size={30} /> Practice by subject</h2><p>Chapter-wise PYQ MCQs with answers and free PDF — 10 a day builds a streak.</p></div><Link className="more" href="/mcq/">All subjects →</Link></div>
        <div className="grid g4">
          {practice.map(({ subject: s, count, chapters }) => (
            <Link key={s.slug} href={`/mcq/${s.slug}/`} className="card tile v"><span className={`ic ${s.tint}`}><I3D name={s.i3d} size={40} /></span><b>{s.name}</b><span className="tiny muted">{chapters.slice(0, 3).map((c) => c.chapter.name.split(' & ')[0]).join(' · ')}</span><span className={`chip${count ? ' brand' : ''}`}>{count ? `${count} PYQs` : `${chapters.length} chapters`}</span></Link>
          ))}
          <Link href="/current-affairs/" className="card tile v"><span className="ic tint-orange"><I3D name="newspaper" size={40} /></span><b>Current Affairs</b><span className="tiny muted">Day-wise MCQs · monthly PDF</span><span className="chip brand">Daily</span></Link>
        </div>
      </section>

      {/* 8 · what you get */}
      <section className="section" aria-labelledby="wy-h">
        <div className="sec-head"><div><h2 id="wy-h"><I3D name="sparkles" size={30} /> What you get on SRO</h2></div></div>
        <div className="grid g3">
          {[
            ['speak', 'Your language', 'Every question in English, हिन्दी and ગુજરાતી — switch with one tap.'],
            ['stopwatch', 'Real CBT experience', 'Timer, palette, mark for review — the exam-hall screen at home.'],
            ['medal', 'All-India rank', 'See where you stand among everyone who took the same test.'],
            ['chart', 'Analysis that guides you', 'Weak chapters, time sinks and what to practise next.'],
            ['robot', 'Smart revision', 'Questions you got wrong come back until you get them right.'],
            ['phone', 'Fast on any phone', 'Opens in about 2 seconds on 4G, light on data.'],
          ].map(([i, t, d]) => (<div key={t} className="card feat"><I3D name={i} size={44} /><div><b>{t}</b><p>{d}</p></div></div>))}
        </div>
      </section>

      {/* 9 · toppers (real data only) */}
      <section className="section card pad-lg toppers" aria-labelledby="tp-h">
        <div className="row between">
          <div className="row" style={{ gap: 12 }}><I3D name="trophy" size={48} /><div><h2 id="tp-h" style={{ margin: 0 }}>Toppers of the week</h2><p className="muted small" style={{ margin: 0 }}>Top scores in this week&apos;s Daily Quiz and live tests. Names are shown only with permission.</p></div></div>
          <Link className="btn btn-primary" href="/daily-quiz/">Take today&apos;s quiz</Link>
        </div>
        <div className="tp-empty">
          {[1, 2, 3].map((n) => (<div key={n} className={`tp p${n}`}><span className="tp-rank">#{n}</span><span className="tp-av" aria-hidden="true">?</span><b>Could be you</b><span className="tiny muted">leaderboard opens with the first live test</span></div>))}
        </div>
      </section>

      {/* 10 · app + community */}
      <section className="section grid g2" aria-label="PDFs and sharing">
        <div className="promo dark">
          <div className="content">
            <span className="chip gold" style={{ marginBottom: 8 }}>Free after sign-in</span>
            <h3>Every paper as a PDF</h3>
            <p>Download any previous paper, topic or day of current affairs as a clean PDF with all solutions — revise offline.</p>
            <Link className="btn btn-gold btn-sm" href="/pyq/">Browse papers</Link>
          </div>
          <I3D name="pages" lg={false} size={120} className="art" />
        </div>
        <div className="promo wa">
          <div className="content">
            <h3>Study with friends</h3>
            <p>Share any paper or your score card on WhatsApp — friends open it directly, no app or login needed.</p>
            <a className="btn btn-white btn-sm" href={`https://wa.me/?text=${encodeURIComponent('Free govt exam PYQs, mock tests and All-India rank – ' + SITE.url + '/')}`} rel="noopener"><IWhatsApp /> Share SRO</a>
          </div>
          <I3D name="handshake" lg={false} size={110} className="art" />
        </div>
      </section>

      <section className="section card pad-lg faq" aria-labelledby="hfaq-h">
        <h2 id="hfaq-h" className="row" style={{ gap: 10 }}><I3D name="chat" size={30} /> About SarkariResultOut</h2>
        {FAQS.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>

      <JsonLd data={graph(
        { '@type': 'WebPage', '@id': `${SITE.url}/#webpage`, url: `${SITE.url}/`, name: 'SarkariResultOut', dateModified: asOf, isPartOf: { '@id': `${SITE.url}/#website` } },
        itemListLd(board.jobs.slice(0, 8).map((p) => ({ name: p.t, path: p.u }))),
        faqLd(FAQS),
      )} />
    </div>
  );
}
