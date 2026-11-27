'use client';
// Daily Quiz: same 10 PYQs for everyone on a date, one per screen, instant feedback, streak + WhatsApp challenge.
import { useEffect, useMemo, useRef, useState } from 'react';
import { asset } from './I3D';
import { markActive, streak, today, logAttempt } from '@/lib/local';
import { shareWa } from './Account';
import { IWhatsApp, IArrowRight, ICheck } from './Icons';

type L = 'en' | 'gu' | 'hi';
interface PQ { id: string; u: string; ex: string; tp: string; a: 'A' | 'B' | 'C' | 'D'; t: Partial<Record<L, { s: string; o: string[]; q: string }>> }
const K = ['A', 'B', 'C', 'D'] as const;
const LL: Record<L, string> = { gu: 'ગુજ', en: 'EN', hi: 'हिं' };

function seeded(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function pick(pool: PQ[], date: string, n = 10) { const r = seeded('sro-daily-' + date); const a = [...pool]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }

export default function DailyQuiz() {
  const [pool, setPool] = useState<PQ[] | null>(null);
  const [state, setState] = useState<'intro' | 'play' | 'done'>('intro');
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<L>('en');
  const [secs, setSecs] = useState(0);
  const [prev, setPrev] = useState<{ score: number; secs: number } | null>(null);
  const t0 = useRef(0);
  const date = today();

  useEffect(() => {
    fetch(asset('/daily-quiz.json')).then((r) => r.json()).then(setPool).catch(() => setPool([]));
    try { const p = JSON.parse(localStorage.getItem('sro:dq:' + date) || 'null'); if (p) { setPrev(p); } } catch {}
  }, [date]);
  useEffect(() => { if (state !== 'play') return; const t = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 1000); return () => clearInterval(t); }, [state]);

  const qs = useMemo(() => (pool ? pick(pool, date) : []), [pool, date]);
  const score = qs.filter((q) => ans[q.id] === q.a).length;

  if (!pool) return <div className="card pad-lg dq-skel" aria-busy="true">Loading today&apos;s quiz…</div>;
  if (!qs.length) return <div className="card pad-lg">Today&apos;s quiz is being prepared. Please check back at 7 AM.</div>;

  if (state === 'intro') {
    return (
      <div className="card dq-intro">
        <img src={asset('/i3d/fire-lg.webp')} width={110} height={110} alt="" onError={(e) => { (e.target as HTMLImageElement).src = asset('/i3d/fire.webp'); }} />
        <h2>Today&apos;s quiz · {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</h2>
        <p className="muted">{qs.length} real PYQs from {[...new Set(qs.map((q) => q.ex))].join(', ')}. About 5 minutes. Same questions for every student today.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="chip">🔥 Streak {streak()} day{streak() === 1 ? '' : 's'}</span>
          {prev && <span className="chip good">Today: {prev.score}/{qs.length}</span>}
        </div>
        <div className="seg" role="group" aria-label="Quiz language" style={{ margin: '6px auto' }}>
          {(['en', 'hi', 'gu'] as L[]).map((l) => <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{LL[l]}</button>)}
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => { setAns({}); setI(0); t0.current = Date.now(); setSecs(0); setState('play'); }}>{prev ? 'Play again' : 'Start quiz'} <IArrowRight /></button>
      </div>
    );
  }

  if (state === 'done') {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <div className="card dq-done">
        <div className="dq-ring" style={{ ['--p' as string]: pct }}><b>{score}<span>/{qs.length}</span></b></div>
        <h2>{score >= 8 ? 'Topper level! 🏆' : score >= 5 ? 'Good going! 💪' : 'Keep practising 📚'}</h2>
        <p className="muted">{Math.floor(secs / 60)}m {secs % 60}s · 🔥 {streak()}-day streak. Come back tomorrow at 7 AM to keep it alive.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-wa" onClick={() => shareWa(`🔥 I scored ${score}/${qs.length} in today's SRO Daily Quiz (govt exam PYQs). Can you beat me?`, '/daily-quiz/')}><IWhatsApp /> Challenge friends</button>
          <button type="button" className="btn btn-gold hide-jeet" data-checkout="jeet-yr">See my All-India rank</button>
        </div>
        <ol className="dq-review">
          {qs.map((q, n) => {
            const tx = q.t[lang] ?? q.t.en ?? Object.values(q.t)[0]!;
            const ok = ans[q.id] === q.a;
            return (
              <li key={q.id} className={ok ? 'ok' : 'no'}>
                <span className="dq-n">{ok ? <ICheck size={14} /> : '✕'}</span>
                <div><b>Q{n + 1}. {tx.s}</b><span className="small">Answer: {q.a}. {tx.o[K.indexOf(q.a)]}{!ok && ans[q.id] ? ` · you chose ${ans[q.id]}` : ''}</span><a className="small" href={q.u}>Full solution →</a></div>
              </li>
            );
          })}
        </ol>
        <button type="button" className="btn btn-ghost" onClick={() => setState('intro')}>Back</button>
      </div>
    );
  }

  const q = qs[i];
  const tx = q.t[lang] ?? q.t.en ?? Object.values(q.t)[0]!;
  const chosen = ans[q.id];
  const finish = () => {
    const s = Math.round((Date.now() - t0.current) / 1000);
    setSecs(s); markActive();
    try { localStorage.setItem('sro:dq:' + date, JSON.stringify({ score, secs: s })); } catch {}
    logAttempt({ key: 'daily-' + date, title: `Daily Quiz · ${date}`, url: '/daily-quiz/', score, total: qs.length, right: score, wrong: Object.keys(ans).length - score, seconds: s });
    setState('done');
  };
  return (
    <div className="card dq-play" lang={lang}>
      <div className="dq-top">
        <div className="dq-bar" aria-hidden="true">{qs.map((x, n) => <i key={x.id} className={n === i ? 'cur' : ans[x.id] ? (ans[x.id] === x.a ? 'ok' : 'no') : ''} />)}</div>
        <div className="row between small muted"><span>Question {i + 1} of {qs.length} · {q.ex} · {q.tp}</span><span className="nums">⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span></div>
      </div>
      <p className="dq-stem">{tx.s}</p>
      <div className="dq-opts">
        {tx.o.map((o, n) => {
          const k = K[n];
          const cls = chosen ? (k === q.a ? 'ok' : k === chosen ? 'no' : '') : '';
          return <button key={k} type="button" className={`dq-o ${cls}`} disabled={!!chosen} onClick={() => setAns({ ...ans, [q.id]: k })}><span className="k">{k}</span>{o}</button>;
        })}
      </div>
      {chosen && <p className={`dq-ex ${chosen === q.a ? 'ok' : 'no'}`}><b>{chosen === q.a ? 'Correct!' : `Answer: ${q.a}`}</b> {tx.q}</p>}
      <div className="row between">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => (i ? setI(i - 1) : setState('intro'))}>Back</button>
        {i < qs.length - 1
          ? <button type="button" className="btn btn-primary" onClick={() => setI(i + 1)} disabled={!chosen}>Next <IArrowRight /></button>
          : <button type="button" className="btn btn-gold" onClick={finish} disabled={!chosen}>See result</button>}
      </div>
    </div>
  );
}
