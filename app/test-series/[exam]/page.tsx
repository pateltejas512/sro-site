import Link from '@/components/SmartLink';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import ExamCover from '@/components/ExamCover';
import { IPlay, ICheck, ILock, IClock, IList, IGlobe, IAward } from '@/components/Icons';
import { exams, getExam, papersForExam, questionsForPaper, playable, paperUrl, examUrl, LANG_SHORT, LANG_LABEL, orderLangs, SITE, formatDate, mocksForExam, mockUrl, mockSize } from '@/lib/data';
import { planById } from '@/lib/plans';
import { meta, graph, breadcrumbLd, faqLd, itemListLd, abs } from '@/lib/seo';
import { coverOf } from '@/lib/covers';

const YEAR = Number(SITE.updated.slice(0, 4));
export const dynamicParams = false;
export function generateStaticParams() { return exams.map((e) => ({ exam: e.slug })); }

const neg = (n?: number) => (!n ? 'No negative' : `−${Math.abs(n - 1 / 3) < 1e-6 ? '1/3' : n}`);

export function generateMetadata({ params }: { params: { exam: string } }) {
  const e = getExam(params.exam);
  if (!e) return {};
  const ms = mocksForExam(e.slug);
  const pyq = papersForExam(e.slug).filter(playable).length;
  const n = ms.length + pyq;
  return meta({
    title: `${e.short} Mock Test Series ${YEAR} – ${n ? `${n} Tests${ms.some((m) => !m.premium) ? ' (1 Free)' : ''}, ` : ''}All-India Rank & Solutions`,
    description: `${e.short} mock test series ${YEAR}: ${ms.length ? `${ms.length} full-length mock tests` : 'full mock tests'}${pyq ? ` + ${pyq} previous year papers as timed tests` : ''}, latest pattern, Gujarati & English, All-India rank and step-by-step solutions. Try 3 questions free. Updated ${formatDate(SITE.updated)}.`,
    path: `/test-series/${e.slug}/`,
    image: ms[0] ? coverOf(ms[0]) : undefined,
  });
}

export default function ExamTestSeries({ params }: { params: { exam: string } }) {
  const e = getExam(params.exam);
  if (!e) notFound();
  const path = `/test-series/${e.slug}/`;
  const ps = papersForExam(e.slug);
  const pyqs = ps.filter(playable);
  const allMs = mocksForExam(e.slug);
  const ms = [...allMs.filter((m) => !m.premium), ...allMs.filter((m) => m.premium)]; // the free test first
  const freeMock = ms.find((m) => !m.premium);
  const freePyq = pyqs[0];
  const price = planById('jeet-exam')?.price ?? 149;
  const was = planById('jeet-exam')?.was;
  const separate = ms.reduce((s, m) => s + (m.price ?? 0), 0); // what the tests cost one by one
  const save = separate > price ? separate - price : 0;
  const attempts = ms.reduce((s, m) => s + (m.legacyAttempts ?? 0), 0);
  const langs = orderLangs([...new Set([...ps, ...ms].flatMap((p) => p.languages))]);
  const totalQs = ms.reduce((s, m) => s + mockSize(m), 0);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Test Series', path: '/test-series/' }, { name: `${e.short} Mock Test`, path }];
  const buy = { 'data-checkout': 'jeet-exam', 'data-direct': '1', 'data-exam': e.slug } as const;

  const faqs = [
    { q: `What is included in the ${e.short} mock test series ${YEAR}?`, a: `${ms.length} full-length mock tests (${totalQs.toLocaleString('en-IN')} questions) in the latest ${e.short} pattern${pyqs.length ? `, plus ${pyqs.length} previous year paper${pyqs.length === 1 ? '' : 's'} as timed tests` : ''}. Every test has step-by-step solutions, All-India rank and a weak-topic report.` },
    { q: `How much does the ${e.short} test series cost?`, a: `₹${price} for one year for every ${e.short} test${save ? ` (buying the tests one by one would cost ₹${separate})` : ''}. Single tests are also sold separately. No auto-renewal, pay once by UPI.` },
    { q: `Can I try the ${e.short} mock test before paying?`, a: freeMock ? `Yes. ${freeMock.title} is completely free — all ${mockSize(freeMock)} questions with result and rank. The other ${e.short} mock tests are premium.` : `Yes. Practise the ${e.short} previous year papers free${pyqs.length ? ' — they also run as timed tests in the same exam screen' : ''}. The full mock tests are premium.` },
    { q: `Is the ${e.short} mock test based on the latest pattern?`, a: `Yes. Tests follow the official ${e.short} pattern${e.pattern ? ` (${e.pattern.map((p) => `${p.label.toLowerCase()}: ${p.value}`).join('; ')})` : ''}. Always confirm details in the latest official notification.` },
    { q: `In which languages can I attempt the ${e.short} tests?`, a: `${langs.map((l) => LANG_LABEL[l]).join(', ')}. You can switch the language of any question during the test.` },
    { q: 'Will I get my All-India rank?', a: 'Yes. Your first attempt of every test is scored on our server and ranked among every student who took it, with percentile and topper comparison.' },
    { q: 'What if a test does not open after paying?', a: 'Tests unlock instantly on your account. If a test does not open, message us with your payment ID and we unlock it the same day.' },
    { q: 'Can I get a refund after buying?', a: `No. All test series and single-test purchases are final and non-refundable. ${freeMock ? `Attempt the free ${freeMock.title}` : `Practise the free ${e.short} previous year papers`} first to see the exam screen before you buy.` },
  ];

  return (
    <div className="wrap has-buybar">
      <Breadcrumbs items={crumbs} />

      <header className="series-hero">
        <div className="sh-main">
          <div className="row" style={{ gap: 6, marginBottom: 10 }}>
            <span className="chip gold">Premium test series</span>
            <span className="chip">Updated {formatDate(SITE.updated)}</span>
          </div>
          <div className="sh-title">
            <ExamCover exam={e} tag="TEST" />
            <div style={{ minWidth: 0 }}>
              <h1>{e.short} Mock Test Series {YEAR}</h1>
              <p className="muted" style={{ margin: 0 }}>{e.authority}. Latest pattern, real exam screen, All-India rank and solutions for every question.</p>
            </div>
          </div>
          <div className="sh-stats">
            <div><b>{ms.length + pyqs.length}</b><span>total tests</span></div>
            <div><b>{ms.length}</b><span>full mocks</span></div>
            <div><b>{pyqs.length}</b><span>PYQ tests</span></div>
            {attempts >= 20 ? <div><b>{attempts.toLocaleString('en-IN')}+</b><span>attempts</span></div> : <div><b>{langs.map((l) => LANG_SHORT[l]).join(' · ')}</b><span>languages</span></div>}
          </div>
          <ul className="mh-points sh-points">
            <li><ICheck size={15} /> {totalQs.toLocaleString('en-IN')} exam-level questions with step-by-step solutions</li>
            <li><ICheck size={15} /> All-India rank, percentile and topper comparison on every test</li>
            <li><ICheck size={15} /> Weak-topic report after each test — know exactly what to revise</li>
            <li><ICheck size={15} /> {langs.map((l) => LANG_LABEL[l]).join(' + ')} · works on any phone</li>
          </ul>
        </div>

        <aside className="sh-buy" data-own={`exam:${e.slug}`} data-own-label={e.short}>
          <div className="sb-tag">Best value</div>
          <div className="sb-title">All {ms.length + pyqs.length} {e.short} tests</div>
          <div className="sb-price"><b>₹{price}</b>{save ? <s>₹{separate}</s> : was ? <s>₹{was}</s> : null}<span>/ year</span></div>
          {save ? <div className="sb-save">You save ₹{save} vs buying tests one by one</div> : null}
          <button type="button" className="btn btn-primary btn-lg btn-block" {...buy}><ILock size={15} /> Unlock full series</button>
          {freeMock ? <Link className="bb-free" href={mockUrl(freeMock)}><IPlay /> Attempt the free mock test first</Link> : freePyq ? <Link className="bb-free" href={paperUrl(freePyq)}><IPlay /> Practise free previous year papers</Link> : null}
          <div className="bb-trust"><span>UPI in 10 seconds</span><span>Instant unlock</span><span>Secure Razorpay</span></div>
        </aside>
      </header>

      {ms.length > 0 && (
        <section className="section" aria-labelledby="mock-h">
          <div className="sec-head"><div><h2 id="mock-h">{e.short} full mock tests {YEAR}</h2><p>Each test: real exam screen, timer, negative marking, rank and solutions.</p></div></div>
          <div className="series-grid">
            {ms.map((m, i) => {
              const cv = coverOf(m);
              return (
                <article key={m.slug} className="sg-card">
                  <Link href={mockUrl(m)} className="sg-media" aria-label={m.title}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {cv ? <img src={cv} alt="" width={400} height={225} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" /> : <span className="sg-fallback"><ExamCover exam={e} tag="MOCK" /></span>}
                    {m.premium ? <span className="sg-lock"><ILock size={13} /> Premium</span> : <span className="sg-lock sg-free">FREE TEST</span>}
                  </Link>
                  <div className="sg-body">
                    <h3><Link href={mockUrl(m)}>{m.title}</Link></h3>
                    <div className="ts-facts small muted"><span><IList /> {mockSize(m)} Qs</span>{m.minutes && <span><IClock /> {m.minutes} min</span>}<span><IAward /> {neg(m.negative)}</span><span><IGlobe /> {orderLangs(m.languages).map((l) => LANG_SHORT[l]).join(' · ')}</span></div>
                    <div className="sg-foot">
                      {!m.premium ? <Link className="btn btn-gold btn-sm" href={`${mockUrl(m)}test/`} prefetch={false} rel="nofollow"><IPlay /> Start free test</Link> : m.price ? <button type="button" className="btn btn-primary btn-sm" data-checkout="mock" data-direct="1" data-paper={`${m.examSlug}/${m.slug}`} data-price={m.price} data-title={m.title} data-exam={e.slug} data-exam-short={e.short}>Unlock · ₹{m.price}</button> : <button type="button" className="btn btn-primary btn-sm" {...buy}>Unlock</button>}
                      <Link className="btn btn-ghost btn-sm" href={mockUrl(m)}>Details</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {pyqs.length > 0 && (
        <section className="section" aria-labelledby="pyq-h">
          <div className="sec-head"><div><h2 id="pyq-h">{e.short} previous year papers as timed tests</h2><p>The real papers in exam mode — shift-wise rank and analysis.</p></div></div>
          <div className="stack">
            {pyqs.map((p) => (
              <div key={p.slug} className="card ts-row">
                <span className="chip">PYQ</span>
                <div style={{ minWidth: 0 }} className="grow">
                  <Link href={paperUrl(p)}><b>{p.title}</b></Link>
                  <div className="ts-facts small muted"><span><IList /> {questionsForPaper(p).length}{p.totalQuestions ? ` of ${p.totalQuestions}` : ''} questions</span>{p.minutes && <span><IClock /> {p.minutes} min</span>}<span><IGlobe /> {orderLangs(p.languages).map((l) => LANG_SHORT[l]).join(' · ')}</span></div>
                </div>
                <Link className="btn btn-ghost btn-sm" href={`${paperUrl(p)}test/`} prefetch={false} rel="nofollow"><IPlay /> Attempt</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section card pad-lg" aria-labelledby="why-h">
        <h2 id="why-h">Why students choose the SRO {e.short} test series</h2>
        <div className="grid g3 why-grid">
          {[
            ['stopwatch', 'Exactly like the real exam', 'Same pattern, timer, palette, mark-for-review and negative marking as the computer-based test.'],
            ['medal', 'Real All-India rank', 'Your first attempt is scored on our server — no fake ranks — with percentile and topper comparison.'],
            ['bulb', 'Solution for every question', 'Step-by-step explanations, short tricks and formulas, in your language.'],
            ['target', 'Weak-topic report', 'After every test you see which chapters cost you marks and what to revise next.'],
            ['speak', 'Gujarati + English', 'Switch the language of any question during the test.'],
            ['gift', 'Pay once, no auto-renewal', `₹${price} a year for every ${e.short} test. UPI in 10 seconds, instant unlock.`],
          ].map(([i, t, d]) => (<div key={t} className="feat"><I3D name={i} size={40} /><div><b>{t}</b><p>{d}</p></div></div>))}
        </div>
      </section>

      <section className="section card pad-lg prose-sec" aria-labelledby="about-h">
        <h2 id="about-h">About the {e.short} mock test series {YEAR}</h2>
        <p>The {e.short} mock test series is built for the {e.name} conducted by {e.authority}. Every test follows the latest official pattern and syllabus, so you face the same mix of questions, the same time pressure and the same negative marking as in the real exam. Attempting full mocks regularly is the fastest way to improve speed, accuracy and the order in which you attempt sections.</p>
        <h3>Test structure</h3>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th scope="col">Test type</th><th scope="col">Tests</th><th scope="col">What it does</th></tr></thead><tbody>
          <tr><th scope="row">Full-length mock tests</th><td className="num">{ms.length}</td><td>Complete paper in the exact pattern and difficulty, with rank</td></tr>
          <tr><th scope="row">Previous year papers</th><td className="num">{pyqs.length}</td><td>Real questions asked in earlier {e.short} exams, as timed tests</td></tr>
          {freeMock ? <tr><th scope="row">Free mock test</th><td className="num">1</td><td>The complete {freeMock.title} free — try the exam screen before you buy</td></tr> : <tr><th scope="row">Free practice</th><td className="num">{ps.length} PYQ</td><td>Previous year papers with answers, free on the {e.short} papers page</td></tr>}
        </tbody></table></div>
        {e.pattern && (<>
          <h3>{e.short} exam pattern</h3>
          <div className="tbl-wrap"><table className="tbl"><tbody>{e.pattern.map((r) => (<tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>))}</tbody></table></div>
        </>)}
        <h3>How to prepare with {e.short} mock tests</h3>
        <div className="tbl-wrap"><table className="tbl"><tbody>
          <tr><th scope="row">Every day</th><td>Revise one subject for 1–2 hours, solve 20–30 previous year questions and read the solutions of every mistake.</td></tr>
          <tr><th scope="row">Every week</th><td>Attempt one full mock test in exam conditions, then spend as long analysing it as you spent attempting it.</td></tr>
          <tr><th scope="row">Last 30 days</th><td>Attempt 2–3 full mocks a week, track your score and rank trend, and revise only the weak topics the report shows.</td></tr>
        </tbody></table></div>
        <p className="small muted">Then read every question with its solution on the <Link href={examUrl(e)}>{e.short} previous year papers</Link> page.</p>
      </section>

      <section className="section card pad-lg faq" aria-labelledby="tfaq">
        <h2 id="tfaq">{e.short} mock test series — FAQs</h2>
        {faqs.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>

      <section className="section">
        <div className="sec-head"><h2>More test series</h2></div>
        <div className="row" style={{ gap: 8 }}>{exams.filter((x) => x.slug !== e.slug).map((x) => <Link key={x.slug} className="chip brand" href={`/test-series/${x.slug}/`}>{x.short} Mock Test</Link>)}</div>
      </section>

      <div className="buybar" data-own={`exam:${e.slug}`} data-own-label={e.short} data-own-variant="compact">
        <I3D name="crown" size={34} />
        <div className="grow"><b>All {ms.length + pyqs.length} {e.short} tests · ₹{price}</b><div className="tiny muted">{save ? `save ₹${save} · ` : ''}1 year · instant unlock</div></div>
        <button type="button" className="btn btn-primary" {...buy}>Unlock</button>
      </div>
      <JsonLd data={graph(breadcrumbLd(crumbs), faqLd(faqs), ...(ms.length ? [itemListLd(ms.map((m) => ({ name: m.title, path: mockUrl(m) })))] : []), {
        '@type': 'Product', name: `${e.short} Mock Test Series ${YEAR}`, description: `${ms.length} full-length ${e.short} mock tests${pyqs.length ? ` and ${pyqs.length} previous year papers` : ''} with All-India rank and solutions.`, brand: { '@type': 'Brand', name: SITE.name }, category: 'Online test series',
        ...(ms[0] && coverOf(ms[0]) ? { image: abs(coverOf(ms[0])!) } : {}),
        offers: { '@type': 'Offer', price: String(price), priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: abs(path) },
      })} />
    </div>
  );
}
