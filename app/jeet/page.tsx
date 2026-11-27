import Link from '@/components/SmartLink';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import I3D from '@/components/I3D';
import { ICheck, IShield, ILock, IZap } from '@/components/Icons';
import { SITE } from '@/lib/data';
import { PLANS, MONTHLY } from '@/lib/plans';
import { meta, graph, breadcrumbLd, faqLd } from '@/lib/seo';

export const metadata = meta({
  title: 'SRO Jeet – All Mock Tests, PDFs & All-India Rank from ₹349/year',
  description: 'SRO Jeet: full mock test series for every exam, All-India rank, live tests, PDFs of every paper and topic, and a daily drill from your mistakes. ₹349/year launch price, no auto-renewal.',
  path: '/jeet/',
});

const FAQS = [
  { q: 'Do I need SRO Jeet to practise previous year papers?', a: 'No. Every PYQ, its solution, practice mode and Real exam mode stay free forever. SRO Jeet adds full mock series, All-India rank, live tests, PDFs and a daily drill built from your mistakes.' },
  { q: 'Which exams does SRO Jeet cover?', a: 'Every exam on SarkariResultOut — Railway, SSC, Engineering JE/AE, Banking, Police, Teaching and State exams. New series are included at no extra cost.' },
  { q: 'How do I pay?', a: 'Tap Get SRO Jeet, sign in with Google in one tap and pay with any UPI app (Google Pay, PhonePe, Paytm, BHIM), card or net banking. SRO Jeet unlocks the moment payment succeeds.' },
  { q: 'Which languages are the tests in?', a: 'English and Hindi, plus Gujarati for Gujarat state papers. Switch language on any question inside the test.' },
  { q: 'Does SRO Jeet renew automatically?', a: 'No. You pay once for the period you choose. When it ends, your attempts and analysis stay in your account and free features keep working.' },
];

export default function JeetPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'SRO Jeet', path: '/jeet/' }];
  return (
    <div className="wrap has-buybar">
      <Breadcrumbs items={crumbs} />
      <section className="hero">
        <div className="hero-in">
          <div>
            <span className="eyebrow"><span className="live" /> Launch price · first 10,000 students</span>
            <h1>SRO <em>Jeet</em> — know your rank before the result does</h1>
            <p className="lead">One plan for everything: full mock series for every exam, All-India rank on every test, live tests, PDFs of every paper and a daily drill built from your own mistakes.</p>
            <div className="row">
              <button type="button" className="btn btn-gold btn-lg" data-checkout="jeet-yr"><IZap /> Get SRO Jeet · ₹349/year</button>
              <Link className="btn btn-glass btn-lg" href="/pyq/">Try free first</Link>
            </div>
            <div className="row tiny" style={{ marginTop: 12, color: 'var(--on-dark)', gap: 14 }}>
              <span className="row" style={{ gap: 6 }}><ILock size={14} /> Secure UPI payment</span>
              <span className="row" style={{ gap: 6 }}><IZap size={14} /> Unlocks instantly</span>
              <span className="row" style={{ gap: 6 }}><IShield size={14} /> No auto-renewal</span>
            </div>
            <div className="hero-stats">
              <div><I3D name="money" size={32} eager /><span><b>₹29</b><span>a month, billed yearly</span></span></div>
              <div><I3D name="medal" size={32} eager /><span><b>All-India rank</b><span>on every test</span></span></div>
              <div><I3D name="pages" size={32} eager /><span><b>PDFs</b><span>every paper & topic</span></span></div>
              <div><I3D name="robot" size={32} eager /><span><b>Daily drill</b><span>from your mistakes</span></span></div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <span className="halo" />
            <I3D name="crown" lg size={200} eager className="trophy" />
            <div className="float-card fc-1"><I3D name="medal" size={36} eager /><div><b>All-India rank</b><span>see where you stand</span></div></div>
            <div className="float-card fc-2"><I3D name="chart" size={36} eager /><div><b>Topper comparison</b><span>time & accuracy</span></div></div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="plans-h" style={{ marginTop: 40 }}>
        <div className="sec-head"><div><h2 id="plans-h"><I3D name="ticket" size={30} /> Choose your plan</h2><p>One tap to pay with any UPI app. Free stays free.</p></div></div>
        <div className="plans">
          {PLANS.map((p) => (
            <div key={p.id} className={`card plan${p.best ? ' best' : ''}`}>
              {p.best && <span className="badge-top">{p.tagline}</span>}
              <div className="row between"><h3 style={{ margin: 0 }}>{p.name}</h3><I3D name={p.i3d} size={44} /></div>
              <div><span className="amt">{p.price ? `₹${p.price}` : '₹0'}</span>{p.was && <s className="muted" style={{ marginLeft: 8 }}>₹{p.was}</s>}<div className="muted small">{p.per}</div></div>
              <ul>
                {p.yes.map((f) => (<li key={f}><ICheck size={15} /> {f}</li>))}
                {(p.no ?? []).map((f) => (<li key={f} className="off"><span aria-hidden="true" style={{ width: 15, textAlign: 'center', flex: 'none' }}>–</span> {f}</li>))}
              </ul>
              {p.price ? (
                <button type="button" className={`btn ${p.best ? 'btn-primary' : 'btn-soft'} btn-block`} data-checkout={p.id} style={{ marginTop: 'auto' }}>Get {p.name} · ₹{p.price}</button>
              ) : (
                <Link className="btn btn-ghost btn-block" href="/pyq/" style={{ marginTop: 'auto' }}>Start practising</Link>
              )}
            </div>
          ))}
        </div>
        <div className="card pad row between" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 12 }}><I3D name={MONTHLY.i3d} size={40} /><div><b>Just want to try?</b><div className="muted small">{MONTHLY.name} · ₹{MONTHLY.price} {MONTHLY.per}</div></div></div>
          <button type="button" className="btn btn-ghost" data-checkout={MONTHLY.id}>Try 1 month · ₹{MONTHLY.price}</button>
        </div>
      </section>

      <section className="section card pad-lg" aria-labelledby="how-h">
        <h2 id="how-h" className="row" style={{ gap: 10 }}><I3D name="rocket" size={30} /> Jeet in 30 seconds</h2>
        <div className="grid g3" style={{ marginTop: 12 }}>
          {[
            ['phone', '1. Tap Get SRO Jeet', 'Sign in with Google in one tap — no long sign-up form.'],
            ['money', '2. Pay with UPI', 'Google Pay, PhonePe, Paytm, BHIM, card or net banking.'],
            ['party', '3. Start ranking', 'Jeet unlocks instantly on phone and laptop.'],
          ].map(([i, t, d]) => (<div key={t} className="feat card" style={{ boxShadow: 'none' }}><I3D name={i} size={44} /><div><b>{t}</b><p>{d}</p></div></div>))}
        </div>
      </section>

      <section className="section" aria-labelledby="inside-h">
        <div className="sec-head"><div><h2 id="inside-h"><I3D name="gift" size={30} /> Everything inside SRO Jeet</h2><p>One bucket, one price — rank is just one of the things you get.</p></div></div>
        <div className="grid g4">
          {[
            ['stopwatch', 'Full mock tests', 'Every exam, exact pattern, timer and negative marking.'],
            ['medal', 'All-India rank', 'Rank, percentile and topper comparison on every test.'],
            ['fire', 'Live tests', 'Same test, same time, real competition every week.'],
            ['pages', 'PDFs of everything', 'Every paper, chapter and month of current affairs.'],
            ['books', 'Chapter & sectional tests', 'Short tests for every chapter of your syllabus.'],
            ['robot', 'Smart revision drill', 'Your wrong answers come back until you get them right.'],
            ['chart', 'Deep analysis', 'Weak chapters, time per question and what to do next.'],
            ['shield', 'Ad-free, verified', 'No ads; every answer checked against the official key.'],
          ].map(([i, t, d]) => (<div key={t} className="card feat"><I3D name={i} size={44} /><div><b>{t}</b><p>{d}</p></div></div>))}
        </div>
      </section>

      <section className="section card pad-lg faq" aria-labelledby="pfaq-h">
        <h2 id="pfaq-h" className="row" style={{ gap: 10 }}><I3D name="chat" size={30} /> SRO Jeet FAQs</h2>
        {FAQS.map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
      </section>

      <div className="buybar" data-own="jeet" data-own-variant="compact"><I3D name="crown" size={34} /><div className="grow"><b>SRO Jeet ₹349</b> <s className="muted small">₹499</s><div className="tiny muted">per year · every exam</div></div><button type="button" className="btn btn-primary" data-checkout="jeet-yr">Get SRO Jeet</button></div>
      <JsonLd data={graph(breadcrumbLd(crumbs), faqLd(FAQS), {
        '@type': 'Product', name: 'SRO Jeet', description: 'Full mock test series, All-India rank, live tests and PDFs for every government exam.', brand: { '@type': 'Brand', name: SITE.name },
        offers: { '@type': 'Offer', price: '349', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${SITE.url}/jeet/` },
      })} />
    </div>
  );
}
