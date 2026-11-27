'use client';
import { useEffect, useMemo, useState } from 'react';
import { ISearch, IFilter } from './Icons';
import { go } from '@/lib/local';
import { asset } from './I3D';

export type SearchItem = { t: string; s: string; u: string; k: 'Exam' | 'Paper' | 'Topic' | 'Question' };
const ORDER = ['Exam', 'Paper', 'Topic', 'Question'];

export default function HubSearch({ tags }: { tags: { label: string; q: string }[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const load = () => { if (!items.length) fetch(asset('/search-index.json')).then((r) => r.json()).then(setItems).catch(() => {}); };
  useEffect(() => { const p = new URLSearchParams(location.search).get('q'); if (p) { setQ(p); setOpen(true); load(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const res = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return items
      .map((it) => {
        const hay = `${it.t} ${it.s}`.toLowerCase();
        const score = terms.reduce((n, t) => n + (hay.includes(t) ? (it.t.toLowerCase().includes(t) ? 2 : 1) : -99), 0);
        return { it, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || ORDER.indexOf(a.it.k) - ORDER.indexOf(b.it.k))
      .slice(0, 8);
  }, [q, items]);

  return (
    <div className="search">
      <form className="search-box" role="search" onSubmit={(e) => { e.preventDefault(); if (res[0]) go(res[0].it.u); }}>
        <span className="ico"><ISearch /></span>
        <label htmlFor="hub-q" className="sr-only">Search previous year papers</label>
        <input id="hub-q" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => { setOpen(true); load(); }} placeholder="Search exam, year, topic or a question…" autoComplete="off" />
        <span className="ico hide-sm" style={{ paddingRight: 6 }} aria-hidden="true"><IFilter /></span>
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      {open && q && (
        <div className="search-drop" role="listbox">
          {res.length === 0 && <div className="muted small" style={{ padding: 10 }}>No match yet — new shifts are added every week.</div>}
          {res.map(({ it }) => (
            <a key={it.u} href={it.u} role="option" aria-selected="false">
              <span className="k">{it.k}</span>
              <span style={{ minWidth: 0 }}><b style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</b><span className="muted tiny">{it.s}</span></span>
            </a>
          ))}
        </div>
      )}
      <div className="quick-tags">
        {tags.map((t) => (<a key={t.q} href={`?q=${encodeURIComponent(t.q)}`} onClick={(e) => { e.preventDefault(); setQ(t.q); setOpen(true); load(); }}>{t.label}</a>))}
      </div>
    </div>
  );
}
