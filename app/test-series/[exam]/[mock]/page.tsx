import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import ExamCover from '@/components/ExamCover';
import MockQuestion from '@/components/MockQuestion';
import Practice from '@/components/Practice';
import { IPlay, ICheck, IClock, IList, IGlobe, IAward, ILock } from '@/components/Icons';
import { mocks, getExam, getMock, mocksForExam, questionsForMock, mockUrl, mockSize, papersForExam, playable, paperUrl, examUrl, LANG_LABEL, LANG_SHORT, orderLangs, SITE, formatDate, plain, truncate } from '@/lib/data';
import { planById } from '@/lib/plans';
import { meta, graph, breadcrumbLd, faqLd, itemListLd, abs } from '@/lib/seo';
import type { Paper, Question } from '@/lib/types';
import { coverOf } from '@/lib/covers';

const YEAR = Number(SITE.updated.slice(0, 4));
const KEYS = ['A', 'B', 'C', 'D'] as const;
export const dynamicParams = false;
// A static export needs at least one path: before the first mock is published this renders a 404 at /test-series/_/_/.
export function generateStaticParams() { return mocks.length ? mocks.map((p) => ({ exam: p.examSlug, mock: p.slug })) : [{ exam: '_', mock: '_' }]; }

// "GSSSB CCE Mock Test 2" → "GSSSB CCE Mock Test 2 (2026)" (a bare "2 2026" reads like one number)
const withYear = (t: string) => (/\b20\d\d\b/.test(t) ? t : /\d\)?$/.test(t.trim()) ? `${t} (${YEAR})` : `${t} ${YEAR}`);
const negLabel = (n?: number) => (!n ? 'No negative marking' : `−${Math.abs(n - 1 / 3) < 1e-6 ? '1/3' : n} per wrong answer`);
const facts = (p: Paper) => {
  const total = mockSize(p);
  return { total, minutes: p.minutes ?? total, marks: p.marks ?? total, langs: orderLangs(p.languages) };
};

export function generateMetadata({ params }: { params: { exam: string; mock: string } }) {
  const p = getMock(params.exam, params.mock);
  if (!p) return {};
  const e = getExam(p.examSlug)!;
  const f = facts(p);
  const title = p.seoTitle || `${withYear(p.title)} – ${p.premium ? 'Online Test with Rank' : 'Free Online Test'} & Solutions`;
  const description = p.seoDescription || truncate(`Attempt ${p.title} online${p.premium ? '' : ' free'}: ${f.total} questions, ${f.minutes} minutes, ${negLabel(p.negative).toLowerCase()}, latest ${e.short} pattern. Instant result, All-India rank and solutions in ${f.langs.map((l) => LANG_LABEL[l]).join(' & ')}.`, 158);
  return meta({ title, description, path: mockUrl(p), image: coverOf(p) });
}

/** Mock sample questions as schema.org Quiz (they have no page of their own, so no per-question URL). */
function mockQuizLd(p: Paper, qs: Question[], path: string) {
  return {
    '@type': 'Quiz',
    name: p.title,
    url: abs(path),
    inLanguage: orderLangs(p.languages)[0] ?? 'en',
    educationalLevel: 'Competitive exam',
    timeRequired: `PT${p.minutes ?? mockSize(p)}M`,
    isAccessibleForFree: !p.premium,
    publisher: { '@id': `${SITE.url}/#org` },
    hasPart: qs.slice(0, 10).map((q) => {
      const t = q.text.en ?? q.text[q.primaryLang]!;
      const c = KEYS.indexOf(q.answer);
      return {
        '@type': 'Question', eduQuestionType: 'Multiple choice', learningResourceType: 'Practice problem',
        name: truncate(plain(t.stem), 110), text: plain(t.stem),
        suggestedAnswer: t.options.map((o, i) => ({ '@type': 'Answer', position: i, text: plain(o) })).filter((_, i) => i !== c),
        acceptedAnswer: { '@type': 'Answer', position: c, text: plain(t.options[c]), ...(t.quick ? { answerExplanation: { '@type': 'Comment', text: truncate(plain(t.quick), 500) } } : {}) },
      };
    }),
  };
}

export default function MockPage({ params }: { params: { exam: string; mock: string } }) {
  const p = getMock(params.exam, params.mock);
  if (!p) notFound();
  const e = getExam(p.examSlug)!;
  const path = mockUrl(p);
  const qs = questionsForMock(p);
  // Premium: a short taste (answer it, see right/wrong — the solution, the other questions and the rank are the product).
  // Free: 10 full questions with solutions (the free tests are the funnel and the SEO content).
  const sample = p.premium ? qs : qs.slice(0, 10); // premium: only the free questions Studio exports (usually none)
  const f = facts(p);
  const price = planById('jeet-exam')?.price ?? 149;
  const others = mocksForExam(e.slug).filter((x) => x.slug !== p.slug);
  const pyqs = papersForExam(e.slug).filter(playable);
  const sections = p.sections?.length ? p.sections : [...new Set(qs.map((q) => q.subject))].map((name) => ({ name, n: qs.filter((q) => q.subject === name).length }));
  const langNames = f.langs.map((l) => LANG_LABEL[l]).join(', ');
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Test Series', path: '/test-series/' }, { name: `${e.short} Mock Test`, path: `/test-series/${e.slug}/` }, { name: p.shortTitle || p.title, path }];
  const start = `${path}test/`;
  const cover = coverOf(p);
  const examMocks = mocksForExam(e.slug);
  const jeetMocks = examMocks.filter((m) => m.premium).length;
  const freeMock = p.premium ? examMocks.find((m) => !m.premium) : undefined;
  const freePyq = pyqs[0];
  const perTest = jeetMocks > 1 ? Math.ceil(price / jeetMocks) : 0;
  const buyAttrs = { 'data-direct': '1', 'data-checkout': 'mock', 'data-paper': `${p.examSlug}/${p.slug}`, 'data-price': String(p.price ?? 0), 'data-title': p.title, 'data-exam': e.slug, 'data-exam-short': e.short };
  const points = p.highlights?.length ? p.highlights : [
    `${f.total} questions in the latest ${e.short} pattern`,
    'Real exam screen: timer, palette, mark for review',
    'All-India rank, percentile and topper comparison',
    'Solution for every question + section-wise analysis',
    `${f.langs.map((l) => LANG_LABEL[l]).join(' + ')} — switch any time`,
  ];

  const faqs = [
    p.premium
      ? { q: `Is ${p.title} free?`, a: `No. ${p.title} is a premium test${p.price ? ` (₹${p.price} for this test, or ₹${price} a year for every ${e.short} test)` : ` in SRO Jeet Exam (₹${price} a year for every ${e.short} test)`}, with no auto-renewal. ${freeMock ? `To try the exam screen first, attempt the free ${freeMock.title}` : `To try the exam screen first, attempt a free ${e.short} previous year paper`} — no payment needed.` }
      : { q: `Is ${p.title} free?`, a: `Yes. ${p.title} is completely free: all ${f.total} questions, the timer, instant result, solutions and your All-India rank after you sign in.` },
    ...(p.premium ? [{ q: 'Is there a refund after buying?', a: 'No. Test purchases are final and non-refundable. Each test unlocks instantly on your account and stays open for one year.' }] : []),
    { q: `How many questions are in ${p.title} and how much time is given?`, a: `${f.total} multiple-choice questions for ${f.marks} marks in ${f.minutes} minutes, with ${negLabel(p.negative).toLowerCase()}, following the latest ${e.short} pattern.` },
    { q: `In which languages can I attempt ${p.title}?`, a: `${langNames}. You can switch the language of any question during the test.` },
    { q: `Will I get my rank and solutions?`, a: 'Yes. Your first attempt is scored on our server and ranked among every student who took this test, with percentile, section-wise analysis and the solution of every question.' },
    { q: `Can I attempt ${p.title} on mobile?`, a: 'Yes. It runs in the browser on any phone, tablet or computer with the same palette, mark-for-review and timer as the real computer-based test. Your progress is saved if the tab closes.' },
    { q: `Which syllabus does ${p.title} cover?`, a: sections.length ? `${sections.map((s) => `${s.name} (${s.n} question${s.n === 1 ? '' : 's'})`).join(', ')} — mirroring the subject weightage of the real ${e.short} exam.` : `The complete ${e.short} syllabus in the official pattern.` },
  ];

  return (
    <div className="wrap has-buybar">
      <Breadcrumbs items={crumbs} />
      <header className="mock-hero">
        <div className="mh-media">
          {cover
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={cover} width={1200} height={675} alt={`${p.title} – ${f.total} questions, ${f.minutes} minutes`} fetchPriority="high" decoding="async" />
            : <div className="mh-fallback"><ExamCover exam={e} tag="MOCK" sub={String(YEAR)} /></div>}
          {p.gallery?.length ? (
            <div className="mh-gallery">{p.gallery.slice(0, 4).map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <a key={g} href={g} target="_blank" rel="noopener"><img src={g} alt={`${p.title} preview`} loading="lazy" decoding="async" /></a>))}</div>
          ) : null}
        </div>
        <div className="mh-info">
          <div className="row" style={{ gap: 6, marginBottom: 8 }}>
            <span className={`chip ${p.premium ? 'gold' : 'good'}`}>{p.premium ? 'SRO Jeet test' : '100% free'}</span>
            <span className="chip">{e.short}</span>
            <span className="chip">Updated {formatDate(SITE.updated)}</span>
          </div>
          <h1>{withYear(p.title)} — {p.premium ? 'online test' : 'free online test'} with solutions</h1>
          <div className="facts mh-facts">
            <span><IList /> {f.total} questions · {f.marks} marks</span>
            <span><IClock /> {f.minutes} min</span>
            <span><IAward /> {negLabel(p.negative)}</span>
            <span><IGlobe /> {f.langs.map((l) => LANG_SHORT[l]).join(' · ')}</span>
          </div>
          {(p.legacyAttempts ?? 0) >= 20 ? <p className="mh-proof"><I3D name="medal" size={20} /> <span><b>{(p.legacyAttempts ?? 0).toLocaleString('en-IN')}+ students</b> have already attempted this test</span></p> : null}
          <ul className="mh-points">{points.map((x) => <li key={x}><ICheck size={15} /> {x}</li>)}</ul>

          {p.premium ? (
            <div className="buybox" data-own={`mock:${p.examSlug}/${p.slug}`}>
              {p.price ? (
                <div className="bb-row">
                  <div><div className="bb-amt">₹{p.price}</div><div className="tiny muted">this test · 1 year access</div></div>
                  <button type="button" className="btn btn-primary btn-lg" {...buyAttrs}><ILock size={15} /> Buy this test</button>
                </div>
              ) : null}
              <div className="bb-row bb-best">
                <div><div className="bb-amt">₹{price}<span className="tiny muted"> / year</span></div><div className="tiny"><b>All {examMocks.length} {e.short} mock tests</b>{perTest ? ` · just ₹${perTest} per test` : ''} + every PYQ test</div></div>
                <button type="button" className={`btn ${p.price ? 'btn-gold' : 'btn-primary btn-lg'}`} data-checkout="jeet-exam" data-direct="1" data-exam={e.slug}>Get all tests</button>
              </div>
              {sample.length > 0
                ? <Link className="bb-free" href={start} prefetch={false} rel="nofollow"><IPlay /> Try {sample.length} questions in exam mode — free</Link>
                : freeMock ? <Link className="bb-free" href={mockUrl(freeMock)}><IPlay /> Try the free {e.short} mock test first</Link>
                : freePyq ? <Link className="bb-free" href={paperUrl(freePyq)}><IPlay /> Practise free {e.short} previous year papers</Link> : null}
              <div className="bb-trust"><span>UPI · GPay · PhonePe</span><span>Unlocks instantly</span><span>Secure Razorpay</span></div>
            </div>
          ) : (
            <div className="buybox">
              <Link className="btn btn-gold btn-lg btn-block" href={start} prefetch={false} rel="nofollow"><IPlay /> Start free test</Link>
              <div className="bb-trust"><span>No sign-up to start</span><span>Instant result</span><span>Rank after sign-in</span></div>
              {jeetMocks > 0 && <button type="button" className="bb-up" data-checkout="jeet-exam" data-direct="1" data-exam={e.slug}><I3D name="crown" size={22} /> <span><b>{jeetMocks} more {e.short} Jeet mock tests</b> — all for ₹{price}/year</span></button>}
            </div>
          )}
        </div>
      </header>

      <div className="layout section" style={{ marginTop: 20 }}>
        <div>
          {p.about && <section className="card pad-lg" aria-labelledby="about-h" style={{ marginBottom: 16 }}><h2 id="about-h">About this mock test</h2>{p.about.split(/\n{2,}/).map((t, i) => <p key={i}>{t}</p>)}</section>}

          <section aria-labelledby={sample.length ? 'sample-h' : undefined}>
            {sample.length > 0 && <><div className="practice-bar no-print">
              <I3D name="target" size={28} />
              <b id="sample-h">{p.premium ? `Free sample: ${sample.length} questions from this test` : `${sample.length} sample questions with answers`}</b>
              <span className="muted small hint">{p.premium ? 'Answer them — see how you would do.' : 'Tap an option to check it.'}</span>
              <span className="grow" />
              <Practice storageKey={`mock/${p.examSlug}/${p.slug}`} total={sample.length} recent={{ url: path, title: p.title, exam: e.short }} />
            </div>
            <div className="stack">{sample.map((q, i) => (
              <MockQuestion key={q.id} q={q} n={i + 1} locked={p.premium ? (
                <><ILock size={15} /> <span><b>Step-by-step solution</b> is in the full test</span>{p.price ? <button type="button" className="btn btn-primary btn-sm" {...buyAttrs}>Unlock · ₹{p.price}</button> : <button type="button" className="btn btn-primary btn-sm" data-checkout="jeet-exam" data-direct="1" data-exam={e.slug}>Unlock · ₹{price}</button>}</>
              ) : undefined} />
            ))}</div></>}

            {p.premium ? (
              <div className="mock-wall section">
                <div className="mw-ghost" aria-hidden="true">
                  {Array.from({ length: 7 }, (_, i) => sections[i % Math.max(1, sections.length)] ?? { name: e.short, n: 0 }).map((s2, i) => (
                    <div key={i} className="mw-row"><span className="q-no">Q{sample.length + 1 + i * Math.max(1, Math.floor(f.total / 7))}</span><span className="chip">{s2.name}</span><span className="mw-line" /><span className="mw-line short" /><ILock size={14} /></div>
                  ))}
                </div>
                <div className="mw-card" data-own={`mock:${p.examSlug}/${p.slug}`}>
                  <I3D name="crown" size={56} />
                  <h3>{sample.length ? `${f.total - sample.length} more questions are waiting` : `${f.total} exam-level questions are inside this test`}</h3>
                  <p className="muted">{sections.map((s2) => `${s2.name} ${s2.n}`).join(' · ')}</p>
                  <ul className="mh-points mw-points">
                    <li><ICheck size={15} /> Full {f.total}-question test in the real exam screen</li>
                    <li><ICheck size={15} /> All-India rank, percentile and topper comparison</li>
                    <li><ICheck size={15} /> Solution of every question + weak-topic report</li>
                    <li><ICheck size={15} /> Re-attempt any time for a year</li>
                  </ul>
                  <div className="row mw-cta">
                    {p.price ? <button type="button" className="btn btn-primary btn-lg" {...buyAttrs}>Buy this test · ₹{p.price}</button> : null}
                    <button type="button" className={`btn ${p.price ? 'btn-gold' : 'btn-primary'} btn-lg`} data-checkout="jeet-exam" data-direct="1" data-exam={e.slug}>All {examMocks.length} {e.short} tests · ₹{price}/yr</button>
                  </div>
                  <div className="bb-trust"><span>Pay by UPI in 10 seconds</span><span>Unlocks instantly</span><span>Secure Razorpay</span></div>
                </div>
              </div>
            ) : (
              <div className="promo dark section">
                <div className="content">
                  <h3>Attempt all {f.total} questions with a timer</h3>
                  <p>Real exam screen, palette, mark for review, negative marking — then your score, All-India rank and section-wise analysis.</p>
                  <div className="row"><Link className="btn btn-gold btn-sm" href={start} prefetch={false} rel="nofollow"><IPlay /> Start the full test free</Link></div>
                </div>
                <I3D name="rocket" lg size={120} className="art" />
              </div>
            )}
          </section>

          {p.premium && (
            <section className="section card pad-lg" aria-labelledby="cmp-h">
              <h2 id="cmp-h">{sample.length ? 'Free sample vs full test' : 'What you get'}</h2>
              <div className="tbl-wrap"><table className="tbl cmp">
                <thead><tr><th scope="col" />{sample.length ? <th scope="col">Free sample</th> : null}{p.price ? <th scope="col">This test · ₹{p.price}</th> : null}<th scope="col" className="cmp-best">All {e.short} tests · ₹{price}/yr</th></tr></thead>
                <tbody>
                  {([
                    ['Questions', `${sample.length}`, `${f.total}`, `${examMocks.length} full tests`],
                    ['Real exam screen with timer', '✓', '✓', '✓'],
                    ['Step-by-step solutions', '—', '✓', '✓'],
                    ['All-India rank & percentile', '—', '✓', '✓'],
                    ['Weak-topic report', '—', '✓', '✓'],
                    ['Every PYQ paper as a timed test', '—', '—', '✓'],
                    ['Validity', '—', '1 year', '1 year'],
                  ] as const).map(([k, a1, a2, a3]) => (
                    <tr key={k}><th scope="row">{k}</th>{sample.length ? <td>{a1}</td> : null}{p.price ? <td>{a2}</td> : null}<td className="cmp-best">{a3}</td></tr>
                  ))}
                  <tr><th scope="row" />{sample.length ? <td /> : null}{p.price ? <td><button type="button" className="btn btn-primary btn-sm" {...buyAttrs}>Buy ₹{p.price}</button></td> : null}<td className="cmp-best"><button type="button" className="btn btn-gold btn-sm" data-checkout="jeet-exam" data-direct="1" data-exam={e.slug}>Get all · ₹{price}</button></td></tr>
                </tbody>
              </table></div>
            </section>
          )}

          <section className="section card pad-lg" aria-labelledby="how-h">
            <h2 id="how-h">How to attempt {p.title}</h2>
            <ol className="how">
              <li><ICheck size={15} /> Tap <b>{p.premium ? 'Start test' : 'Start free test'}</b>{p.premium ? ' and sign in (SRO Jeet members get the full test at once).' : ' — no sign-up needed to begin.'}</li>
              <li><ICheck size={15} /> Choose your language and answer in the real exam screen: palette, mark for review, timer.</li>
              <li><ICheck size={15} /> Submit to see your score, accuracy, time per question and section-wise analysis.</li>
              <li><ICheck size={15} /> Sign in to see your All-India rank, then read the solution of every question.</li>
            </ol>
          </section>

          <section className="section card pad-lg faq" aria-labelledby="mfaq">
            <h2 id="mfaq">{p.title} — FAQs</h2>
            {faqs.map((x) => (<details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
          </section>
        </div>

        <aside className="aside">
          <div className="card pad">
            <h3 className="row" style={{ gap: 8 }}><I3D name="memo" size={24} /> Test overview</h3>
            <table className="tbl"><tbody>
              <tr><th scope="row">Exam</th><td>{e.short}</td></tr>
              <tr><th scope="row">Questions</th><td className="num">{f.total}</td></tr>
              <tr><th scope="row">Marks</th><td className="num">{f.marks}</td></tr>
              <tr><th scope="row">Time</th><td>{f.minutes} minutes</td></tr>
              <tr><th scope="row">Negative</th><td>{p.negative ? (Math.abs(p.negative - 1 / 3) < 1e-6 ? '1/3' : p.negative) : 'None'}</td></tr>
              <tr><th scope="row">Languages</th><td>{langNames}</td></tr>
              <tr><th scope="row">Access</th><td>{p.premium ? (p.price ? `Paid · ₹${p.price}` : 'SRO Jeet') : 'Free'}</td></tr>
            </tbody></table>
          </div>
          {sections.length > 0 && (
            <div className="card pad">
              <h3 className="row" style={{ gap: 8 }}><I3D name="chart" size={24} /> Section-wise questions</h3>
              <table className="tbl"><tbody>{sections.map((s) => (<tr key={s.name}><td>{s.name}</td><td className="num"><b>{s.n}</b></td></tr>))}</tbody></table>
            </div>
          )}
          {e.pattern && (
            <div className="card pad">
              <h3>{e.short} exam pattern</h3>
              <table className="tbl"><tbody>{e.pattern.map((r) => (<tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>))}</tbody></table>
            </div>
          )}
          {others.length > 0 && (
            <div className="card pad">
              <h3>More {e.short} mock tests</h3>
              <ul className="list-plain">{others.map((o) => (<li key={o.slug}><Link href={mockUrl(o)}><span className="grow">{o.title}</span><span className={`chip ${o.premium ? 'gold' : 'good'}`}>{o.premium ? 'Jeet' : 'Free'}</span></Link></li>))}</ul>
            </div>
          )}
          {pyqs.length > 0 && (
            <div className="card pad">
              <h3>{e.short} previous year papers</h3>
              <ul className="list-plain">{pyqs.slice(0, 6).map((o) => (<li key={o.slug}><Link href={paperUrl(o)}>{o.title}</Link></li>))}</ul>
              <Link className="small" href={examUrl(e)}>All {e.short} papers →</Link>
            </div>
          )}
        </aside>
      </div>

      <div className="buybar" {...(p.premium ? { 'data-own': `mock:${p.examSlug}/${p.slug}`, 'data-own-variant': 'compact' } : {})}>
        <I3D name={p.premium ? 'crown' : 'stopwatch'} size={34} />
        <div className="grow"><b>{p.title}</b><div className="tiny muted">{p.premium ? (p.price ? `₹${p.price} · ` : `₹${price}/yr · `) : 'Free · '}{f.total} Qs · {f.minutes} min</div></div>
        {p.premium && p.price ? <button type="button" className="btn btn-primary" {...buyAttrs}>Buy ₹{p.price}</button> : <Link className="btn btn-primary" href={start} prefetch={false} rel="nofollow">{p.premium ? 'Start' : 'Start free'}</Link>}
      </div>
      <JsonLd data={graph(
        breadcrumbLd(crumbs),
        faqLd(faqs),
        ...(sample.length ? [mockQuizLd(p, sample, path)] : []),
        ...(others.length ? [itemListLd([{ name: p.title, path }, ...others.map((o) => ({ name: o.title, path: mockUrl(o) }))])] : []),
        ...(p.premium ? [{
          '@type': 'Product', name: p.price ? p.title : `${e.short} Mock Test Series ${YEAR} – SRO Jeet`, description: `${p.title} and every ${e.short} mock test, previous year paper test and chapter test with All-India rank.`, brand: { '@type': 'Brand', name: SITE.name }, category: 'Online test series',
          ...(cover ? { image: abs(cover) } : {}),
          offers: { '@type': 'Offer', price: String(p.price || price), priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: abs(path) },
        }] : []),
      )} />
    </div>
  );
}
