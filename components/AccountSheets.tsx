'use client';
// One-tap Jeet checkout + sign-in UI. Loaded only when someone taps a [data-checkout] / [data-login]
// element (see components/Account.tsx), so it adds 0 KB to the first page load.
import { useCallback, useEffect, useRef, useState } from 'react';
import { PLANS, MONTHLY, planById, LAUNCH_COUPON, type PlanId } from '@/lib/plans';
import { useUser, active, type Sheet, type MockItem } from './Account';
import * as api from '@/lib/api';
import type { User } from '@/lib/api';
import { asset } from './I3D';
import { ICheck, ILock, IShield, IZap } from './Icons';

type Step = 'form' | 'paying' | 'otp' | 'done';

const PAID = [...PLANS.filter((p) => p.price > 0), MONTHLY];
const fmt = (d?: string) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/* ---------- server config (Google client id, whether SMS OTP is switched on) ---------- */
function useConfig() {
  const [cfg, setCfg] = useState<api.Config | null>(null);
  useEffect(() => { let on = true; api.getConfig().then((c) => on && setCfg(c)); return () => { on = false; }; }, []);
  return cfg;
}

const GLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
);

/** "Continue with Google": the real Google Identity Services button in production, a labelled stand-in in preview. */
function GoogleButton({ cfg, onSignedIn, onError }: { cfg: api.Config | null; onSignedIn: (u: User) => void; onError: (m: string) => void }) {
  const gRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const clientId = cfg?.google || '';
  useEffect(() => {
    if (api.DEMO || !clientId || !gRef.current) return;
    const draw = () => {
      const g = (window as unknown as { google?: { accounts: { id: { initialize(o: unknown): void; renderButton(el: HTMLElement, o: unknown): void } } } }).google;
      if (!g || !gRef.current) return;
      g.accounts.id.initialize({ client_id: clientId, ux_mode: 'popup', callback: async (r: { credential: string }) => {
        try { const u = await api.googleLogin(r.credential, api.refCode()); api.emitUser(u); onSignedIn(u); } catch (e) { onError((e as Error).message); }
      } });
      g.accounts.id.renderButton(gRef.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(400, gRef.current.offsetWidth || 320) });
    };
    if ((window as unknown as { google?: unknown }).google) { draw(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = draw;
    document.head.appendChild(s);
  }, [clientId, onSignedIn, onError]);

  if (api.DEMO) {
    return (
      <button type="button" className="btn btn-ghost btn-block btn-lg g-btn" disabled={busy} onClick={async () => { setBusy(true); const u = await api.demoGoogle(); api.emitUser(u); onSignedIn(u); }}>
        <GLogo /> Continue with Google
      </button>
    );
  }
  if (!cfg) return <div className="g-slot" aria-busy="true" />;
  if (!clientId) return <p className="muted small" role="status" style={{ textAlign: 'center' }}>Sign-in is opening shortly. You can keep practising for free meanwhile.</p>;
  return <div ref={gRef} className="g-slot" />;
}

/* ---------- the sheets (loaded on first tap by AccountHost) ---------- */
export default function AccountSheets({ sheet, onClose: close }: { sheet: NonNullable<Sheet>; onClose: () => void }) {
  const user = useUser();

  // Esc to close, lock page scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [close]);

  return (
    <div className="sheet-wrap" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h">
        <span className="grab" aria-hidden="true" />
        <button type="button" className="sheet-x" onClick={close} aria-label="Close">×</button>
        {sheet.kind === 'checkout'
          ? <Checkout key={sheet.plan} initial={sheet.plan} exam={sheet.exam} item={sheet.item} direct={sheet.direct} user={user} onClose={close} />
          : <Login reason={sheet.reason} onDone={close} />}
        {api.DEMO && <p className="demo-note">Preview mode — no real OTP is sent and no money is charged.</p>}
      </div>
    </div>
  );
}

/* ---------- checkout ---------- */
/** direct: tapped on a lock — skip the form; payment opens at once (after a one-tap sign-in when needed). */
function Checkout({ initial, exam, item, direct, user, onClose }: { initial: PlanId | 'mock'; exam?: string; item?: MockItem; direct?: boolean; user: User | null; onClose: () => void }) {
  const [planId, setPlanId] = useState<PlanId | 'mock'>(initial === 'mock' && !item ? 'jeet-exam' : initial);
  const [phone, setPhone] = useState(user?.phone || '');
  const [coupon, setCoupon] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [off, setOff] = useState(0);
  const [cMsg, setCMsg] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [err, setErr] = useState('');
  const [result, setResult] = useState<User | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cfg = useConfig();
  const needSignIn = !user && !api.DEMO && cfg !== null && !cfg.otp; // guest checkout needs SMS OTP to attach the plan
  const onSignedIn = useCallback(() => setErr(''), []);
  const onGErr = useCallback((m: string) => setErr(m), []);
  const isMock = planId === 'mock' && !!item;
  // one mock test, shown with the same fields as a plan
  const plan = isMock
    ? { id: 'mock', name: item!.title, short: 'This test', price: item!.price, per: '1 test · 1 year', i3d: 'ticket', tagline: '', yes: ['Full test with every question', 'All-India rank & percentile', 'Solutions and section analysis', 'Unlimited re-attempts for a year'] } as unknown as NonNullable<ReturnType<typeof planById>>
    : planById(planId as PlanId)!;
  const total = Math.max(1, plan.price - off);

  useEffect(() => { if (user && !user.phone && !direct) setTimeout(() => phoneRef.current?.focus(), 250); }, [user, direct]);
  // Lock → payment: as soon as we know who is paying, open Razorpay (once).
  const autoPaid = useRef(false);
  useEffect(() => {
    if (!direct || autoPaid.current || step !== 'form') return;
    if (user || api.DEMO || (cfg && cfg.otp && api.validPhone(phone))) { autoPaid.current = true; pay(); }
  }, [direct, user, cfg]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setOff(0); setCMsg(''); if (coupon) applyCoupon(coupon); /* re-price on plan switch */ }, [planId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (active(user) && step === 'form' && initial !== 'mock') {
    return (
      <div className="sheet-body center">
        <img src={asset('/i3d/crown.webp')} width={84} height={84} alt="" />
        <h2 id="sheet-h">SRO Jeet is active</h2>
        <p className="muted">Valid till {fmt(user!.planUntil)}. Every SRO Jeet feature is unlocked on this account.</p>
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onClose}>Continue practising</button>
      </div>
    );
  }

  async function applyCoupon(code: string) {
    if (!code.trim()) return;
    try {
      if (planId === 'mock') return;
      const r = await api.checkCoupon(code, planId);
      setOff(r.ok ? r.off : 0); setCMsg(r.message);
    } catch (e) { setCMsg((e as Error).message); }
  }

  async function pay() {
    setErr('');
    // signed-in buyers may leave it empty: Razorpay asks for the number itself
    if (phone ? !api.validPhone(phone) : !user) { setErr('Enter a valid 10-digit mobile number.'); phoneRef.current?.focus(); return; }
    setStep('paying');
    try {
      const order = await api.createOrder(planId, phone, off ? coupon : undefined, api.refCode(), isMock ? item!.key : planId === 'jeet-exam' ? exam : undefined, plan.price);
      if (api.DEMO) {
        const u = await api.demoActivate(planId === 'mock' ? 'jeet-exam' : planId, phone);
        if (!user) { setStep('otp'); return; }
        api.emitUser(u); setResult(u); setStep('done'); return;
      }
      if (!(await api.loadRazorpay())) throw new Error('Could not open payment. Check your internet and try again.');
      const RZP = (window as unknown as { Razorpay: new (o: unknown) => { open(): void; on(ev: string, f: (r: { error?: { description?: string } }) => void): void } }).Razorpay;
      const rzp = new RZP({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: 'INR',
        name: 'SarkariResultOut', description: `${plan.name} · ${plan.per}`, image: '/icon.svg',
        prefill: { ...(phone ? { contact: '+91' + api.cleanPhone(phone) } : {}), email: user?.email, name: user?.name },
        readonly: { contact: !!phone }, remember_customer: true, theme: { color: '#c9480f' },
        config: { display: { blocks: { upi: { name: 'Pay with any UPI app', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: true } } },
        modal: { ondismiss: () => setStep('form'), confirm_close: true },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const v = await api.verifyPayment(r);
            window.dispatchEvent(new Event('sro:paid'));
            if (v.user) { api.emitUser(v.user); setResult(v.user); setStep('done'); }
            else setStep('otp'); // paid as guest → confirm the number to attach Jeet
          } catch (e) { setErr((e as Error).message + ' Your money is safe — SRO Jeet will activate within 2 minutes.'); setStep('form'); }
        },
      });
      rzp.on('payment.failed', (r) => { setErr(r.error?.description || 'Payment failed. No money was taken.'); setStep('form'); });
      rzp.open();
    } catch (e) { setErr((e as Error).message); setStep('form'); }
  }

  if (step === 'otp') return <Otp phone={phone} title="Payment successful 🎉" lead="Confirm your number to unlock SRO Jeet on this phone." onDone={(u) => { setResult(u); setStep('done'); }} />;
  if (step === 'done') {
    return (
      <div className="sheet-body center">
        <div className="burst" aria-hidden="true"><img src={asset('/i3d/party.webp')} width={96} height={96} alt="" /></div>
        <h2 id="sheet-h">{isMock ? 'Test unlocked 🎉' : 'Welcome to SRO Jeet'}</h2>
        <p className="muted">{isMock ? `${plan.name} is yours for a year.` : `${plan.name} is active${result?.planUntil ? ` till ${fmt(result.planUntil)}` : ''}.`} {result?.email ? <>A receipt is on its way to <b>{result.email}</b>.</> : 'Razorpay has sent your payment receipt.'} You can see it any time in <a href="/my/#purchases">My purchases</a>.</p>
        <ul className="sheet-list">{plan.yes.slice(0, 4).map((f) => <li key={f}><ICheck size={15} /> {f}</li>)}</ul>
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => { onClose(); if (isMock) location.href = `/test-series/${item!.key}/test/`; }}>{isMock ? 'Start the test now' : 'Start my first SRO Jeet test'}</button>
        <a className="btn btn-ghost btn-block" style={{ marginTop: 8 }} href="/refer/">Invite 3 friends → 1 month free</a>
      </div>
    );
  }

  return (
    <div className="sheet-body">
      <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
        <img src={asset(`/i3d/${plan.i3d}.webp`)} width={52} height={52} alt="" />
        <div style={{ minWidth: 0 }}>
          <h2 id="sheet-h" style={{ margin: 0 }}>{item ? 'Unlock this mock test' : 'Get SRO Jeet'}</h2>
          <p className="muted small" style={{ margin: 0 }}>{item ? item.title : 'Unlocks instantly · no auto-renewal'}</p>
        </div>
      </div>

      {item ? (
        // one test, or every test of the exam for a little more (the better deal is shown as the better deal)
        <div className="plan-pick mock-pick" role="radiogroup" aria-label="Choose what to unlock">
          <button type="button" role="radio" aria-checked={planId === 'mock'} className={`pp${planId === 'mock' ? ' on' : ''}`} onClick={() => setPlanId('mock')}>
            <b>This test</b>
            <span className="pp-amt">₹{item.price}</span>
            <span className="pp-per">1 test · 1 year</span>
          </button>
          <button type="button" role="radio" aria-checked={planId === 'jeet-exam'} className={`pp${planId === 'jeet-exam' ? ' on' : ''}`} onClick={() => setPlanId('jeet-exam')}>
            <span className="pp-tag">Best value</span>
            <b>All {item.examShort || 'exam'} tests</b>
            <span className="pp-amt">₹{planById('jeet-exam')!.price}</span>
            <span className="pp-per">every mock + PYQ test · 1 yr</span>
          </button>
          <button type="button" role="radio" aria-checked={planId === 'jeet-yr'} className={`pp${planId === 'jeet-yr' ? ' on' : ''}`} onClick={() => setPlanId('jeet-yr')}>
            <b>Every exam</b>
            <span className="pp-amt">₹{planById('jeet-yr')!.price}</span>
            <span className="pp-per">all exams · 1 yr</span>
          </button>
        </div>
      ) : (
      <div className="plan-pick" role="radiogroup" aria-label="Choose plan">
        {PAID.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={p.id === planId} className={`pp${p.id === planId ? ' on' : ''}`} onClick={() => setPlanId(p.id)}>
            {p.best && <span className="pp-tag">Popular</span>}
            <b>{p.short}</b>
            <span className="pp-amt">₹{p.price}</span>
            <span className="pp-per">{p.id === 'jeet-mo' ? '1 month' : p.id === 'jeet-2yr' ? '2 years' : p.id === 'jeet-exam' ? '1 exam · 1 yr' : '1 year'}</span>
          </button>
        ))}
      </div>
      )}

      <label className="fld">
        <span>Mobile number{user ? <small className="muted"> (optional)</small> : null}</span>
        <span className="fld-in"><span className="pre">+91</span>
          <input ref={phoneRef} inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && pay()} aria-invalid={!!err && !api.validPhone(phone)} />
        </span>
      </label>

      {isMock ? null : couponOpen ? (
        <div className="fld">
          <span>Coupon</span>
          <span className="fld-in"><input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase().slice(0, 16))} placeholder={LAUNCH_COUPON} autoCapitalize="characters" /><button type="button" className="btn btn-soft btn-sm" onClick={() => applyCoupon(coupon)}>Apply</button></span>
          {cMsg && <small className={off ? 'ok' : 'no'}>{cMsg}{off ? ` · ₹${off} off` : ''}</small>}
        </div>
      ) : (
        <button type="button" className="link-btn" onClick={() => { setCouponOpen(true); setCoupon(LAUNCH_COUPON); applyCoupon(LAUNCH_COUPON); }}>
          🎁 Launch offer: use <b>{LAUNCH_COUPON}</b> for ₹{planId === 'jeet-mo' ? 10 : 50} off
        </button>
      )}

      <div className="sum">
        <div className="row between"><span>{plan.name}</span><span>₹{plan.price}{plan.was ? <s className="muted"> ₹{plan.was}</s> : null}</span></div>
        {off > 0 && <div className="row between ok"><span>Coupon {coupon}</span><span>−₹{off}</span></div>}
        <div className="row between tot"><span>To pay</span><span>₹{total}</span></div>
      </div>

      {err && <p className="err" role="alert">{err}</p>}

      {needSignIn ? (
        <div className="pay-signin">
          <p className="small" style={{ margin: '0 0 8px', fontWeight: 600 }}>Step 1 · Sign in so it unlocks on your account</p>
          <GoogleButton cfg={cfg} onSignedIn={onSignedIn} onError={onGErr} />
        </div>
      ) : (
        <button type="button" className="btn btn-primary btn-block btn-lg pay" onClick={pay} disabled={step === 'paying' || (!user && !api.DEMO && cfg === null)}>
          {step === 'paying' ? <span className="spin" aria-hidden="true" /> : <IZap />} {step === 'paying' ? 'Opening payment…' : `Pay ₹${total} with UPI`}
        </button>
      )}
      <div className="upi-row" aria-label="Pay with Google Pay, PhonePe, Paytm, BHIM, cards or net banking">
        <span>GPay</span><span>PhonePe</span><span>Paytm</span><span>BHIM</span><span>Card</span><span>NetBanking</span>
      </div>
      <div className="trust"><span><ILock size={13} /> 100% secure · Razorpay</span><span><IShield size={13} /> Unlocks instantly on your account</span></div>
    </div>
  );
}

/* ---------- login ---------- */
function Login({ reason, onDone }: { reason?: string; onDone: () => void }) {
  const cfg = useConfig();
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const onSignedIn = useCallback(() => onDone(), [onDone]);
  const onGErr = useCallback((m: string) => setErr(m), []);
  const otp = api.DEMO || !!cfg?.otp;

  if (sent) return <Otp phone={phone} title="Enter the code" lead={`We sent a 6-digit code to +91 ${phone}.`} onDone={() => onDone()} onBack={() => setSent(false)} />;

  async function send() {
    setErr('');
    if (!api.validPhone(phone)) { setErr('Enter a valid 10-digit mobile number.'); return; }
    setBusy(true);
    try { await api.sendOtp(phone); setSent(true); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="sheet-body">
      <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
        <img src={asset('/i3d/medal.webp')} width={52} height={52} alt="" />
        <div><h2 id="sheet-h" style={{ margin: 0 }}>Sign in to SRO</h2><p className="muted small" style={{ margin: 0 }}>{reason || 'See your rank, sync progress on every device.'}</p></div>
      </div>
      <GoogleButton cfg={cfg} onSignedIn={onSignedIn} onError={onGErr} />
      {otp && (
        <>
          <div className="or"><span>or use your mobile</span></div>
          <label className="fld">
            <span>Mobile number</span>
            <span className="fld-in"><span className="pre">+91</span><input inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && send()} /></span>
          </label>
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      {otp && <button type="button" className="btn btn-primary btn-block btn-lg" onClick={send} disabled={busy}>{busy ? <span className="spin" aria-hidden="true" /> : null} Get OTP</button>}
      <ul className="sheet-list" style={{ marginTop: 14 }}>
        <li><ICheck size={15} /> One tap with the Google account on your phone</li>
        <li><ICheck size={15} /> No password, no long form — free forever</li>
      </ul>
      <p className="tiny muted" style={{ textAlign: 'center', margin: '10px 0 0' }}>By continuing you agree to the <a href="/terms-and-condition/">Terms</a> and <a href="/privacy-policy/">Privacy policy</a>. We never post anything or share your details.</p>
    </div>
  );
}

/* ---------- OTP (shared by login and guest checkout) ---------- */
function Otp({ phone, title, lead, onDone, onBack }: { phone: string; title: string; lead: string; onDone: (u: User) => void; onBack?: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [wait, setWait] = useState(30);
  const sentOnce = useRef(false);

  useEffect(() => { if (!sentOnce.current && !onBack) { sentOnce.current = true; api.sendOtp(phone).catch(() => {}); } }, [phone, onBack]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);
  // Android Chrome: read the SMS code automatically (WebOTP)
  useEffect(() => {
    if (!('OTPCredential' in window)) return;
    const ac = new AbortController();
    (navigator.credentials as unknown as { get(o: unknown): Promise<{ code?: string } | null> })
      .get({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then((c) => c?.code && setCode(c.code)).catch(() => {});
    return () => ac.abort();
  }, []);

  const verify = useCallback(async (c: string) => {
    setErr(''); setBusy(true);
    try { const u = await api.verifyOtp(phone, c, api.refCode()); api.emitUser(u); onDone(u); }
    catch (e) { setErr((e as Error).message); setBusy(false); }
  }, [phone, onDone]);
  useEffect(() => { if (code.length === 6) verify(code); }, [code, verify]);

  return (
    <div className="sheet-body">
      <h2 id="sheet-h" style={{ marginTop: 0 }}>{title}</h2>
      <p className="muted small">{lead}{onBack && <> <button type="button" className="link-btn" onClick={onBack}>Change</button></>}</p>
      <label className="fld">
        <span>6-digit code</span>
        <input className="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus aria-describedby="otp-help" />
      </label>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => verify(code)} disabled={busy || code.length !== 6}>{busy ? <span className="spin" aria-hidden="true" /> : null} Verify</button>
      <p id="otp-help" className="tiny muted" style={{ textAlign: 'center', margin: '10px 0 0' }}>
        {wait > 0 ? `Resend code in ${wait}s` : <button type="button" className="link-btn" onClick={() => { api.sendOtp(phone); setWait(30); }}>Resend code</button>}
      </p>
    </div>
  );
}
