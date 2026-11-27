import Link from '@/components/SmartLink';
import { ISearch, IHome, IBook, ITest, ICrown, IGrid, IBell } from './Icons';
import StreakPill from './StreakPill';
import I3D from './I3D';
import { AccountButton } from './Account';
import MobileMenu from './MobileMenu';
import { DrawerAccount } from './MyAccount';
import LangSwitch from './LangSwitch';
import { PRIMARY, UPDATES, MENU_EXAMS, MENU_SUBJECTS, HELP, REQUEST, type MenuItem } from '@/lib/menu';
import BoardSeal from '@/components/BoardSeal';
import ActionIcon from '@/components/ActionIcon';
import { getBoard } from '@/data/boards';

const NAV = [
  { href: '/exams/', label: 'Exams', key: 'exams', app: true },
  { href: '/pyq/', label: 'PYQ Papers', key: 'pyq', app: true },
  { href: '/test-series/', label: 'Mock Tests', key: 'mock', app: true },
  { href: '/mcq/', label: 'Practice', key: 'mcq', app: true },
  { href: '/current-affairs/', label: 'Current Affairs', key: 'ca', app: true },
  { href: '/rank-predictor/', label: 'Rank Predictor', key: 'rank', app: false },
  { href: '/jeet/', label: 'SRO Jeet', key: 'jeet', app: true, isNew: true },
];

export function Logo({ sub = 'PYQ · Mock · Rank' }: { sub?: string }) {
  return (
    <>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="38" height="38"><defs><linearGradient id="sro-lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2662a" /><stop offset="1" stopColor="#b23c0a" /></linearGradient></defs><rect width="64" height="64" rx="18" fill="url(#sro-lg)" /><circle cx="19" cy="20" r="6" fill="#f5b82e" /><path d="M14 44 26.5 31.5l8 8L50 24M39.5 23H51v11.5" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="logo-text"><b>SarkariResultOut</b><span>{sub}</span></span>
    </>
  );
}

function MIcon({ m, size }: { m: MenuItem; size: number }) {
  const b = m.seal ? getBoard(m.seal) : undefined;
  if (b) return <BoardSeal board={b} size={size} />;
  if (m.ai) return <ActionIcon name={m.ai} size={size} />;
  return <I3D name={m.i3d} size={size} />;
}
function DrawerLink({ m }: { m: MenuItem }) {
  const inner = (<><MIcon m={m} size={28} /><span className="grow"><b>{m.label}</b>{m.sub && <small>{m.sub}</small>}</span>{m.badge && <span className="new">{m.badge}</span>}</>);
  return <li>{m.app ? <Link href={m.href}>{inner}</Link> : <a href={m.href}>{inner}</a>}</li>;
}
function DrawerTiles({ items }: { items: MenuItem[] }) {
  return <ul className="drawer-tiles">{items.map((m) => <li key={m.href}>{m.app ? <Link href={m.href}><MIcon m={m} size={30} /><span>{m.label}</span></Link> : <a href={m.href}><MIcon m={m} size={30} /><span>{m.label}</span></a>}</li>)}</ul>;
}

export function Header({ active }: { active?: string }) {
  return (
    <header className="hdr">
      <a href="#main" className="skip">Skip to content</a>
      <div className="wrap hdr-in">
        <Link href="/" className="logo"><Logo /></Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) =>
            n.app ? (
              <Link key={n.key} data-k={n.key} href={n.href} aria-current={active === n.key ? 'page' : undefined}>{n.label}{n.isNew && <span className="new">NEW</span>}</Link>
            ) : (
              <a key={n.key} data-k={n.key} href={n.href}>{n.label}</a>
            )
          )}
        </nav>
        <form className="hdr-search" action="/pyq/" role="search">
          <ISearch />
          <label htmlFor="hq" className="sr-only">Search exams, papers, topics</label>
          <input id="hq" name="q" placeholder="Search exam, paper, topic…" autoComplete="off" />
        </form>
        <div className="hdr-actions">
          <LangSwitch />
          <StreakPill />
          <a className="icon-btn hide-sm" href="/my/" aria-label="Notifications"><IBell /><span className="dot" /></a>
          <AccountButton />
          <MobileMenu>
            <DrawerAccount />
            <section className="drawer-sec"><h3>Question language</h3><LangSwitch full /></section>
            <section className="drawer-sec"><h3>Study</h3><ul className="drawer-list">{PRIMARY.map((m) => <DrawerLink key={m.href} m={m} />)}</ul></section>
            <a className="drawer-jeet" href="/jeet/"><I3D name="crown" size={44} /><span className="grow"><b>SRO Jeet · ₹349/year</b><small>Every mock, All-India rank, PDFs. Code JEET50 = ₹50 off.</small></span></a>
            <section className="drawer-sec"><h3>Sarkari updates</h3><DrawerTiles items={UPDATES} /></section>
            <section className="drawer-sec"><h3>Popular exams</h3><DrawerTiles items={MENU_EXAMS} /><ul className="drawer-list" style={{ marginTop: 8 }}><DrawerLink m={REQUEST} /></ul></section>
            <section className="drawer-sec"><h3>Practice by subject</h3><DrawerTiles items={MENU_SUBJECTS} /></section>
            <section className="drawer-sec"><h3>Account &amp; help</h3><ul className="drawer-list">{HELP.map((m) => <DrawerLink key={m.href} m={m} />)}</ul></section>
            <a className="drawer-tg" href="https://t.me/nataregistration" rel="noopener"><I3D name="phone" size={26} /> Join the SRO Telegram channel</a>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ active }: { active?: string }) {
  const items = [
    { href: '/', label: 'Home', key: 'home', I: IHome, app: true },
    { href: '/pyq/', label: 'PYQ', key: 'pyq', I: IBook, app: true },
    { href: '/mcq/', label: 'Practice', key: 'mcq', I: IGrid, app: true },
    { href: '/test-series/', label: 'Mock Test', key: 'mock', I: ITest, app: true },
    { href: '/jeet/', label: 'SRO Jeet', key: 'jeet', I: ICrown, app: true },
  ];
  return (
    <nav className="bnav" aria-label="App">
      {items.map(({ href, label, key, I, app }) =>
        app ? (
          <Link key={key} data-k={key} href={href} aria-current={active === key ? 'page' : undefined}><span className="bi"><I /></span>{label}</Link>
        ) : (
          <a key={key} data-k={key} href={href}><span className="bi"><I /></span>{label}</a>
        )
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <Link href="/pyq/" className="logo"><Logo sub="Jobs · PYQ · Mock · Rank" /></Link>
            <p style={{ marginTop: 14, maxWidth: 380 }}>Real previous year papers with verified answers in English, हिन्दी and ગુજરાતી. Practise free, attempt like the real CBT, see your All-India rank.</p>
            <div className="row" style={{ marginTop: 12 }}>
              <a className="btn btn-sm btn-glass" href="https://t.me/nataregistration" rel="noopener"><I3D name="phone" size={20} /> Telegram channel</a>
            </div>
          </div>
          <div>
            <h2 className="ftr-h">Practice</h2>
            <ul><li><Link href="/pyq/">Previous year papers</Link></li><li><Link href="/test-series/">Mock test series</Link></li><li><Link href="/mcq/">Practice MCQs</Link></li><li><Link href="/current-affairs/">Current affairs</Link></li><li><a href="/rank-predictor/">Rank predictor</a></li><li><Link href="/jeet/">SRO Jeet</Link></li><li><a href="/request-paper/">Request a paper</a></li></ul>
          </div>
          <div>
            <h2 className="ftr-h">Exams</h2>
            <ul><li><Link href="/exams/rrb/">RRB exams</Link></li><li><Link href="/exams/ssc/">SSC exams</Link></li><li><Link href="/exams/banking/">Banking exams</Link></li><li><Link href="/exams/gsssb/">GSSSB exams</Link></li><li><Link href="/exams/gpsc/">GPSC exams</Link></li><li><Link href="/exams/gpssb/">GPSSB exams</Link></li><li><Link href="/exams/">All exams</Link></li></ul>
          </div>
          <div>
            <h2 className="ftr-h">Mock tests</h2>
            <ul><li><Link href="/test-series/rrb-je/">RRB JE Mock Test</Link></li><li><Link href="/test-series/gsssb-cce/">GSSSB CCE Mock Test</Link></li><li><Link href="/test-series/gpsc-ae-electrical-class-2/">GPSC AE Mock Test</Link></li><li><Link href="/test-series/guvnl-vidyut-sahayak-je/">Vidyut Sahayak JE Mock Test</Link></li><li><Link href="/mcq/electrical-engineering/">Electrical Engineering MCQ</Link></li></ul>
          </div>
          <div>
            <h2 className="ftr-h">SarkariResultOut</h2>
            <ul><li><a href="/about-us/">About &amp; editorial policy</a></li><li><a href="/contact-us/">Contact</a></li><li><a href="/privacy-policy/">Privacy</a></li><li><a href="/terms-and-condition/">Terms</a></li><li><a href="/disclaimer/">Disclaimer</a></li></ul>
          </div>
        </div>
        <div className="ftr-bottom">© 2026 SarkariResultOut. Questions are reproduced from public examination papers for practice; every answer is checked by the SRO editorial team.</div>
      </div>
    </footer>
  );
}
