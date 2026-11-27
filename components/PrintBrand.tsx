// Branding that appears only in the printed / saved PDF.
// <PrintBrand> = branded cover block (top of page 1) + watermark; <PrintEnd> = the closing page that sells the mocks.
// Page header/footer/page numbers come from @page margin boxes in globals.css, so they never cover the content.
import { SITE } from '@/lib/data';

const host = SITE.url.replace('https://', '');
const tg = SITE.telegram.replace('https://', '');

function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true"><defs><linearGradient id="pb-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2662a" /><stop offset="1" stopColor="#b23c0a" /></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#pb-lg)" /><circle cx="19" cy="20" r="6" fill="#f5b82e" /><path d="M14 44 26.5 31.5l8 8L50 24M39.5 23H51v11.5" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

export default function PrintBrand({ title, path, meta, kind = 'Free PDF' }: { title: string; path: string; meta?: string; kind?: string }) {
  return (
    <>
      <div className="print-only pb-cover">
        <div className="pb-top">
          <Logo />
          <div className="pb-word"><b>SarkariResultOut</b><span>Previous year papers · MCQs · Mock tests</span></div>
          <span className="pb-kind">{kind}</span>
        </div>
        <h1 className="pb-title">{title}</h1>
        {meta && <div className="pb-meta">{meta}</div>}
        <div className="pb-strip">
          <div><b>Practise online</b><span>Instant answer check &amp; solution</span></div>
          <div><b>Real exam mode</b><span>Timer, palette &amp; All-India rank</span></div>
          <div><b>Free daily quiz</b><span>New questions every day</span></div>
        </div>
        <div className="pb-url">Open online: <b>{host}{path}</b></div>
      </div>
      <div className="print-only pb-mark" aria-hidden="true">SarkariResultOut</div>
    </>
  );
}

export function PrintEnd({ exam, series }: { exam?: string; series?: string }) {
  return (
    <div className="print-only pb-end">
      <div className="pb-top"><Logo size={34} /><div className="pb-word"><b>SarkariResultOut</b><span>{host}</span></div></div>
      <h2>Reading answers is step one. Scoring under time pressure is step two.</h2>
      <p>Attempt {exam ? `${exam} ` : ''}full-length mock tests on the real computer-based exam screen — the same pattern, timer and negative marking — and see your All-India rank the moment you submit.</p>
      <ul>
        <li><b>Full mock tests</b> in the latest pattern, with step-by-step solutions</li>
        <li><b>All-India rank &amp; percentile</b> on your first attempt</li>
        <li><b>Weak-topic report</b> after every test — know exactly what to revise</li>
        <li><b>Gujarati + English</b>, works on any phone</li>
      </ul>
      <div className="pb-cta"><span>Start now</span><b>{host}{series ?? '/test-series/'}</b></div>
      <div className="pb-join">Free updates, answer keys &amp; results on Telegram: <b>{tg}</b></div>
    </div>
  );
}
