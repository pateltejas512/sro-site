'use client';
import { useEffect } from 'react';

const NEW_DAYS = 4;
const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const decode = (s: string) => { const t = document.createElement('textarea'); t.innerHTML = s.replace(/<[^>]+>/g, ''); return t.value.replace(/\s+/g, ' ').trim(); };

function badge(root: HTMLElement) {
  root.querySelectorAll<HTMLTimeElement>('time[datetime]').forEach((t) => {
    const age = (Date.now() - new Date(t.dateTime + 'T00:00:00').getTime()) / 864e5;
    if (age < NEW_DAYS && !t.previousElementSibling?.classList.contains('bad')) {
      const b = document.createElement('span'); b.className = 'chip bad'; b.textContent = 'NEW'; t.before(b);
    }
  });
}

/** Tabs + NEW badges + live refresh (production host only) for the server-rendered updates board. */
export default function UpdatesEnhancer() {
  useEffect(() => {
    const root = document.getElementById('sro-updates');
    if (!root) return;
    const onClick = (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
      if (!btn) return;
      root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      root.querySelectorAll<HTMLElement>('[role=tabpanel]').forEach((p) => { p.hidden = p.id !== `pan-${btn.dataset.tab}`; });
    };
    root.addEventListener('click', onClick);
    badge(root);
    if (/(^|\.)sarkariresultout\.com$/.test(location.hostname)) {
      root.querySelectorAll<HTMLUListElement>('ul[data-cat]').forEach((ul) => {
        fetch(`/wp-json/wp/v2/posts?categories=${ul.dataset.cat}&per_page=8&_fields=title,link,date`)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((rows: { title: { rendered: string }; link: string; date: string }[]) => {
            if (!rows.length) return;
            ul.replaceChildren(...rows.map((p) => {
              const li = document.createElement('li'); const a = document.createElement('a');
              a.href = p.link.replace(location.origin, '') || '/';
              const t = document.createElement('span'); t.className = 'upd-t'; t.textContent = decode(p.title.rendered);
              const m = document.createElement('span'); m.className = 'upd-m';
              const tm = document.createElement('time'); tm.dateTime = p.date.slice(0, 10); tm.textContent = fmt(tm.dateTime);
              m.append(tm); a.append(t, m); li.append(a); return li;
            }));
            badge(ul);
          }).catch(() => {});
      });
    }
    return () => root.removeEventListener('click', onClick);
  }, []);
  return null;
}
