'use client';
// My account: who is signed in, SRO Jeet status, everything they own (new + old website, with Open buttons),
// their payments, and Log out. Data: sro-api /me + SRO Studio /me/access (only the signed-in student's own data).
import { useEffect, useState } from 'react';
import { useUser, active } from './Account';
import * as api from '@/lib/api';
import I3D from './I3D';
import { ICheck, ICrown } from './Icons';

const fmt = (d?: string | null) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const rupees = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function MyAccount() {
  const user = useUser();
  const [acc, setAcc] = useState<api.Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [out, setOut] = useState(false);
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => live && setLoading(false), 2500); // signed-out visitors: stop the skeleton quickly
    if (user) api.myAccess().then((a) => { if (live) { setAcc(a); setLoading(false); } });
    const on = (e: Event) => live && setAcc((e as CustomEvent<api.Access | null>).detail);
    window.addEventListener('sro:access', on);
    return () => { live = false; clearTimeout(t); window.removeEventListener('sro:access', on); };
  }, [user]);

  useEffect(() => { if (location.hash === '#purchases' && acc) document.getElementById('purchases')?.scrollIntoView({ block: 'start' }); }, [acc]);

  async function logout() {
    setOut(true);
    try { await api.logout(); } catch {}
    api.emitUser(null);
    location.href = '/';
  }

  if (!user) {
    if (loading) return <div className="card pad acct-card" aria-busy="true"><div className="skel" style={{ height: 64 }} /></div>;
    return (
      <div className="card pad acct-card acct-out">
        <I3D name="medal" size={56} />
        <div className="grow">
          <h2>Sign in to see your purchases</h2>
          <p className="muted small">Use <b>Continue with Google</b> with the same Gmail you used to buy — your tests, SRO Jeet and payments appear here.</p>
        </div>
        <button type="button" className="btn btn-primary btn-lg" data-login="See your purchases and sync progress on every device.">Sign in</button>
      </div>
    );
  }

  const jeet = active(user);
  const items = acc?.items ?? [];
  const old = acc?.old ?? [];
  const orders = acc?.orders ?? [];
  const initial = (user.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className="stack">
      <div className="card pad acct-card">
        <span className={`acct-av${jeet ? ' plus' : ''}`} aria-hidden="true">{initial}</span>
        <div className="grow" style={{ minWidth: 0 }}>
          <h2 className="acct-name">{user.name || 'Student'}</h2>
          <p className="muted small acct-mail">{user.email || (user.phone ? '+91 ' + user.phone : '')}</p>
          {jeet
            ? <span className="chip gold"><ICrown size={13} /> SRO Jeet · till {fmt(user.planUntil)}</span>
            : <span className="chip">Free account</span>}
        </div>
        <button type="button" className="btn btn-ghost btn-sm acct-logout" onClick={logout} disabled={out}>{out ? 'Logging out…' : 'Log out'}</button>
      </div>

      <section id="purchases" className="card pad" aria-labelledby="purch-h">
        <h3 id="purch-h" className="row" style={{ gap: 8 }}><I3D name="ticket" size={24} /> My purchases</h3>
        {loading && !acc ? <div className="skel" style={{ height: 80 }} /> : items.length + old.length === 0 ? (
          <div className="acct-empty">
            <p className="small muted">Nothing bought on this account yet{user.email ? <> (<b>{user.email}</b>)</> : null}. If you bought with another Gmail, log out and sign in with that one.</p>
            <a className="btn btn-gold" href="/jeet/">See SRO Jeet</a>
          </div>
        ) : (
          <ul className="own-list">
            {items.map((it) => (
              <li key={it.kind + it.url}>
                <span className="own-ic"><ICheck size={16} /></span>
                <span className="grow"><b>{it.title}</b><small>Active till {fmt(it.until)}</small></span>
                <a className="btn btn-primary btn-sm" href={it.kind === 'mock' ? it.url + 'test/' : it.url}>{it.kind === 'mock' ? 'Start' : 'Open'}</a>
              </li>
            ))}
            {old.map((it) => (
              <li key={'o' + it.url + it.title} className={it.active ? '' : 'ended'}>
                <span className="own-ic"><ICheck size={16} /></span>
                <span className="grow"><b>{it.title}</b><small>{it.active ? (it.until ? `Active till ${fmt(it.until)}` : 'No expiry') : `Ended ${fmt(it.until)}`} · bought {fmt(it.date)}</small></span>
                <a className="btn btn-ghost btn-sm" href={it.url}>Open</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {orders.length > 0 && (
        <section className="card pad" aria-labelledby="pay-h">
          <button type="button" className="row between acct-toggle" onClick={() => setShowPay(!showPay)} aria-expanded={showPay}>
            <h3 id="pay-h" className="row" style={{ gap: 8, margin: 0 }}><I3D name="receipt" size={24} /> Payments ({orders.length})</h3><span className="muted small">{showPay ? 'Hide' : 'Show'}</span>
          </button>
          {showPay && (
            <div className="tbl-wrap" style={{ marginTop: 10 }}><table className="tbl"><thead><tr><th>Item</th><th className="num">Amount</th><th className="num">Date</th></tr></thead>
              <tbody>{orders.map((o) => <tr key={o.payment + o.date}><td>{o.title}<div className="tiny muted">{o.payment}</div></td><td className="num">{rupees(o.amount)}</td><td className="num">{fmt(o.date)}</td></tr>)}</tbody></table></div>
          )}
        </section>
      )}
    </div>
  );
}

/** Account block at the top of the mobile menu: who is signed in, My purchases, Log out. */
export function DrawerAccount() {
  const user = useUser();
  const close = (e: React.MouseEvent) => (e.currentTarget as HTMLElement).closest('dialog')?.close();
  if (!user) {
    return (
      <section className="drawer-sec drawer-acct">
        <button type="button" className="btn btn-primary btn-block" data-login="" onClick={close}>Sign in · see your purchases</button>
      </section>
    );
  }
  const jeet = active(user);
  return (
    <section className="drawer-sec drawer-acct">
      <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
        <span className={`acct-av sm${jeet ? ' plus' : ''}`} aria-hidden="true">{(user.name || 'S').trim().charAt(0).toUpperCase()}</span>
        <span className="grow" style={{ minWidth: 0 }}><b className="ellip">{user.name || 'Student'}</b><small className="ellip muted">{jeet ? `SRO Jeet · till ${fmt(user.planUntil)}` : user.email || 'Free account'}</small></span>
      </div>
      <div className="drawer-acct-btns">
        <a className="btn btn-soft btn-sm" href="/my/#purchases">My purchases</a>
        <a className="btn btn-soft btn-sm" href="/my/">My progress</a>
        <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { try { await api.logout(); } catch {} api.emitUser(null); location.href = '/'; }}>Log out</button>
      </div>
    </section>
  );
}
