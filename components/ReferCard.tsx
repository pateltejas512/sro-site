'use client';
import { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import type { User } from '@/lib/api';
import { shareWa } from './Account';
import { toast } from '@/lib/local';
import { IWhatsApp, ITelegram, IShare } from './Icons';

export default function ReferCard() {
  const [user, setUser] = useState<User | null>(null);
  const [n, setN] = useState(0); // friends who joined and finished a test (toward the next free month)
  useEffect(() => {
    api.me().then(setUser);
    const on = (e: Event) => setUser((e as CustomEvent<User | null>).detail);
    window.addEventListener('sro:user', on);
    return () => window.removeEventListener('sro:user', on);
  }, []);
  useEffect(() => { if (user) api.referrals().then((r) => setN(r.qualified % r.perReward)).catch(() => {}); }, [user]);
  if (!user) {
    return (
      <div className="card pad-lg refer-card">
        <h2>Get your invite link</h2>
        <p className="muted">Sign in with Google — your personal link is ready in 10 seconds.</p>
        <button type="button" className="btn btn-primary btn-lg btn-block" data-login="Sign in to get your invite link.">Sign in to get my link</button>
      </div>
    );
  }
  const link = `https://sarkariresultout.com/?ref=${user.refCode}`;
  const msg = `I'm preparing for govt exams on SarkariResultOut — free PYQs, mock tests and All-India rank. Join with my link and get ₹50 off Jeet:`;
  return (
    <div className="card pad-lg refer-card">
      <h2>Your invite link</h2>
      <div className="ref-link"><code>{link.replace('https://', '')}</code><button type="button" className="btn btn-soft btn-sm" onClick={() => { navigator.clipboard?.writeText(link); toast('Link copied'); }}>Copy</button></div>
      <div className="ref-prog" aria-label={`${n} of 3 friends joined`}>{[0, 1, 2].map((k) => <span key={k} className={k < n ? 'on' : ''}>{k < n ? '✓' : k + 1}</span>)}<b>{n}/3 friends joined</b></div>
      <div className="grid g3" style={{ gap: 8 }}>
        <button type="button" className="btn btn-wa" onClick={() => shareWa(msg, '/')}><IWhatsApp /> WhatsApp</button>
        <a className="btn btn-tg" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}`} rel="noopener"><ITelegram /> Telegram</a>
        <button type="button" className="btn btn-ghost" onClick={() => (navigator.share ? navigator.share({ title: 'SarkariResultOut', text: msg, url: link }).catch(() => {}) : (navigator.clipboard?.writeText(`${msg} ${link}`), toast('Message copied')))}><IShare /> More</button>
      </div>
    </div>
  );
}
