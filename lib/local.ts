'use client';
// Per-device progress (works without login). After sign-in the same shapes sync to the SRO API.
const get = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const set = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const today = () => new Date().toISOString().slice(0, 10);

export function markActive() {
  const days = get<string[]>('sro:days', []);
  const t = today();
  if (!days.includes(t)) set('sro:days', [...days.slice(-120), t]);
}
export function streak() {
  const days = new Set(get<string[]>('sro:days', []));
  let n = 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1); // streak alive until end of today
  while (days.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export const activeDays = () => get<string[]>('sro:days', []);

export interface Recent { url: string; title: string; exam: string; done: number; total: number; at: number }
export function touchRecent(r: Omit<Recent, 'at'>) {
  const list = get<Recent[]>('sro:recent', []).filter((x) => x.url !== r.url);
  set('sro:recent', [{ ...r, at: Date.now() }, ...list].slice(0, 8));
}
export const recent = () => get<Recent[]>('sro:recent', []);

export interface Bookmark { id: string; url: string; text: string; topic: string; at: number }
export const bookmarks = () => get<Bookmark[]>('sro:bm', []);
export function toggleBookmark(b: Omit<Bookmark, 'at'>) {
  const list = bookmarks();
  const has = list.some((x) => x.id === b.id);
  set('sro:bm', has ? list.filter((x) => x.id !== b.id) : [{ ...b, at: Date.now() }, ...list].slice(0, 500));
  return !has;
}

export interface AttemptLog { key: string; title: string; url: string; score: number; total: number; right: number; wrong: number; seconds: number; at: number }
export const attempts = () => get<AttemptLog[]>('sro:attempts', []);
export function logAttempt(a: Omit<AttemptLog, 'at'>) { set('sro:attempts', [{ ...a, at: Date.now() }, ...attempts()].slice(0, 100)); }

export function toast(msg: string) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.setAttribute('role', 'status');
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2400);
}

/** Navigate to an internal path; works in the static preview (relative base) and in production. */
export function go(u: string) {
  const base = (window as unknown as { __SRO_BASE?: string }).__SRO_BASE;
  location.href = base ? base + u.slice(1) + (u.endsWith('/') ? 'index.html' : '') : u;
}

/* ---------- Revision (mistake book with spaced repetition) ----------
   Every wrong first attempt lands here. Getting it right on the due day moves it up a box
   (1 → 3 → 7 → 15 → 30 days); a wrong answer sends it back to box 1. After box 5 it is mastered. */
export interface RevItem { id: string; url: string; text: string; topic: string; box: number; due: string; wrong: number; at: number }
const GAPS = [1, 3, 7, 15, 30];
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const revision = () => get<Record<string, RevItem>>('sro:rev', {});
export const dueItems = () => Object.values(revision()).filter((r) => r.due <= today()).sort((a, b) => a.box - b.box || a.at - b.at);
export const dueCount = () => dueItems().length;
export function recordRevision(meta: { id: string; url: string; text: string; topic: string }, correct: boolean) {
  const all = revision();
  const cur = all[meta.id];
  if (!correct) all[meta.id] = { ...meta, box: 1, due: addDays(GAPS[0]), wrong: (cur?.wrong ?? 0) + 1, at: cur?.at ?? Date.now() };
  else if (cur) {
    if (cur.box >= GAPS.length) delete all[meta.id];
    else all[meta.id] = { ...cur, box: cur.box + 1, due: addDays(GAPS[cur.box]) };
  } else return;
  const keys = Object.keys(all);
  if (keys.length > 1500) keys.sort((a, b) => all[a].at - all[b].at).slice(0, keys.length - 1500).forEach((k) => delete all[k]);
  set('sro:rev', all);
  window.dispatchEvent(new Event('sro:rev'));
}
export const removeRevision = (id: string) => { const all = revision(); delete all[id]; set('sro:rev', all); window.dispatchEvent(new Event('sro:rev')); };
