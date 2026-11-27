'use client';
import { useEffect, useState } from 'react';
import { markActive, touchRecent, toggleBookmark, bookmarks, toast, revision, recordRevision } from '@/lib/local';
import { applyLang, getLang } from '@/lib/langPref';

/**
 * Progressive enhancement for server-rendered question cards (~2 KB):
 * tap an option -> instant right/wrong + solution, language switch, bookmarks,
 * streak + "continue where you left" tracking. Without JS the page is still complete.
 */
export default function Practice({ storageKey, total, recent }: { storageKey: string; total: number; recent?: { url: string; title: string; exam: string } }) {
  const [score, setScore] = useState({ right: 0, wrong: 0 });

  useEffect(() => {
    const key = `sro:practice:${storageKey}`;
    let saved: Record<string, string> = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
    const cards = Array.from(document.querySelectorAll<HTMLElement>('article[data-ans]'));

    const recount = () => {
      let right = 0, wrong = 0;
      cards.forEach((c) => { const p = saved[c.dataset.q!]; if (p) p === c.dataset.ans ? right++ : wrong++; });
      setScore({ right, wrong });
      if (recent && right + wrong > 0) touchRecent({ ...recent, done: right + wrong, total });
    };
    const paint = (card: HTMLElement, pick: string) => {
      const ans = card.dataset.ans!;
      card.querySelectorAll<HTMLButtonElement>('button.opt').forEach((b) => {
        const k = b.dataset.k!;
        b.classList.toggle('is-correct', k === ans);
        b.classList.toggle('is-wrong', k === pick && pick !== ans);
        b.setAttribute('aria-pressed', String(k === pick));
        b.querySelector('.mark')?.remove();
        if (k === pick || k === ans) {
          const m = document.createElement('span');
          m.className = 'mark';
          m.style.color = k === ans ? 'var(--good)' : 'var(--bad)';
          m.textContent = k === ans ? (k === pick ? '✓ Correct' : '✓ Answer') : '✗ Your pick';
          b.appendChild(m);
        }
      });
      card.querySelectorAll('details.sol').forEach((d) => d.setAttribute('open', ''));
    };
    const bmIds = new Set(bookmarks().map((b) => b.id));
    document.querySelectorAll<HTMLButtonElement>('button[data-bm]').forEach((b) => b.setAttribute('aria-pressed', String(bmIds.has(b.dataset.bm!))));

    const onClick = (e: Event) => {
      const t = e.target as HTMLElement;
      const lang = t.closest<HTMLButtonElement>('button[data-setlang]');
      if (lang) { applyLang(lang.dataset.setlang!); return; } // one choice switches every question
      const bm = t.closest<HTMLButtonElement>('button[data-bm]');
      if (bm) {
        const on = toggleBookmark({ id: bm.dataset.bm!, url: bm.dataset.url!, text: bm.dataset.text!, topic: bm.dataset.topic! });
        bm.setAttribute('aria-pressed', String(on));
        toast(on ? 'Saved to My Progress → Bookmarks' : 'Removed from bookmarks');
        return;
      }
      const share = t.closest<HTMLButtonElement>('button[data-share]');
      if (share) {
        const url = location.origin + share.dataset.share!;
        navigator.clipboard?.writeText(url).then(() => toast('Link copied — share it on WhatsApp'), () => toast(url));
        return;
      }
      const opt = t.closest<HTMLButtonElement>('button.opt');
      if (!opt) return;
      const card = opt.closest<HTMLElement>('article[data-ans]');
      if (!card) return;
      const id = card.dataset.q!;
      const reviseNow = card.dataset.revise === '1';
      if (saved[id] && !reviseNow) return; // first attempt counts, like the exam
      saved[id] = opt.dataset.k!;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
      paint(card, opt.dataset.k!);
      const b = card.querySelector<HTMLButtonElement>('button[data-bm]');
      const correct = opt.dataset.k === card.dataset.ans;
      if (b) recordRevision({ id, url: b.dataset.url!, text: b.dataset.text!, topic: b.dataset.topic! }, correct);
      if (reviseNow) { delete card.dataset.revise; toast(correct ? 'Correct — next revision scheduled' : 'Back to revision box 1 — read the solution once more'); }
      else if (!correct) toast('Added to My Revision — it will come back tomorrow');
      markActive();
      window.dispatchEvent(new Event('sro:active'));
      recount();
    };

    // Opened from My Revision (#revise): let the student answer this question again.
    const rev = location.hash === '#revise' ? revision() : {};
    cards.forEach((c) => {
      if (rev[c.dataset.q!]) {
        delete saved[c.dataset.q!];
        c.dataset.revise = '1';
        c.querySelectorAll('button.opt').forEach((b) => b.classList.remove('is-correct'));
        c.querySelectorAll('details.sol').forEach((d) => d.removeAttribute('open'));
        c.scrollIntoView({ block: 'center' });
        return;
      }
      if (saved[c.dataset.q!]) paint(c, saved[c.dataset.q!]);
    });
    const pref = getLang();
    if (pref) applyLang(pref, false);
    recount();
    document.addEventListener('click', onClick);
    const onPane = (ev: Event) => {
      const id = (ev as CustomEvent<string>).detail;
      const c = cards.find((x) => x.dataset.q === id);
      if (c && saved[id]) paint(c, saved[id]);
    };
    window.addEventListener('sro:pane', onPane);
    (window as unknown as { sroReset?: () => void }).sroReset = () => { try { localStorage.removeItem(key); } catch {} location.reload(); };
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('sro:pane', onPane); };
  }, [storageKey, total, recent]);

  const done = score.right + score.wrong;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <span className="score-pill" aria-live="polite">
      <span className="mini-ring" style={{ ['--p' as string]: pct } as React.CSSProperties} aria-hidden="true" />
      <span className="nums">{done}/{total}</span>
      <span className="g nums">✓ {score.right}</span>
      <span className="r nums">✗ {score.wrong}</span>
      {done > 0 && (
        <button type="button" className="tool" onClick={() => (window as unknown as { sroReset: () => void }).sroReset()}>Reset</button>
      )}
    </span>
  );
}
