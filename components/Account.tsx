'use client';
// Global account layer, mounted once in the layout (~2 KB):
//   [data-checkout="jeet-yr"] [data-exam]  → one-tap checkout sheet
//   [data-login="reason"]                       → sign-in sheet
//   [data-wa="text"] [data-url="/path/"]         → WhatsApp share with the sender's referral code
//   [data-pdf]                                  → the page's Download PDF button
// The sheets themselves (AccountSheets.tsx) are code-split and fetched on the first tap.
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { planById, type PlanId } from '@/lib/plans';
import * as api from '@/lib/api';
import type { User } from '@/lib/api';
import { ICrown } from './Icons';
import { applyOwned, watchOwned } from './owned';

/** item = one mock test sold on its own ([data-checkout="mock"] [data-paper="exam/paper"] [data-price] [data-title]). */
export type MockItem = { key: string; title: string; price: number; exam: string; examShort: string };
export type Sheet = null | { kind: 'login'; reason?: string } | { kind: 'checkout'; plan: PlanId | 'mock'; exam?: string; item?: MockItem; direct?: boolean };

const AccountSheets = dynamic(() => import('./AccountSheets'), { ssr: false });

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    api.me().then(setUser);
    const on = (e: Event) => setUser((e as CustomEvent<User | null>).detail);
    window.addEventListener('sro:user', on);
    return () => window.removeEventListener('sro:user', on);
  }, []);
  return user;
}

export const active = (u: User | null) => !!u && u.plan !== 'free' && (!u.planUntil || u.planUntil >= new Date().toISOString().slice(0, 10));

/** WhatsApp share with the sender's referral code, so every challenge can bring a new student. */
export function shareWa(text: string, path: string) {
  const ref = (() => { try { return JSON.parse(localStorage.getItem('sro:demo-user') || 'null')?.refCode || localStorage.getItem('sro:myref'); } catch { return null; } })();
  const url = 'https://sarkariresultout.com' + path + (ref ? `?ref=${ref}` : '');
  window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
}

export function AccountButton() {
  const user = useUser();
  if (!user) return <button type="button" className="btn btn-primary btn-sm" data-login="">Sign in</button>;
  const initial = (user.name || 'S').trim().charAt(0).toUpperCase();
  return (
    <a className={`acct${active(user) ? ' plus' : ''}`} href="/my/" aria-label={`My account${active(user) ? ', Jeet active' : ''}`}>
      <span className="av">{initial}</span>
      {active(user) && <span className="plus-tag"><ICrown size={12} /> Jeet</span>}
    </a>
  );
}

export default function AccountHost() {
  const user = useUser();
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('is-jeet', active(user));
    try { if (user?.refCode) localStorage.setItem('sro:myref', user.refCode); } catch {}
  }, [user]);

  // What this student owns → "Purchased" instead of buy buttons on every page (and again after each navigation).
  const [paid, setPaid] = useState(0);
  useEffect(() => { const on = () => setPaid((n) => n + 1); window.addEventListener('sro:paid', on); return () => window.removeEventListener('sro:paid', on); }, []);
  useEffect(() => {
    let acc: api.Access | null = null;
    let live = true;
    if (!user) { applyOwned(null); return; }
    api.myAccess(true).then((a) => { if (!live) return; acc = a; applyOwned(a); window.dispatchEvent(new CustomEvent('sro:access', { detail: a })); });
    const stop = watchOwned(() => acc);
    return () => { live = false; stop(); };
  }, [user?.id, user?.plan, user?.planUntil, paid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-pdf]')) { e.preventDefault(); const b = document.getElementById('pdf'); if (b) { b.scrollIntoView({ block: 'center' }); b.click(); } return; }
      const wa = t.closest<HTMLElement>('[data-wa]');
      if (wa) { e.preventDefault(); shareWa(wa.dataset.wa || '', wa.dataset.url || location.pathname); return; }
      const el = t.closest<HTMLElement>('[data-checkout],[data-login]');
      if (!el) return;
      e.preventDefault();
      if (el.dataset.checkout === 'mock' && el.dataset.paper) {
        const d = el.dataset;
        setSheet({ kind: 'checkout', plan: 'mock', exam: d.exam, direct: d.direct === '1', item: { key: d.paper!, title: d.title || 'Mock test', price: Number(d.price) || 0, exam: d.exam || '', examShort: d.examShort || '' } });
      } else if (el.dataset.checkout !== undefined) setSheet({ kind: 'checkout', plan: (planById(el.dataset.checkout)?.id as PlanId) || 'jeet-yr', exam: el.dataset.exam, direct: el.dataset.direct === '1' });
      else setSheet({ kind: 'login', reason: el.dataset.login || undefined });
    };
    // Warm the sheet chunk the moment a finger/mouse lands on a buy button, so the tap opens instantly.
    const warm = (e: Event) => { if ((e.target as HTMLElement).closest?.('[data-checkout],[data-login]')) import('./AccountSheets'); };
    document.addEventListener('click', onClick);
    document.addEventListener('pointerdown', warm, { passive: true, once: true });
    try {
      const ref = new URLSearchParams(location.search).get('ref');
      if (ref && /^[A-Za-z0-9]{4,16}$/.test(ref)) localStorage.setItem('sro:ref', ref.toUpperCase());
      if (location.hash === '#get-jeet') setSheet({ kind: 'checkout', plan: 'jeet-yr' });
    } catch {}
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('pointerdown', warm); };
  }, []);

  const close = useCallback(() => setSheet(null), []);
  return sheet ? <AccountSheets sheet={sheet} onClose={close} /> : null;
}
