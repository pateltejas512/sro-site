'use client';
// "Purchased" state on every page: once we know what the signed-in student owns (lib/api.myAccess), every buy
// button for something they already have turns into a "✓ Purchased · Start" link, and every buy box marked with
// data-own="mock:exam/paper" | "exam:slug" | "jeet" is replaced by a "You own this" panel. Idempotent, so it simply
// runs again when the page changes (client navigation, late-rendered parts).
import { ownedUntil, type Access } from '@/lib/api';

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const tick = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/** What a buy button / box sells → [kind, key, start link]. */
function target(kind: string, key: string): [string, string, string] {
  if (kind === 'mock') return ['mock', key, `/test-series/${key}/test/`];
  if (kind === 'exam') return ['exam', key, key ? `/test-series/${key}/#mock-h` : '/test-series/'];
  return ['jeet', '', '/test-series/'];
}

function el(tag: string, cls: string, html?: string) {
  const e = document.createElement(tag);
  e.className = cls;
  if (html) e.innerHTML = html; // only our own constant markup + escaped text below
  return e;
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function panel(kind: string, until: string, href: string, compact: boolean, label?: string) {
  const what = kind === 'mock' ? 'You own this test' : kind === 'exam' ? `All ${label || 'exam'} tests are unlocked` : 'SRO Jeet is active';
  const cta = kind === 'mock' ? 'Start test' : kind === 'exam' ? 'Open my tests' : 'Open mock tests';
  const p = el('div', 'owned-panel' + (compact ? ' compact' : ''));
  p.innerHTML = `<span class="op-badge">${tick} Purchased</span><span class="op-txt"><b>${esc(what)}</b><small>Access till ${esc(fmt(until))}</small></span><a class="btn btn-primary${compact ? '' : ' btn-lg btn-block'}" href="${esc(href)}">${esc(cta)}</a>`;
  return p;
}

export function applyOwned(a: Access | null) {
  if (typeof document === 'undefined') return;
  const signed = !!a?.signedIn;
  document.documentElement.classList.toggle('is-signed', signed);
  // 1. whole buy boxes
  document.querySelectorAll<HTMLElement>('[data-own]').forEach((box) => {
    const [kind, key = ''] = (box.dataset.own || '').split(':');
    const until = ownedUntil(a, kind, key);
    const had = box.querySelector(':scope > .owned-panel');
    if (!until) { if (had) { had.remove(); box.classList.remove('is-owned'); } return; }
    if (had && box.dataset.ownUntil === until) return;
    had?.remove();
    const [k, , href] = target(kind, key);
    box.prepend(panel(k, until, href, box.dataset.ownVariant === 'compact', box.dataset.ownLabel));
    box.dataset.ownUntil = until;
    box.classList.add('is-owned');
  });
  // 2. single buy buttons elsewhere (cards, locked solutions, test gate, SRO Jeet page)
  document.querySelectorAll<HTMLElement>('[data-checkout]').forEach((b) => {
    if (b.closest('.is-owned')) return;
    const c = b.dataset.checkout || '';
    const kind = c === 'mock' ? 'mock' : c === 'jeet-exam' ? 'exam' : 'jeet';
    const key = c === 'mock' ? b.dataset.paper || '' : c === 'jeet-exam' ? b.dataset.exam || '' : '';
    if (kind === 'mock' && !key) return;
    const until = ownedUntil(a, kind, key);
    const next = b.nextElementSibling as HTMLElement | null;
    const mine = next?.classList.contains('owned-btn') ? next : null;
    if (!until) { if (mine) { mine.remove(); b.style.display = ''; } return; }
    if (mine) return;
    // two owned buttons side by side (e.g. "Buy this test" + "Get all tests") → one Start link
    const prev = b.previousElementSibling as HTMLElement | null;
    b.style.display = 'none';
    if (prev?.classList.contains('owned-btn')) return;
    const [, , href] = target(kind, key);
    const small = /\bbtn-sm\b/.test(b.className);
    const link = el('a', `btn btn-success owned-btn${small ? ' btn-sm' : /\bbtn-lg\b/.test(b.className) ? ' btn-lg' : ''}`);
    (link as HTMLAnchorElement).href = href;
    link.innerHTML = `${tick} ${kind === 'jeet' ? `Active till ${esc(fmt(until))}` : small ? 'Purchased · Start' : 'Purchased · Start test'}`;
    b.after(link);
  });
}

/** Re-applies when the page content changes (client-side navigation renders new buy buttons). */
export function watchOwned(get: () => Access | null) {
  let t = 0;
  const mo = new MutationObserver((list) => {
    if (list.every((m) => [...m.addedNodes].every((n) => n instanceof HTMLElement && (n.classList.contains('owned-panel') || n.classList.contains('owned-btn'))))) return;
    clearTimeout(t);
    t = window.setTimeout(() => applyOwned(get()), 120);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => { mo.disconnect(); clearTimeout(t); };
}
