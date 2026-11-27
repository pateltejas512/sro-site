import Breadcrumbs from '@/components/Breadcrumbs';
import I3D from '@/components/I3D';
import ReferCard from '@/components/ReferCard';
import { meta } from '@/lib/seo';

export const metadata = { ...meta({ title: 'Refer & Earn – Invite 3 Friends, Get 1 Month of SRO Jeet Free', description: 'Share your SarkariResultOut invite link. When 3 friends sign up you get one month of SRO Jeet free, and every friend gets ₹50 off.', path: '/refer/' }), robots: { index: false, follow: true } };

export default function ReferPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Refer & earn', path: '/refer/' }];
  return (
    <div className="wrap">
      <Breadcrumbs items={crumbs} />
      <section className="hero">
        <div className="hero-in">
          <div>
            <span className="eyebrow">Refer &amp; earn</span>
            <h1>Invite 3 friends, get <em>1 month of SRO Jeet</em> free</h1>
            <p className="lead">Your friends get ₹50 off SRO Jeet. Every 3 friends who join and finish one test add another month — no limit.</p>
          </div>
          <div className="hero-visual" aria-hidden="true"><span className="halo" /><I3D name="gift" lg={false} size={180} eager className="trophy" /></div>
        </div>
      </section>
      <div className="grid g2" style={{ marginTop: 18, alignItems: 'start' }}>
        <ReferCard />
        <div className="card pad-lg">
          <h2>How it works</h2>
          <div className="stack" style={{ marginTop: 10 }}>
            {[
              ['phone', '1. Share your link', 'On WhatsApp groups, Telegram or Instagram — one tap.'],
              ['handshake', '2. Friends sign up', 'They practise free and get ₹50 off SRO Jeet with your link.'],
              ['gift', '3. You earn SRO Jeet', 'Every 3 friends → 1 month free, added to your account automatically.'],
            ].map(([i, t, d]) => (<div key={t} className="feat"><I3D name={i} size={44} /><div><b>{t}</b><p>{d}</p></div></div>))}
          </div>
          <p className="tiny muted" style={{ marginTop: 12 }}>A friend counts once they sign in with a new account and complete one test. Self-referrals and duplicate accounts are not counted.</p>
        </div>
      </div>
    </div>
  );
}
