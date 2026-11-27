'use client';
// Runs a mock test. Free mocks: every question is in the page. Premium (SRO Jeet) mocks: the page carries only the
// free preview; the full paper is fetched from SRO Studio (/wp-json/sro-studio/v1/mock), which checks the plan.
import { useCallback, useEffect, useState } from 'react';
import TestEngine, { type TPaper } from './TestEngine';
import { toTQ } from '@/lib/tpaper';
import type { Question } from '@/lib/types';
import * as api from '@/lib/api';
import { asset } from './I3D';

const STUDIO = api.API ? api.API.replace(/\/sro\/v1\/?$/, '/sro-studio/v1') : '';
type Gate = 'checking' | 'full' | 'login' | 'locked' | 'preview' | 'error';

export default function MockRunner({ paper, premium, exam, slug, total, perQ, price, testPrice = 0 }: { paper: TPaper; premium: boolean; exam: string; slug: string; total: number; perQ: number; price: number; testPrice?: number }) {
  const [gate, setGate] = useState<Gate>(premium ? 'checking' : 'full');
  const [full, setFull] = useState<TPaper | null>(premium ? null : paper);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!premium) return;
    if (!STUDIO) { setGate('locked'); setMsg('Members get the full test once the site is connected.'); return; }
    setGate('checking');
    try {
      const r = await fetch(`${STUDIO}/mock?exam=${encodeURIComponent(exam)}&paper=${encodeURIComponent(slug)}`, { credentials: 'include', cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(d.questions) && d.questions.length) {
        const qs = (d.questions as Question[]).map((q) => toTQ(q, false));
        setFull({ ...paper, questions: qs, seconds: Math.round(perQ * qs.length) });
        setGate('full');
        return;
      }
      setMsg(d.message || 'Could not open the test right now. Please try again in a minute.');
      setGate(r.status === 401 ? 'login' : r.status === 403 ? 'locked' : 'error');
    } catch { setGate('error'); setMsg('Could not reach the server. Check your internet and try again.'); }
  }, [premium, exam, slug, paper, perQ]);

  useEffect(() => {
    load();
    const on = () => load(); // signed in or bought SRO Jeet in the sheet → try again
    window.addEventListener('sro:user', on);
    return () => window.removeEventListener('sro:user', on);
  }, [load]);

  if (gate === 'full' && full) return <TestEngine key="full" paper={full} />;
  if (gate === 'preview') return <TestEngine key="preview" paper={{ ...paper, key: `${paper.key}/preview`, title: `${paper.title} · Free preview`, noRank: 'All-India rank is for the full test. Unlock it with SRO Jeet.' }} />;

  const n = paper.questions.length;
  return (
    <div className="wrap" style={{ maxWidth: 760 }}>
      <div className="card pad-lg section mock-gate" style={{ marginTop: 24, textAlign: 'center' }}>
        <img src={asset('/i3d/crown.webp')} width={72} height={72} alt="" className="i3d" />
        <span className="chip gold" style={{ margin: '10px auto' }}>SRO Jeet mock test</span>
        <h1 style={{ fontSize: 'clamp(1.2rem,1rem + 0.8vw,1.55rem)' }}>{paper.title}</h1>
        <p className="muted">{total} questions · {Math.round((perQ * total) / 60)} minutes · All-India rank and full solutions</p>
        {gate === 'checking' ? <p className="muted small">Checking your access…</p> : (
          <>
            {msg && gate === 'error' && <p className="small" style={{ color: 'var(--bad)' }}>{msg}</p>}
            <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 8 }}>
              {gate === 'login' && <button type="button" className="btn btn-primary btn-lg" data-login="Sign in to start this mock test. If you bought it on the old site, use the same Google account.">Sign in to start</button>}
              {(gate === 'locked' || gate === 'login') && testPrice > 0 && <button type="button" className="btn btn-primary btn-lg" data-checkout="mock" data-direct="1" data-paper={`${exam}/${slug}`} data-price={testPrice} data-title={paper.title} data-exam={exam} data-exam-short={paper.examShort}>Buy this test · ₹{testPrice}</button>}
              {(gate === 'locked' || gate === 'login') && <button type="button" className="btn btn-gold btn-lg" data-checkout="jeet-exam" data-direct="1" data-exam={exam}>All {paper.examShort} tests · ₹{price}/yr</button>}
              {gate === 'error' && <button type="button" className="btn btn-primary" onClick={load}>Try again</button>}
            </div>
            {n > 0 && <button type="button" className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setGate('preview')}>Attempt the free preview ({n} question{n === 1 ? '' : 's'})</button>}
            <p className="tiny muted" style={{ marginTop: 12 }}>One payment unlocks every {paper.examShort} mock test, previous year paper test and chapter test for a year. No auto-renewal.</p>
          </>
        )}
        <p style={{ marginTop: 6 }}><a className="small" href={paper.paperUrl}>← Back to the test page</a></p>
      </div>
    </div>
  );
}
