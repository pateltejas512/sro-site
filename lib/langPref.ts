'use client';
// One language for the whole site: pick English, हिन्दी or ગુજરાતી once and every question opens in it.
// Questions not yet translated keep their original language and show a small notice.
export type UiLang = 'en' | 'hi' | 'gu';
export const UI_LANGS: { code: UiLang; short: string; label: string }[] = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'hi', short: 'हिं', label: 'हिन्दी' },
  { code: 'gu', short: 'ગુ', label: 'ગુજરાતી' },
];
const NAMES: Record<string, string> = { en: 'English', hi: 'हिन्दी', gu: 'ગુજરાતી' };

export function getLang(): UiLang | null {
  try { const l = localStorage.getItem('sro:lang'); return l === 'en' || l === 'hi' || l === 'gu' ? l : null; } catch { return null; }
}

/** Show every question card on the page in `l` (where available) and remember the choice. */
export function applyLang(l: string, persist = true) {
  if (persist) { try { localStorage.setItem('sro:lang', l); } catch {} }
  document.querySelectorAll<HTMLElement>('article.q').forEach((card) => {
    const panes = Array.from(card.querySelectorAll<HTMLElement>(':scope [data-lang]'));
    if (!panes.length) return;
    const has = panes.some((p) => p.dataset.lang === l);
    const show = has ? l : panes[0].dataset.lang!;
    panes.forEach((p) => (p.hidden = p.dataset.lang !== show));
    card.querySelectorAll<HTMLButtonElement>('button[data-setlang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setlang === show)));
    const miss = card.querySelector<HTMLElement>('.lang-miss');
    if (miss) {
      miss.hidden = has;
      if (!has) miss.textContent = `Not yet available in ${NAMES[l] ?? l} — showing ${NAMES[show] ?? show}.`;
    }
  });
  document.querySelectorAll<HTMLButtonElement>('button[data-sitelang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sitelang === l)));
  window.dispatchEvent(new CustomEvent('sro:lang', { detail: l }));
}
