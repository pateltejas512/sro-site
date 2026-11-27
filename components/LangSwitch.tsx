'use client';
import { useEffect, useState } from 'react';
import { UI_LANGS, applyLang, getLang, type UiLang } from '@/lib/langPref';

/** Site-wide language picker (header + menu). */
export default function LangSwitch({ full = false }: { full?: boolean }) {
  const [cur, setCur] = useState<UiLang>('en');
  useEffect(() => {
    const l = getLang();
    if (l) { setCur(l); applyLang(l, false); }
    const on = (e: Event) => setCur((e as CustomEvent).detail as UiLang);
    window.addEventListener('sro:lang', on);
    return () => window.removeEventListener('sro:lang', on);
  }, []);
  return (
    <div className={`seg site-lang${full ? ' full' : ''}`} role="group" aria-label="Question language">
      {UI_LANGS.map((l) => (
        <button key={l.code} type="button" data-sitelang={l.code} aria-pressed={cur === l.code} lang={l.code} title={l.label} onClick={() => applyLang(l.code)}>{full ? l.label : l.short}</button>
      ))}
    </div>
  );
}
