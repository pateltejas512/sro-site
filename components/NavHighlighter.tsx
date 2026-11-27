'use client';
import { useEffect } from 'react';
/** Marks the current section in header + bottom nav without making them client components. */
export default function NavHighlighter() {
  useEffect(() => {
    const p = location.pathname;
    const key = document.querySelector('.home') ? 'home' : p.includes('/jeet') ? 'jeet' : p.includes('/my') ? 'my' : p.includes('/exams') || p.includes('/request-paper') ? 'exams' : p.includes('/test-series') ? 'mock' : p.includes('/current-affairs') ? 'ca' : p.includes('/mcq') || p.includes('/question') ? 'mcq' : p.includes('/pyq') ? 'pyq' : '';
    document.querySelectorAll<HTMLAnchorElement>('.nav a[data-k], .bnav a[data-k]').forEach((a) => {
      const k = a.dataset.k;
      const on = k === key;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }, []);
  return null;
}
