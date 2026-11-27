'use client';
import { useEffect, useState } from 'react';
import { activeDays, attempts, bookmarks, recent, streak, dueCount, type AttemptLog, type Bookmark, type Recent } from '@/lib/local';
import I3D from './I3D';

export default function MyDashboard() {
  const [d, setD] = useState<{ days: string[]; st: number; at: AttemptLog[]; bm: Bookmark[]; rc: Recent[]; due: number } | null>(null);
  useEffect(() => { setD({ days: activeDays(), st: streak(), at: attempts(), bm: bookmarks(), rc: recent(), due: dueCount() }); }, []);
  if (!d) return <div className="empty card">Loading your progress…</div>;
  const set = new Set(d.days);
  const cal = Array.from({ length: 28 }, (_, i) => { const x = new Date(); x.setDate(x.getDate() - (27 - i)); const k = x.toISOString().slice(0, 10); return { k, on: set.has(k), day: x.getDate() }; });
  const best = d.at.reduce((m, a) => Math.max(m, a.total ? (a.score / a.total) * 100 : 0), 0);
  return (
    <div className="stack">
      <div className="stat-tiles">
        <div className="card stat"><span className="lbl"><I3D name="fire" size={20} /> Current streak</span><b className="nums">{d.st} day{d.st === 1 ? '' : 's'}</b></div>
        <div className="card stat"><span className="lbl"><I3D name="calendar" size={20} /> Active days</span><b className="nums">{d.days.length}</b></div>
        <div className="card stat"><span className="lbl"><I3D name="memo" size={20} /> Tests taken</span><b className="nums">{d.at.length}</b></div>
        <div className="card stat"><span className="lbl"><I3D name="trophy" size={20} /> Best score</span><b className="nums">{Math.round(best)}%</b></div>
      </div>
      <div className="grid g2">
        <div className="card pad">
          <h3 className="row" style={{ gap: 8 }}><I3D name="fire" size={24} /> Last 4 weeks</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {cal.map((c) => (<div key={c.k} title={c.k} style={{ aspectRatio: '1', borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 700, background: c.on ? 'linear-gradient(135deg,#f2662a,#f5b82e)' : 'var(--surface-2)', color: c.on ? '#3b2600' : 'var(--muted)' }}>{c.day}</div>))}
          </div>
          <p className="tiny muted" style={{ margin: '10px 0 0' }}>Answer at least one question a day to keep your streak.</p>
        </div>
        <div className="card pad">
          <a href="/revise/" className="rev-cta"><I3D name="repeat" size={36} /><span className="grow"><b>My Revision</b><small>{d.due ? `${d.due} question${d.due > 1 ? 's' : ''} due today` : 'Nothing due — your mistakes return on schedule'}</small></span><span className="btn btn-primary btn-sm">{d.due ? 'Revise now' : 'Open'}</span></a>
          <h3 className="row" style={{ gap: 8, marginTop: 14 }}><I3D name="rocket" size={24} /> Continue</h3>
          {d.rc.length ? (<ul className="list-plain">{d.rc.map((r) => (<li key={r.url}><a href={r.url}><span className="grow">{r.title}</span><span className="chip brand nums">{r.done}/{r.total}</span></a></li>))}</ul>) : <p className="small muted">Nothing yet — <a href="/pyq/">open a paper</a> and tap an answer.</p>}
        </div>
      </div>
      <div className="card pad">
        <h3 className="row" style={{ gap: 8 }}><I3D name="chart" size={24} /> Test history</h3>
        {d.at.length ? (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Paper</th><th className="num">Score</th><th className="num">✓</th><th className="num">✗</th><th className="num">Date</th></tr></thead>
            <tbody>{d.at.map((a) => (<tr key={a.at}><td><a href={a.url}>{a.title}</a></td><td className="num"><b>{a.score.toFixed(2)}</b>/{a.total}</td><td className="num">{a.right}</td><td className="num">{a.wrong}</td><td className="num">{new Date(a.at).toLocaleDateString('en-IN')}</td></tr>))}</tbody></table></div>
        ) : <p className="small muted">Take any paper in Real exam mode — your results appear here.</p>}
      </div>
      <div className="card pad">
        <h3 className="row" style={{ gap: 8 }}><I3D name="bookmark" size={24} /> Bookmarked questions ({d.bm.length})</h3>
        {d.bm.length ? (<ul className="list-plain">{d.bm.map((b) => (<li key={b.id}><a href={b.url}><span className="grow">{b.text}</span><span className="chip">{b.topic}</span></a></li>))}</ul>) : <p className="small muted">Tap “Save” on any question to revise it later.</p>}
      </div>
    </div>
  );
}
