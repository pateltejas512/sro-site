'use client';
import { useEffect, useState } from 'react';
import Link from '@/components/SmartLink';
import I3D from './I3D';
import { revision, removeRevision, today, type RevItem } from '@/lib/local';

const BOX = ['', 'Tomorrow', '3 days', '7 days', '15 days', '30 days'];
const API = process.env.NEXT_PUBLIC_SRO_API;

export default function Revision() {
  const [items, setItems] = useState<RevItem[] | null>(null);
  const [tab, setTab] = useState<'due' | 'all'>('due');
  useEffect(() => {
    const load = () => setItems(Object.values(revision()).sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box));
    load();
    window.addEventListener('sro:rev', load);
    // Signed-in students: merge with the copy saved on the server so revision follows them across devices.
    if (API) fetch(`${API}/progress`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d?.rev) return;
      try {
        const mine = revision();
        for (const [k, v] of Object.entries(d.rev as Record<string, RevItem>)) if (!mine[k] || mine[k].at < v.at) mine[k] = v;
        localStorage.setItem('sro:rev', JSON.stringify(mine));
        load();
        fetch(`${API}/progress`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-SRO': '1' }, body: JSON.stringify({ rev: mine }) }).catch(() => {});
      } catch {}
    }).catch(() => {});
    return () => window.removeEventListener('sro:rev', load);
  }, []);

  if (!items) return <div className="card pad-lg section" style={{ minHeight: 160 }} />;
  const t = today();
  const due = items.filter((r) => r.due <= t);
  const list = tab === 'due' ? due : items;
  const byTopic = Object.entries(items.reduce<Record<string, number>>((m, r) => ((m[r.topic] = (m[r.topic] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (!items.length) return (
    <div className="card pad-lg section empty">
      <I3D name="target" size={72} />
      <h2>No mistakes saved yet</h2>
      <p className="muted">Solve any chapter. Every question you get wrong is added here automatically and brought back at the right time.</p>
      <Link className="btn btn-primary" href="/mcq/">Start practising</Link>
    </div>
  );

  return (
    <div className="layout section">
      <div>
        <div className="kpis rev-kpis">
          <div className="card kpi-c"><b className="nums">{due.length}</b><span>due today</span></div>
          <div className="card kpi-c"><b className="nums">{items.length}</b><span>in revision</span></div>
          <div className="card kpi-c"><b className="nums">{items.filter((r) => r.box >= 4).length}</b><span>almost mastered</span></div>
        </div>
        <div className="seg" role="tablist" aria-label="Revision list" style={{ margin: '14px 0' }}>
          <button type="button" role="tab" aria-selected={tab === 'due'} onClick={() => setTab('due')}>Due today · {due.length}</button>
          <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>All · {items.length}</button>
        </div>
        {list.length === 0 ? (
          <div className="card pad-lg empty"><I3D name="party" size={64} /><h2>All done for today</h2><p className="muted">Come back tomorrow — your next questions are already scheduled.</p></div>
        ) : (
          <ul className="rev-list">
            {list.map((r) => (
              <li key={r.id} className="card">
                <Link href={`${r.url}#revise`} className="rev-q">
                  <span className="rev-box" aria-label={`Box ${r.box} of 5`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= r.box ? 'on' : ''} />)}</span>
                  <span className="grow"><b>{r.text}</b><small>{r.topic} · {r.due <= t ? 'Due now' : `Next: ${BOX[r.box]}`}{r.wrong > 1 ? ` · wrong ${r.wrong}×` : ''}</small></span>
                  <span className="btn btn-soft btn-sm">{r.due <= t ? 'Revise' : 'Open'}</span>
                </Link>
                <button type="button" className="tool rev-x" aria-label="Remove from revision" onClick={() => removeRevision(r.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <aside className="aside">
        <div className="card pad"><h3 className="row" style={{ gap: 8 }}><I3D name="chart" size={24} /> Weak topics</h3>
          <ul className="list-plain">{byTopic.map(([topic, n]) => (<li key={topic}><span className="grow">{topic}</span><span className="chip bad">{n}</span></li>))}</ul>
        </div>
        <div className="promo dark"><div className="content"><h3>Turn mistakes into rank</h3><p>SRO Jeet builds a timed daily test from these topics and shows your All-India rank.</p><button type="button" className="btn btn-gold btn-sm" data-checkout="jeet-yr">Get SRO Jeet ₹349</button></div><I3D name="trophy" size={96} className="art" /></div>
      </aside>
    </div>
  );
}
