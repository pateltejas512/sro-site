'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logAttempt, markActive, touchRecent } from '@/lib/local';
import { asset } from './I3D';
import { Inline, Stem } from './Md';
import * as api from '@/lib/api';

type L = string;
type K = 'A' | 'B' | 'C' | 'D';
export interface TQ { id: string; qNo: number; section: string; chapter: string; topic: string; answer: K; slug: string; figure?: string; text: Record<string, { stem: string; options: string[]; quick: string }> }
export interface TPaper { key: string; title: string; examShort: string; paperUrl: string; seconds: number; negative: number; langs: L[]; questions: TQ[]; heldOn?: string; cover: { t1: string; t2: string; t3: string; cls: string }; tag?: string; backLabel?: string; noRank?: string /* reason shown instead of the rank */ }

const KEYS: K[] = ['A', 'B', 'C', 'D'];
const LBL: Record<string, string> = { en: 'English', gu: 'ગુજરાતી', hi: 'हिन्दी', mr: 'मराठी', bn: 'বাংলা', ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', ml: 'മലയാളം', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', ur: 'اردو' };
const COLORS = ['#c9480f', '#2f7fc1', '#f5b82e', '#12a150', '#e0457b', '#7a4fd6', '#12968a', '#a16207', '#ef5656', '#64748b'];
const Ico = ({ d, s = 18 }: { d: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const I = (n: string, s = 28) => <img src={asset(`/i3d/${n}.webp`)} width={s} height={s} alt="" className="i3d" />;

interface State { stage: 'intro' | 'test' | 'result'; cur: number; ans: Record<string, K>; mark: Record<string, boolean>; seen: Record<string, boolean>; spent: Record<string, number>; left: number; lang: L }
const fmt = (s: number) => { const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}`; };
const mmss = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
const hm = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h} h ${m} min` : m ? `${m} min` : `${Math.round(s)} s`; };
const neg = (n: number) => (Math.abs(n - 1 / 3) < 1e-6 ? '1/3' : String(n));

/** Shift rank: server-scored on the first attempt (answers re-checked server-side), shown after sign-in. */
function RankBox({ paperKey, answers, seconds }: { paperKey: string; answers: Record<string, string>; seconds: number }) {
  const [user, setUser] = useState<api.User | null | undefined>(undefined);
  const [rank, setRank] = useState<{ rank: number; total: number; percentile: number | null } | null>(null);
  const [err, setErr] = useState('');
  const sent = useRef(false);
  useEffect(() => {
    api.me().then(setUser);
    const on = (e: Event) => setUser((e as CustomEvent<api.User | null>).detail);
    window.addEventListener('sro:user', on);
    return () => window.removeEventListener('sro:user', on);
  }, []);
  useEffect(() => {
    if (!user || api.DEMO || sent.current) return;
    sent.current = true;
    api.submitAttempt({ paperKey, answers, seconds }).then(setRank).catch((e) => setErr((e as Error).message));
  }, [user, paperKey, answers, seconds]);
  if (rank) return (<><div style={{ fontSize: '1.5rem', fontWeight: 850 }} className="nums">#{rank.rank}<small className="muted"> / {rank.total}</small></div>{rank.percentile !== null && <span className="chip good">{rank.percentile}%ile</span>}</>);
  if (user) return <div className="small muted" style={{ maxWidth: 180, margin: '6px auto 0' }}>{err || (api.DEMO ? 'Live shift rank opens when the SRO API is connected.' : 'Calculating your rank…')}</div>;
  return (<><div className="blur" aria-hidden="true" style={{ fontSize: '1.4rem', fontWeight: 850 }}>— / —</div><button type="button" className="btn btn-primary btn-sm" data-login="Sign in to see your rank in this shift." style={{ marginTop: 6 }}>Sign in to unlock</button></>);
}

function Cover({ c, size = 64, tag = 'PYQ' }: { c: TPaper['cover']; size?: number; tag?: string }) {
  return (<div className={`cover ${c.cls}`} style={{ width: size, fontSize: size / 6.2 }} aria-hidden="true"><span className="t1">{c.t1}</span><span className="t2">{c.t2}</span><span className="t3">{c.t3}</span><span className="tag">{tag}</span></div>);
}

function Donut({ parts, size = 150, label, sub }: { parts: { v: number; c: string }[]; size?: number; label: string; sub: string }) {
  const r = 40, C = 2 * Math.PI * r, total = parts.reduce((s, p) => s + p.v, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label} ${sub}`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="12" />
      {parts.map((p, i) => { const len = (p.v / total) * C; const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={p.c} strokeWidth="12" strokeDasharray={`${Math.max(0, len - 0.8)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 50 50)" />; acc += len; return el; })}
      <text x="50" y="50" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)">{label}</text>
      <text x="50" y="62" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="var(--muted)">{sub}</text>
    </svg>
  );
}

function Trend({ pts }: { pts: { x: string; y: number | null }[] }) {
  const W = 320, H = 150, L = 30, B = 22, T = 14;
  const xs = (i: number) => L + 12 + (i * (W - L - 40)) / Math.max(1, pts.length - 1);
  const ys = (v: number) => T + (1 - v / 100) * (H - T - B);
  const valid = pts.map((p, i) => ({ ...p, i })).filter((p) => p.y !== null) as { x: string; y: number; i: number }[];
  const d = valid.map((p, k) => `${k ? 'L' : 'M'}${xs(p.i)},${ys(p.y)}`).join(' ');
  const area = valid.length ? `${d} L${xs(valid.at(-1)!.i)},${ys(0)} L${xs(valid[0].i)},${ys(0)} Z` : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Accuracy across the paper">
      {[0, 50, 100].map((g) => (<g key={g}><line x1={L} x2={W - 6} y1={ys(g)} y2={ys(g)} stroke="var(--line)" /><text x={L - 6} y={ys(g) + 3} textAnchor="end" fontSize="9" fill="var(--muted)">{g}%</text></g>))}
      {area && <path d={area} fill="rgba(22,179,100,0.12)" />}
      {d && <path d={d} fill="none" stroke="var(--good-2)" strokeWidth="2.5" strokeLinejoin="round" />}
      {valid.map((p) => (<g key={p.i}><circle cx={xs(p.i)} cy={ys(p.y)} r="3.5" fill="var(--surface)" stroke="var(--good-2)" strokeWidth="2" /><text x={xs(p.i)} y={ys(p.y) - 7} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--ink)">{Math.round(p.y)}%</text></g>))}
      {pts.map((p, i) => (<text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="8.5" fill="var(--muted)">{p.x}</text>))}
    </svg>
  );
}

export default function TestEngine({ paper }: { paper: TPaper }) {
  const storeKey = `sro:test:${paper.key}`;
  const fresh = useCallback((): State => ({ stage: 'intro', cur: 0, ans: {}, mark: {}, seen: {}, spent: {}, left: paper.seconds, lang: paper.langs[0] }), [paper]);
  const [s, setS] = useState<State>(fresh);
  const [confirm, setConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'chapters' | 'time' | 'solutions'>('overview');
  const [filter, setFilter] = useState<'all' | 'right' | 'wrong' | 'skip'>('all');
  const [ready, setReady] = useState(false);
  const [fs, setFs] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const loaded = useRef(false);
  const logged = useRef(false);

  useEffect(() => { try { const raw = localStorage.getItem(storeKey); if (raw) setS({ ...fresh(), ...JSON.parse(raw) }); } catch {} loaded.current = true; }, [storeKey, fresh]);
  useEffect(() => { if (loaded.current) { try { localStorage.setItem(storeKey, JSON.stringify(s)); } catch {} } }, [s, storeKey]);

  const qs = paper.questions;
  const q = qs[s.cur];

  useEffect(() => {
    if (s.stage !== 'test') return;
    const t = setInterval(() => setS((p) => {
      if (p.stage !== 'test') return p;
      const id = qs[p.cur].id, left = p.left - 1;
      const next = { ...p, left, spent: { ...p.spent, [id]: (p.spent[id] ?? 0) + 1 } };
      return left <= 0 ? { ...next, left: 0, stage: 'result' } : next;
    }), 1000);
    return () => clearInterval(t);
  }, [s.stage, qs]);
  useEffect(() => {
    if (s.stage === 'test') setS((p) => (p.seen[qs[p.cur].id] ? p : { ...p, seen: { ...p.seen, [qs[p.cur].id]: true } }));
    if (s.stage === 'result') requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  }, [s.cur, s.stage, qs]);
  useEffect(() => {
    if (s.stage !== 'test') return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [s.stage]);

  const sections = useMemo(() => { const out: { name: string; from: number; to: number }[] = []; qs.forEach((x, i) => { const n = x.section || 'Questions'; const last = out[out.length - 1]; if (last && last.name === n) last.to = i + 1; else out.push({ name: n, from: i, to: i + 1 }); }); return out; }, [qs]);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [s.cur]);
  const go = (i: number) => { setS((p) => ({ ...p, cur: Math.max(0, Math.min(qs.length - 1, i)) })); setPaletteOpen(false); };
  const pick = (k: K) => setS((p) => ({ ...p, ans: { ...p.ans, [q.id]: k } }));
  const clear = () => setS((p) => { const a = { ...p.ans }; delete a[q.id]; return { ...p, ans: a }; });
  const markNext = () => { setS((p) => ({ ...p, mark: { ...p.mark, [q.id]: !p.mark[q.id] } })); go(s.cur + 1); };
  const submit = () => { setConfirm(false); setS((p) => ({ ...p, stage: 'result' })); };
  const restart = () => { try { localStorage.removeItem(storeKey); } catch {} logged.current = false; setS(fresh()); setReady(false); setFilter('all'); setTab('overview'); };

  useEffect(() => {
    if (s.stage !== 'test') return;
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (confirm) { if (e.key === 'Escape') setConfirm(false); return; }
      if (paletteOpen && e.key === 'Escape') { setPaletteOpen(false); return; }
      const tg = e.target as HTMLElement | null; if (tg && /INPUT|TEXTAREA|SELECT/.test(tg.tagName)) return;
      const k = e.key.toUpperCase(), cur = qs[s.cur];
      const idx = ['A', 'B', 'C', 'D'].indexOf(k) >= 0 ? ['A', 'B', 'C', 'D'].indexOf(k) : ['1', '2', '3', '4'].indexOf(k);
      if (idx >= 0 && idx < (cur.text[s.lang] ?? Object.values(cur.text)[0]).options.length) { e.preventDefault(); setS((p) => ({ ...p, ans: { ...p.ans, [cur.id]: KEYS[idx] } })); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); if (s.cur < qs.length - 1) setS((p) => ({ ...p, cur: p.cur + 1 })); else setConfirm(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setS((p) => ({ ...p, cur: Math.max(0, p.cur - 1) })); }
      else if (k === 'M') { e.preventDefault(); setS((p) => ({ ...p, mark: { ...p.mark, [cur.id]: !p.mark[cur.id] }, cur: Math.min(qs.length - 1, p.cur + 1) })); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [s.stage, s.cur, s.lang, qs, confirm, paletteOpen]);

  const counts = useMemo(() => {
    let answered = 0, marked = 0, markedAns = 0, notAnswered = 0, notVisited = 0;
    qs.forEach((x) => { const a = !!s.ans[x.id], m = !!s.mark[x.id], v = !!s.seen[x.id]; if (m && a) markedAns++; else if (m) marked++; else if (a) answered++; else if (v) notAnswered++; else notVisited++; });
    return { answered, marked, markedAns, notAnswered, notVisited };
  }, [qs, s.ans, s.mark, s.seen]);

  const R = useMemo(() => {
    let right = 0, wrong = 0;
    const ch = new Map<string, { n: number; r: number; w: number; t: number }>();
    qs.forEach((x) => {
      const c = ch.get(x.chapter) ?? { n: 0, r: 0, w: 0, t: 0 };
      c.n++; c.t += s.spent[x.id] ?? 0;
      const a = s.ans[x.id];
      if (a) { if (a === x.answer) { right++; c.r++; } else { wrong++; c.w++; } }
      ch.set(x.chapter, c);
    });
    const skipped = qs.length - right - wrong, lost = wrong * paper.negative, score = right - lost, used = paper.seconds - s.left;
    const blocks = Math.min(6, Math.max(2, Math.ceil(qs.length / 5)));
    const per = Math.ceil(qs.length / blocks);
    const trend = Array.from({ length: blocks }, (_, b) => {
      const part = qs.slice(b * per, (b + 1) * per);
      const att = part.filter((x) => s.ans[x.id]); const ok = att.filter((x) => s.ans[x.id] === x.answer).length;
      return { x: `Q${b * per + 1}-${Math.min(qs.length, (b + 1) * per)}`, y: att.length ? (ok / att.length) * 100 : null };
    });
    const chapters = [...ch.entries()].map(([name, v]) => ({ name, ...v, acc: v.r + v.w ? (v.r / (v.r + v.w)) * 100 : null })).sort((a, b) => b.n - a.n);
    return { right, wrong, skipped, lost, score, used, acc: right + wrong ? (right / (right + wrong)) * 100 : 0, chapters, trend };
  }, [qs, s.ans, s.left, s.spent, paper]);

  useEffect(() => {
    if (s.stage !== 'result' || logged.current || R.right + R.wrong === 0) return;
    logged.current = true;
    logAttempt({ key: paper.key, title: paper.title, url: paper.paperUrl, score: R.score, total: qs.length, right: R.right, wrong: R.wrong, seconds: R.used });
    touchRecent({ url: paper.paperUrl, title: paper.title, exam: paper.examShort, done: R.right + R.wrong, total: qs.length });
    markActive();
  }, [s.stage, R, paper, qs.length]);

  const t = (x: TQ) => x.text[s.lang] ?? x.text[paper.langs[0]] ?? Object.values(x.text)[0];

  /* ---------------- Intro ---------------- */
  if (s.stage === 'intro') {
    const resumable = Object.keys(s.ans).length > 0 && s.left < paper.seconds;
    return (
      <div className="wrap" style={{ maxWidth: 900 }}>
        <div className="phead section" style={{ marginTop: 16 }}>
          <div className="phead-in" style={{ gridTemplateColumns: 'auto minmax(0,1fr)' }}>
            <Cover c={paper.cover} size={96} tag={paper.tag} />
            <div><span className="chip gold" style={{ marginBottom: 8 }}>Real exam mode</span><h1 style={{ fontSize: 'clamp(1.2rem,1rem + 0.8vw,1.6rem)' }}>{paper.title}</h1><div className="facts"><span>{qs.length} questions</span><span>{Math.round(paper.seconds / 60)} minutes</span><span>+1 / −{neg(paper.negative)}</span><span>{paper.langs.map((l) => LBL[l]).join(' · ')}</span></div></div>
          </div>
        </div>
        <div className="grid g4 section" style={{ marginTop: 16 }}>
          {[['memo', `${qs.length}`, 'questions'], ['stopwatch', `${Math.round(paper.seconds / 60)} min`, 'time limit'], ['check', '+1', 'per correct'], ['target', `−${neg(paper.negative)}`, 'per wrong']].map(([i, b, l]) => (
            <div key={l} className="card pad row" style={{ gap: 10 }}>{I(i, 34)}<div><b style={{ fontSize: '1.2rem', display: 'block', lineHeight: 1.1 }}>{b}</b><span className="muted tiny">{l}</span></div></div>
          ))}
        </div>
        <div className="card pad-lg section" style={{ marginTop: 14 }}>
          <h2>Instructions</h2>
          <ol style={{ paddingLeft: 20, margin: '0 0 14px', display: 'grid', gap: 6 }}>
            <li>The clock starts when you press Start; the test submits itself when time ends.</li>
            <li>Select an option, then <b>Save &amp; Next</b>. <b>Mark for Review</b> flags a question; a marked question with an answer is still evaluated.</li>
            <li>Use the palette to jump to any question. Colours show each question’s status.</li>
            <li>Progress is saved on this device — you can close the tab and resume.</li>
          </ol>
          <div className="legend" style={{ maxWidth: 520 }}>
            <span><i className="pal" /> Not visited</span><span><i className="pal visited" /> Not answered</span><span><i className="pal answered" /> Answered</span><span><i className="pal marked" /> Marked for review</span>
          </div>
          {paper.langs.length > 1 && (
            <div className="row" style={{ marginBottom: 14 }}>
              <b className="small">Default language</b>
              <div className="seg" role="group" aria-label="Default language">{paper.langs.map((l) => <button key={l} type="button" aria-pressed={s.lang === l} onClick={() => setS((p) => ({ ...p, lang: l }))}>{LBL[l]}</button>)}</div>
            </div>
          )}
          <label className="check-line"><input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} /><span>I have read the instructions and I am ready.</span></label>
          <div className="row">
            <button className="btn btn-primary btn-lg" disabled={!ready && !resumable} onClick={() => setS((p) => ({ ...p, stage: 'test' }))}>{resumable ? `Resume (${fmt(s.left)} left)` : 'Start test'}</button>
            {resumable && <button className="btn btn-ghost" onClick={restart}>Start over</button>}
            <a className="btn btn-ghost" href={paper.paperUrl}>{paper.backLabel ?? 'Back to practice'}</a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Result ---------------- */
  if (s.stage === 'result') {
    const pctScore = Math.max(0, (R.score / qs.length) * 100);
    const verdict = pctScore >= 70 ? ['Excellent!', 'good'] : pctScore >= 45 ? ['Good attempt', 'brand'] : ['Keep going', 'warn'];
    const shareText = `I scored ${R.score.toFixed(2)}/${qs.length} (${Math.round(R.acc)}% accuracy) in ${paper.title} on SarkariResultOut. Try it free: https://sarkariresultout.com${paper.paperUrl}`;
    const strong = R.chapters.filter((c) => c.acc !== null && c.acc >= 70 && c.r + c.w >= 1).slice(0, 3);
    const weak = R.chapters.filter((c) => c.acc !== null && c.acc < 50).slice(0, 3);
    const ideal = paper.seconds / qs.length;
    const avg = R.used / Math.max(1, R.right + R.wrong);
    const insights = [
      strong[0] && `Your strongest area is ${strong[0].name} (${Math.round(strong[0].acc!)}% accuracy) — keep it warm with weekly revision.`,
      weak[0] && `Focus next on ${weak[0].name}: ${weak[0].w} wrong out of ${weak[0].r + weak[0].w} attempted.`,
      R.wrong > 0 && paper.negative > 0 && `Negative marking cost you ${R.lost.toFixed(2)} marks. Skip a question when you can't eliminate two options.`,
      R.skipped > 0 && `${R.skipped} question${R.skipped > 1 ? 's were' : ' was'} left unattempted — review them in Solutions.`,
      `You spent ${Math.round(avg)} s per attempted question against an ideal of ${Math.round(ideal)} s.`,
    ].filter(Boolean) as string[];
    const list = qs.filter((x) => { const a = s.ans[x.id]; return filter === 'right' ? a === x.answer : filter === 'wrong' ? a && a !== x.answer : filter === 'skip' ? !a : true; });
    const slow = [...qs].sort((a, b) => (s.spent[b.id] ?? 0) - (s.spent[a.id] ?? 0)).slice(0, 6);
    const maxT = Math.max(1, ...slow.map((x) => s.spent[x.id] ?? 0));

    const scorecard = () => {
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d')!;
      const grd = g.createLinearGradient(0, 0, 1080, 1350); grd.addColorStop(0, '#14161f'); grd.addColorStop(1, '#3a2350'); g.fillStyle = grd; g.fillRect(0, 0, 1080, 1350);
      g.fillStyle = '#f5b82e'; g.font = '800 44px system-ui'; g.fillText('SarkariResultOut', 80, 130);
      g.fillStyle = '#fff'; g.font = '800 64px system-ui'; const words = paper.title.split(' '); let line = '', y = 260;
      words.forEach((w) => { if (g.measureText(line + w).width > 920) { g.fillText(line, 80, y); line = ''; y += 76; } line += w + ' '; }); g.fillText(line, 80, y);
      g.font = '900 200px system-ui'; g.fillText(R.score.toFixed(1), 80, y + 280); g.font = '700 60px system-ui'; g.fillStyle = '#c9c2b6'; g.fillText(`out of ${qs.length}`, 80, y + 360);
      g.fillStyle = '#fff'; g.font = '700 48px system-ui'; g.fillText(`✓ ${R.right} correct   ✗ ${R.wrong} wrong   ${Math.round(R.acc)}% accuracy`, 80, y + 480);
      g.fillStyle = '#f5b82e'; g.font = '800 46px system-ui'; g.fillText('Can you beat my score?', 80, 1180); g.fillStyle = '#fff'; g.font = '600 38px system-ui'; g.fillText('sarkariresultout.com  ·  t.me/nataregistration', 80, 1250);
      c.toBlob((b) => { if (!b) return; const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'sro-scorecard.png'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); });
    };

    return (
      <div className="wrap" style={{ maxWidth: 1060 }}>
        <div className="card pad section row" style={{ gap: 14, marginTop: 16 }}>
          <Cover c={paper.cover} size={72} tag={paper.tag} />
          <div className="grow" style={{ minWidth: 0 }}><span className="chip brand">Test result</span><h1 style={{ fontSize: 'clamp(1.15rem,1rem+0.8vw,1.5rem)', margin: '6px 0 2px' }}>{paper.title}</h1><span className="muted small">{qs.length} questions · time used {fmt(R.used)}</span></div>
        </div>

        <div className="card res-hero" style={{ marginTop: 14 }}>
          <div className="res-score">
            <span className="muted small">Your score</span><br /><b className="nums">{R.score.toFixed(2)}</b><small> / {qs.length}</small><br />
            <span className={`chip ${verdict[1]}`} style={{ marginTop: 8 }}>{verdict[0]}</span>
          </div>
          <div className="ring-wrap"><div className="ring" style={{ ['--p' as string]: Math.round(R.acc), ['--c' as string]: R.acc >= 60 ? 'var(--good-2)' : R.acc >= 40 ? 'var(--gold)' : 'var(--bad-2)' } as React.CSSProperties}><div><span><b className="nums">{Math.round(R.acc)}%</b><br /><span className="muted tiny">accuracy</span></span></div></div></div>
          <div style={{ textAlign: 'center' }}>
            {I('trophy', 64)}
            <div className="muted small" style={{ fontWeight: 700 }}>Shift rank</div>
            {paper.noRank ? <div className="small muted" style={{ maxWidth: 200, margin: '6px auto 0' }}>{paper.noRank}</div> : <RankBox paperKey={paper.key} answers={s.ans} seconds={R.used} />}
          </div>
        </div>

        <div className="stat-tiles" style={{ marginTop: 12 }}>
          <div className="card stat"><span className="lbl">{I('check', 20)} Correct</span><b className="nums">{R.right}</b><span className="pct" style={{ color: 'var(--good)' }}>{Math.round((R.right / qs.length) * 100)}%</span></div>
          <div className="card stat"><span className="lbl">{I('target', 20)} Incorrect</span><b className="nums">{R.wrong}</b><span className="pct" style={{ color: 'var(--bad)' }}>−{R.lost.toFixed(2)} marks</span></div>
          <div className="card stat"><span className="lbl">{I('hourglass', 20)} Unattempted</span><b className="nums">{R.skipped}</b><span className="pct muted">{Math.round((R.skipped / qs.length) * 100)}%</span></div>
          <div className="card stat"><span className="lbl">{I('stopwatch', 20)} Time / question</span><b className="nums">{Math.round(avg)}s</b><span className="pct muted">ideal {Math.round(ideal)}s</span></div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <a className="btn btn-primary" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} rel="noopener nofollow">Share on WhatsApp</a>
          <a className="btn btn-soft" href={`https://t.me/share/url?url=${encodeURIComponent('https://sarkariresultout.com' + paper.paperUrl)}&text=${encodeURIComponent(shareText)}`} rel="noopener nofollow">Telegram</a>
          <button className="btn btn-ghost" onClick={scorecard}>Download scorecard</button>
          <button className="btn btn-ghost" onClick={restart}>Re-attempt</button>
        </div>

        <nav className="tabs" style={{ top: 0, position: 'relative' }}>
          {(['overview', 'chapters', 'time', 'solutions'] as const).map((k) => (<a key={k} href={`#${k}`} aria-current={tab === k ? 'true' : undefined} onClick={(e) => { e.preventDefault(); setTab(k); }}>{k === 'overview' ? 'Overview' : k === 'chapters' ? 'Chapter analysis' : k === 'time' ? 'Time analysis' : `Solutions (${qs.length})`}</a>))}
        </nav>

        {tab === 'overview' && (
          <div className="stack">
            <div className="grid g2">
              <div className="card pad">
                <h3>Chapter-wise score</h3>
                <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
                  <Donut size={140} label={`${Math.round(pctScore)}%`} sub="overall" parts={R.chapters.map((c, i) => ({ v: Math.max(0.0001, c.r), c: COLORS[i % COLORS.length] }))} />
                  <div className="chart-legend grow">{R.chapters.slice(0, 6).map((c, i) => (<div key={c.name}><i style={{ background: COLORS[i % COLORS.length] }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span><b className="nums">{c.r}/{c.n}</b><span className="muted nums">{c.acc === null ? '—' : `${Math.round(c.acc)}%`}</span></div>))}</div>
                </div>
              </div>
              <div className="card pad"><h3>Accuracy across the paper</h3><Trend pts={R.trend} /></div>
              <div className="card pad">
                <h3>Time management</h3>
                <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
                  <Donut size={130} label={`${Math.round(R.used / 60)}m`} sub="time used" parts={[{ v: R.used, c: '#c9480f' }, { v: Math.max(0, paper.seconds - R.used), c: 'var(--surface-3)' }]} />
                  <div className="chart-legend grow"><div><i style={{ background: '#c9480f' }} /><span>Time taken</span><b>{mmss(R.used)}</b><span /></div><div><i style={{ background: '#12a150' }} /><span>Time allowed</span><b>{mmss(paper.seconds)}</b><span /></div><div><i style={{ background: '#f97316' }} /><span>Time saved</span><b>{mmss(Math.max(0, paper.seconds - R.used))}</b><span /></div></div>
                </div>
              </div>
              <div className="card pad">
                <h3>Attempt breakdown</h3>
                <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
                  <Donut size={130} label={`${qs.length}`} sub="questions" parts={[{ v: R.right, c: '#12a150' }, { v: R.wrong, c: '#ef5656' }, { v: R.skipped, c: '#94a3b8' }]} />
                  <div className="chart-legend grow"><div><i style={{ background: '#12a150' }} /><span>Correct</span><b>{R.right}</b><span /></div><div><i style={{ background: '#ef5656' }} /><span>Incorrect</span><b>{R.wrong}</b><span /></div><div><i style={{ background: '#94a3b8' }} /><span>Unattempted</span><b>{R.skipped}</b><span /></div></div>
                </div>
              </div>
            </div>
            <div className="grid g2">
              <div className="card pad strength"><h3 className="row" style={{ gap: 8 }}>{I('muscle', 26)} Your strengths</h3>{strong.length ? strong.map((c) => (<div key={c.name} className="row between small" style={{ padding: '4px 0' }}><span>✓ {c.name}</span><b>{Math.round(c.acc!)}%</b></div>)) : <p className="small muted" style={{ margin: 0 }}>Attempt more questions to see strengths.</p>}</div>
              <div className="card pad weak"><h3 className="row" style={{ gap: 8 }}>{I('trend', 26)} Needs improvement</h3>{weak.length ? weak.map((c) => (<div key={c.name} className="row between small" style={{ padding: '4px 0' }}><span>↗ {c.name}</span><b>{Math.round(c.acc!)}%</b></div>)) : <p className="small muted" style={{ margin: 0 }}>No weak chapter in this attempt — great!</p>}</div>
            </div>
            <div className="card pad-lg" style={{ background: 'var(--brand-50)', borderColor: 'transparent' }}>
              <h3 className="row" style={{ gap: 8 }}>{I('bulb', 28)} Personalised insights</h3>
              {insights.map((x) => (<div key={x} className="insight"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg><span>{x}</span></div>))}
            </div>
            <div className="card pad">
              <h3 className="row" style={{ gap: 8 }}>{I('medal', 26)} Shift leaderboard</h3>
              <p className="small muted" style={{ margin: '0 0 10px' }}>Live ranks for this shift appear here once you sign in and other students submit. Your attempt is already saved on this device.</p>
              {[1, 2, 3].map((n) => (<div key={n} className="lb-row blur" aria-hidden="true"><b>#{n}</b><span className="avatar" style={{ background: COLORS[n] }}>S</span><span>Student</span><b>—</b></div>))}
              <button type="button" className="btn btn-primary btn-sm" data-login="Sign in to see the leaderboard for this paper." style={{ marginTop: 10 }}>Sign in to see the leaderboard</button>
            </div>
          </div>
        )}

        {tab === 'chapters' && (
          <div className="card pad tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Chapter</th><th className="num">Qs</th><th className="num">✓</th><th className="num">✗</th><th>Accuracy</th><th className="num">Time</th></tr></thead>
              <tbody>{R.chapters.map((c, i) => (<tr key={c.name}><td><span className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flex: 'none' }} />{c.name}</span></td><td className="num">{c.n}</td><td className="num" style={{ color: 'var(--good)' }}>{c.r}</td><td className="num" style={{ color: 'var(--bad)' }}>{c.w}</td><td style={{ minWidth: 140 }}>{c.acc === null ? <span className="muted">Not attempted</span> : <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><div className="bar grow"><i style={{ width: `${c.acc}%`, background: c.acc >= 70 ? 'var(--good-2)' : c.acc >= 40 ? 'var(--gold)' : 'var(--bad-2)' }} /></div><b className="small nums">{Math.round(c.acc)}%</b></div>}</td><td className="num">{mmss(c.t)}</td></tr>))}</tbody>
            </table>
          </div>
        )}

        {tab === 'time' && (
          <div className="grid g2">
            <div className="card pad"><h3>Slowest questions</h3>{slow.map((x) => (<div key={x.id} style={{ padding: '6px 0' }}><div className="row between small"><span>Q{x.qNo} · {x.topic}</span><b className="nums">{s.spent[x.id] ?? 0}s</b></div><div className="bar"><i style={{ width: `${((s.spent[x.id] ?? 0) / maxT) * 100}%`, background: s.ans[x.id] === x.answer ? 'var(--good-2)' : s.ans[x.id] ? 'var(--bad-2)' : '#94a3b8' }} /></div></div>))}</div>
            <div className="card pad"><h3>How to use this</h3><div className="insight">{I('stopwatch', 24)}<span>Questions above {Math.round(ideal * 1.5)} s are time sinks. In the real exam, mark them for review and come back.</span></div><div className="insight">{I('target', 24)}<span>A slow <b>wrong</b> answer costs twice: time and negative marks.</span></div></div>
          </div>
        )}

        {tab === 'solutions' && (
          <div>
            <div className="filters" style={{ marginBottom: 12 }}>{([['all', `All ${qs.length}`], ['right', `Correct ${R.right}`], ['wrong', `Wrong ${R.wrong}`], ['skip', `Skipped ${R.skipped}`]] as const).map(([k, l]) => (<button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>))}</div>
            <div className="stack">
              {list.map((x) => { const tx = t(x), a = s.ans[x.id]; return (
                <div key={x.id} className="card q" lang={s.lang}>
                  <div className="q-head"><span className="q-no">Q{x.qNo}</span>{!a ? <span className="chip">Skipped</span> : a === x.answer ? <span className="chip good">Correct</span> : <span className="chip bad">Wrong</span>}<span className="chip">{x.topic}</span><span className="muted tiny" style={{ marginLeft: 'auto' }}>{s.spent[x.id] ?? 0}s</span></div>
                  <div className={`q-stem ${s.lang}`}><Stem text={tx.stem} /></div>
                  {x.figure && <figure className="q-fig"><img src={x.figure} alt={`Figure for question ${x.qNo}`} loading="lazy" /></figure>}
                  <ul className="opts">{tx.options.map((o, i) => { const k = KEYS[i]; const cls = k === x.answer ? ' is-correct' : k === a ? ' is-wrong' : ''; return (<li key={k}><div className={`opt${cls}`}><span className="k">{k}</span><span><Inline text={o} /></span>{k === a && <span className="mark" style={{ color: k === x.answer ? 'var(--good)' : 'var(--bad)' }}>Your answer</span>}</div></li>); })}</ul>
                  <div className="callout concept" style={{ marginTop: 12 }}>{I('brain', 24)}<div><b>Solution</b><div><Inline text={tx.quick} /></div></div></div>
                  {x.slug && <div className="q-foot"><a href={`/question/${x.slug}/`}>Full solution →</a></div>}
                </div>); })}
              {list.length === 0 && <div className="empty card">Nothing in this filter.</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- Test (CBT) ---------------- */
  const tx = t(q);
  const done = counts.answered + counts.markedAns;
  const unanswered = qs.length - done;
  const pal = (x: TQ, i: number) => { const a = !!s.ans[x.id], m = !!s.mark[x.id], v = !!s.seen[x.id]; const cls = m ? `marked${a ? ' ans' : ''}` : a ? 'answered' : v ? 'visited' : ''; return (<button key={x.id} type="button" className={`pal ${cls}${i === s.cur ? ' current' : ''}`} onClick={() => go(i)} aria-label={`Question ${i + 1}${a ? ', answered' : ''}${m ? ', marked for review' : ''}`} aria-current={i === s.cur ? 'true' : undefined}>{i + 1}</button>); };
  const secNow = sections.length > 1 ? sections.find((x) => s.cur >= x.from && s.cur < x.to) : undefined;
  return (
    <div className="cbt">
      <header className="cbt-head">
        <div className="cbt-top">
          <span className="cbt-logo" aria-hidden="true">SRO</span>
          <div className="cbt-name"><span className="title">{paper.title}</span><span className="cbt-meta">{paper.examShort} · {qs.length} questions · +1 / −{neg(paper.negative)}</span></div>
          <span className={`timer${s.left <= 300 ? ' low' : ''}`} role="timer" aria-live="off" aria-label={`Time left ${fmt(s.left)}`}><Ico d="M12 7v5l3 2M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 2h6" /><span><small>Time left</small>{fmt(s.left)}</span></span>
          <button type="button" className="cbt-submit" onClick={() => setConfirm(true)}><Ico d="M5 12l5 5L20 7" /> <span className="lg-only">Submit test</span><span className="sm-only">Submit</span></button>
        </div>
        <div className="cbt-progress" aria-hidden="true"><i style={{ width: `${(done / qs.length) * 100}%` }} /></div>
        <div className="cbt-sub">
          <b className="cbt-qn">Q {s.cur + 1}<span>/{qs.length}</span></b>
          <span className="cbt-qt muted tiny"><Ico d="M12 7v5l3 2M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" s={13} /> {mmss(s.spent[q.id] ?? 0)}</span>
          <span className="grow" />
          {paper.langs.length > 1 && (<div className="seg seg-sm" role="group" aria-label="Question language">{paper.langs.map((l) => <button key={l} type="button" aria-pressed={s.lang === l} onClick={() => setS((p) => ({ ...p, lang: l }))}>{LBL[l]}</button>)}</div>)}
          <button type="button" className="cbt-icon" onClick={() => setFs((f) => (f + 1) % 3)} aria-label="Change text size" title="Text size"><b>A</b><small>A</small></button>
          <button type="button" className="cbt-pal-btn" onClick={() => setPaletteOpen(true)} aria-label="Open question palette"><Ico d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" s={15} /> <span>{done}/{qs.length}</span></button>
        </div>
        {sections.length > 1 && (
          <nav className="cbt-secs" aria-label="Sections">{sections.map((x) => { const a = qs.slice(x.from, x.to).filter((y) => s.ans[y.id]).length; return (<button key={x.name} type="button" aria-current={secNow?.name === x.name ? 'true' : undefined} onClick={() => go(x.from)}>{x.name}<span>{a}/{x.to - x.from}</span></button>); })}</nav>
        )}
      </header>

      <div className="cbt-body">
        <main className={`cbt-main fs${fs}`} lang={s.lang} ref={mainRef}>
          <article className="cbt-q">
            <div className="cbt-q-head">
              <span className="q-no">Question {s.cur + 1}</span>
              {s.mark[q.id] && <span className="chip cbt-marked"><Ico d="M5 21V4h11l-2 4 2 4H5" s={12} /> Marked for review</span>}
              {s.ans[q.id] && <span className="chip good">Answered</span>}
            </div>
            <div className={`q-stem ${s.lang}`}><Stem text={tx.stem} /></div>
            {q.figure && <figure className="q-fig"><img src={q.figure} alt={`Figure for question ${s.cur + 1}`} /></figure>}
            <ul className="opts" role="radiogroup" aria-label={`Options for question ${s.cur + 1}`}>
              {tx.options.map((o, i) => { const k = KEYS[i], on = s.ans[q.id] === k; return (<li key={k}><button type="button" role="radio" aria-checked={on} className={`opt${on ? ' is-picked' : ''}`} onClick={() => pick(k)}><span className="k">{k}</span><span><Inline text={o} /></span></button></li>); })}
            </ul>
            <p className="cbt-keys tiny muted">Shortcuts: <kbd>A</kbd>–<kbd>D</kbd> select · <kbd>→</kbd> save &amp; next · <kbd>←</kbd> previous · <kbd>M</kbd> mark</p>
          </article>
        </main>

        {paletteOpen && <div className="cbt-scrim" onClick={() => setPaletteOpen(false)} aria-hidden="true" />}
        <aside className={`cbt-side${paletteOpen ? ' open' : ''}`} aria-label="Question palette">
          <div className="cs-head"><span className="cs-grip" aria-hidden="true" /><b>Question palette</b><button type="button" className="cbt-icon cs-close" onClick={() => setPaletteOpen(false)} aria-label="Close palette"><Ico d="M6 6l12 12M18 6L6 18" /></button></div>
          <div className="cs-stats">
            <div><i className="pal answered" /><b>{counts.answered}</b><span>Answered</span></div>
            <div><i className="pal visited" /><b>{counts.notAnswered}</b><span>Not answered</span></div>
            <div><i className="pal" /><b>{counts.notVisited}</b><span>Not visited</span></div>
            <div><i className="pal marked" /><b>{counts.marked}</b><span>Marked</span></div>
            <div className="wide"><i className="pal marked ans" /><b>{counts.markedAns}</b><span>Marked &amp; answered (will be evaluated)</span></div>
          </div>
          <div className="cs-scroll">
            {sections.length > 1 ? sections.map((x) => (<div key={x.name} className="cs-group"><div className="cs-gh"><b>{x.name}</b><span>{qs.slice(x.from, x.to).filter((y) => s.ans[y.id]).length}/{x.to - x.from}</span></div><div className="palette">{qs.slice(x.from, x.to).map((y, j) => pal(y, x.from + j))}</div></div>)) : <div className="palette">{qs.map(pal)}</div>}
          </div>
          <div className="cs-foot">
            <div className="cs-done"><span>{done} of {qs.length} answered</span><span className="nums">{fmt(s.left)} left</span></div>
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => { setPaletteOpen(false); setConfirm(true); }}>Submit test</button>
          </div>
        </aside>
      </div>

      <footer className="cbt-bottom">
        <button type="button" className="btn btn-ghost cb-mark" onClick={markNext} aria-pressed={!!s.mark[q.id]}><Ico d="M5 21V4h11l-2 4 2 4H5" s={16} /><span className="lg-only">{s.mark[q.id] ? 'Unmark & next' : 'Mark for review & next'}</span><span className="sm-only">{s.mark[q.id] ? 'Unmark' : 'Review'}</span></button>
        <button type="button" className="btn btn-ghost cb-clear" onClick={clear} disabled={!s.ans[q.id]}><Ico d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" s={16} /><span className="lg-only">Clear response</span><span className="sm-only">Clear</span></button>
        <span className="grow" />
        <button type="button" className="btn btn-ghost cb-prev" onClick={() => go(s.cur - 1)} disabled={s.cur === 0} aria-label="Previous question"><Ico d="M15 6l-6 6 6 6" s={16} /><span className="lg-only">Previous</span></button>
        {s.cur < qs.length - 1 ? <button type="button" className="btn btn-primary cb-next" onClick={() => go(s.cur + 1)}>Save &amp; next <Ico d="M9 6l6 6-6 6" s={16} /></button> : <button type="button" className="btn btn-primary cb-next" onClick={() => setConfirm(true)}>Save &amp; submit <Ico d="M5 12l5 5L20 7" s={16} /></button>}
      </footer>

      {confirm && (
        <div className="modal-back cbt-confirm" role="dialog" aria-modal="true" aria-labelledby="sub-h" onClick={(e) => { if (e.target === e.currentTarget) setConfirm(false); }}>
          <div className="modal">
            <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>{I('flag', 36)}<div><h2 id="sub-h" style={{ margin: 0 }}>Submit the test?</h2><span className="small muted">You cannot change answers after submitting.</span></div></div>
            <div className="sub-sum">
              <div className="ok"><b className="nums">{done}</b><span>Answered</span></div>
              <div className="no"><b className="nums">{counts.notAnswered + counts.marked}</b><span>Not answered</span></div>
              <div><b className="nums">{counts.notVisited}</b><span>Not visited</span></div>
              <div><b className="nums">{fmt(s.left)}</b><span>Time left</span></div>
            </div>
            {sections.length > 1 && (
              <div className="tbl-wrap" style={{ marginBottom: 12 }}><table className="tbl"><thead><tr><th>Section</th><th className="num">Answered</th><th className="num">Left</th></tr></thead><tbody>{sections.map((x) => { const a = qs.slice(x.from, x.to).filter((y) => s.ans[y.id]).length; return (<tr key={x.name}><td>{x.name}</td><td className="num">{a}</td><td className="num">{x.to - x.from - a}</td></tr>); })}</tbody></table></div>
            )}
            {unanswered > 0 && s.left > 60 && <p className="sub-warn small">{unanswered} question{unanswered > 1 ? 's are' : ' is'} still unanswered and you have {hm(s.left)} left. A careful second look often adds marks.</p>}
            <div className="sub-act"><button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)} autoFocus>Keep working</button><button type="button" className="btn btn-primary" onClick={submit}>Yes, submit test</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
