'use client';
// "Download PDF": free, after a 10-second sign-in (the sign-in is the lead: number for WhatsApp/SMS alerts).
// Prints a branded PDF — header, every solution open, watermark and a footer with the site + Telegram on every page.
import { useEffect, useRef } from 'react';
import { useUser } from './Account';
import { IDownload } from './Icons';

const print = () => { document.querySelectorAll('details.sol').forEach((d) => d.setAttribute('open', '')); window.print(); };

export default function PrintButton({ label = 'Download PDF', className = 'btn btn-glass', what = 'this PDF' }: { label?: string; className?: string; what?: string }) {
  const user = useUser();
  const wanted = useRef(false);
  useEffect(() => { if (user && wanted.current) { wanted.current = false; setTimeout(print, 400); } }, [user]);
  if (!user) {
    return <button id="pdf" type="button" className={className} data-login={`Sign in free to download ${what}.`} onClick={() => { wanted.current = true; }}><IDownload /> {label}</button>;
  }
  return <button id="pdf" type="button" className={className} onClick={print}><IDownload /> {label}</button>;
}
