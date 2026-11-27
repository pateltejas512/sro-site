// Promo card shown between MCQs (every 5 questions). Server-rendered, no JS of its own:
// buttons use the global data-checkout / data-wa handlers. Jeet promos hide for Jeet members (html.is-jeet).
import I3D from './I3D';
import { IZap, IWhatsApp, ITelegram, IArrowRight, IDownload } from './Icons';
import { SITE } from '@/lib/data';

type Ctx = { exam?: string; url: string; title: string };
const ORDER = ['jeet', 'challenge', 'telegram', 'jeet-mock', 'pdf', 'predictor'] as const;

export default function FeedPromo({ n, ctx }: { n: number; ctx: Ctx }) {
  const kind = ORDER[n % ORDER.length];
  const ex = ctx.exam ?? 'your exam';
  if (kind === 'jeet' || kind === 'jeet-mock') {
    const mock = kind === 'jeet-mock';
    return (
      <aside className="fp fp-jeet" aria-label="SRO Jeet">
        <I3D name={mock ? 'stopwatch' : 'crown'} size={56} />
        <div className="fp-c">
          <b>{mock ? `Full ${ex} mocks with All-India rank` : `See your rank in this ${ex} shift`}</b>
          <span>{mock ? 'New full mock every week · real pattern · All-India rank' : 'SRO Jeet shows your rank, percentile and topper comparison on every paper.'}</span>
        </div>
        <div className="fp-cta"><span className="fp-price"><b>₹349</b><s>₹499</s>/yr</span><button type="button" className="btn btn-gold btn-sm" data-checkout="jeet-yr"><IZap /> Get SRO Jeet</button></div>
      </aside>
    );
  }
  if (kind === 'challenge') {
    return (
      <aside className="fp fp-wa" aria-label="Challenge a friend">
        <I3D name="handshake" size={56} />
        <div className="fp-c"><b>Challenge a friend</b><span>Send this paper on WhatsApp — see who scores more. Friends open it free, no login.</span></div>
        <div className="fp-cta"><button type="button" className="btn btn-wa btn-sm" data-wa={`⚔️ ${ctx.title} — can you beat my score? Free on SarkariResultOut:`} data-url={ctx.url}><IWhatsApp /> Challenge</button></div>
      </aside>
    );
  }
  if (kind === 'telegram') {
    return (
      <aside className="fp fp-tg" aria-label="Telegram">
        <I3D name="bell" size={56} />
        <div className="fp-c"><b>{ex} updates on Telegram</b><span>New shifts, answer keys, cut-offs and the 7 AM daily quiz.</span></div>
        <div className="fp-cta"><a className="btn btn-tg btn-sm" href={SITE.telegram} rel="noopener"><ITelegram /> Join free</a></div>
      </aside>
    );
  }
  if (kind === 'pdf') {
    return (
      <aside className="fp" aria-label="Download PDF">
        <I3D name="pages" size={56} />
        <div className="fp-c"><b>Save these questions as a PDF</b><span>Every question with its answer and solution, ready to revise offline. Free after a quick sign-in.</span></div>
        <div className="fp-cta"><button type="button" className="btn btn-primary btn-sm" data-pdf=""><IDownload /> Get PDF</button></div>
      </aside>
    );
  }
  return (
    <aside className="fp" aria-label="Rank predictor">
      <I3D name="medal" size={56} />
      <div className="fp-c"><b>Gave {ex}? Check your rank</b><span>Paste your response-sheet link — score, normalised marks and expected rank in 10 seconds.</span></div>
      <div className="fp-cta"><a className="btn btn-soft btn-sm" href="/rank-predictor/">Check rank <IArrowRight /></a></div>
    </aside>
  );
}
