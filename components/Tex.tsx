'use client';
// One LaTeX formula, typeset with KaTeX. KaTeX (CSS + JS) is loaded once from a CDN, only on pages
// that actually contain a formula. Until it arrives (or if the CDN is blocked) the raw formula is shown.
import { useEffect, useState } from 'react';

const CDN = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist';

type Katex = { renderToString: (tex: string, opts: object) => string };
declare global {
  interface Window { katex?: Katex; __sroKatex?: Promise<Katex | undefined> }
}

function ensureKatex(): Promise<Katex | undefined> {
  if (typeof window === 'undefined') return Promise.resolve(undefined);
  if (window.__sroKatex) return window.__sroKatex;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = `${CDN}/katex.min.css`;
  css.crossOrigin = 'anonymous';
  document.head.appendChild(css);
  window.__sroKatex = new Promise((ok) => {
    const s = document.createElement('script');
    s.src = `${CDN}/katex.min.js`;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = () => ok(window.katex);
    s.onerror = () => ok(undefined);
    document.head.appendChild(s);
  });
  return window.__sroKatex;
}

export default function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    ensureKatex().then((k) => {
      if (!alive || !k) return;
      try {
        setHtml(k.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' }));
      } catch { /* keep the raw formula */ }
    });
    return () => { alive = false; };
  }, [tex, display]);

  const style = display
    ? { display: 'block', overflowX: 'auto' as const, overflowY: 'hidden' as const, margin: '8px 0', padding: '2px 0' }
    : undefined;
  if (html) return <span className={display ? 'math-d' : 'math-i'} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
  return <span className={display ? 'math-d' : 'math-i'} style={style}>{display ? `$$${tex}$$` : `$${tex}$`}</span>;
}
