'use client';
// Mobile drawer: a native <dialog> (focus trap, Esc to close, back-button friendly) holding server-rendered links.
// On the live site it also pulls editor-picked links from WordPress (sro-api /menu), cached for 30 minutes.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IMenu, IClose, ISun, IMoon } from './Icons';
import { asset } from './I3D';

type Pick = { label: string; url: string; icon?: string; badge?: string };
const API = process.env.NEXT_PUBLIC_SRO_API;
const KEY = 'sro:menu:v1';

function useEditorPicks(open: boolean) {
  const [picks, setPicks] = useState<Pick[]>([]);
  useEffect(() => {
    if (!open || !API) return;
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null') as { t: number; v: Pick[] } | null;
      if (c && Date.now() - c.t < 30 * 60e3) { setPicks(c.v); return; }
    } catch {}
    const ctl = new AbortController();
    fetch(`${API}/menu`, { signal: ctl.signal, credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: Pick[] }) => {
        // Only same-site links are shown, whatever the API returns.
        const v = (d.items ?? []).filter((x) => typeof x.url === 'string' && /^\/(?!\/)/.test(x.url)).slice(0, 8);
        setPicks(v);
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v })); } catch {}
      })
      .catch(() => {});
    return () => ctl.abort();
  }, [open]);
  return picks;
}

function ThemeSwitch() {
  const [t, setT] = useState<'auto' | 'light' | 'dark'>('auto');
  useEffect(() => { try { setT((localStorage.getItem('sro:theme') as 'light' | 'dark') || 'auto'); } catch {} }, []);
  const set = (v: 'auto' | 'light' | 'dark') => {
    setT(v);
    try { v === 'auto' ? localStorage.removeItem('sro:theme') : localStorage.setItem('sro:theme', v); } catch {}
    if (v === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
  };
  return (
    <div className="seg theme-seg" role="group" aria-label="Theme">
      <button type="button" aria-pressed={t === 'light'} onClick={() => set('light')}><ISun size={15} /> Light</button>
      <button type="button" aria-pressed={t === 'auto'} onClick={() => set('auto')}>Auto</button>
      <button type="button" aria-pressed={t === 'dark'} onClick={() => set('dark')}><IMoon size={15} /> Dark</button>
    </div>
  );
}

export default function MobileMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const picks = useEditorPicks(open);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => { setOpen(false); document.documentElement.classList.remove('menu-open'); };
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close(); // tap on the backdrop
      if ((e.target as HTMLElement).closest('a[href]')) d.close();
    };
    d.addEventListener('close', onClose);
    d.addEventListener('click', onClick);
    return () => { d.removeEventListener('close', onClose); d.removeEventListener('click', onClick); };
  }, []);

  const show = () => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    setOpen(true);
    document.documentElement.classList.add('menu-open');
  };

  return (
    <>
      <button type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} onClick={show}><IMenu /></button>
      <dialog ref={ref} className="drawer" aria-label="Menu">
        <div className="drawer-in">
          <div className="drawer-top">
            <b>Menu</b>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => ref.current?.close()}><IClose /></button>
          </div>
          <form className="drawer-search" action="/pyq/" role="search">
            <label htmlFor="mq" className="sr-only">Search exams, papers, topics</label>
            <input id="mq" name="q" placeholder="Search exam, paper, topic…" autoComplete="off" enterKeyHint="search" />
          </form>
          {picks.length > 0 && (
            <section className="drawer-sec" aria-label="Trending on SarkariResultOut">
              <h3>Trending now</h3>
              <ul className="drawer-list">
                {picks.map((p) => (
                  <li key={p.url}><a href={p.url}><img src={asset(`/i3d/${p.icon || 'fire'}.webp`)} width={26} height={26} alt="" loading="lazy" className="i3d" /><span className="grow">{p.label}</span>{p.badge && <span className="new">{p.badge}</span>}</a></li>
                ))}
              </ul>
            </section>
          )}
          {children}
          <section className="drawer-sec"><h3>Appearance</h3><ThemeSwitch /></section>
        </div>
      </dialog>
    </>
  );
}
