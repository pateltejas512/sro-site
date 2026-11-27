'use client';
// Client for the sro-api WordPress plugin (wp-json/sro/v1). Same origin in production, so the
// session lives in an httpOnly cookie and never touches JavaScript. When NEXT_PUBLIC_SRO_API is not
// set (local dev / shareable preview) every call runs in a clearly labelled demo mode.
import type { PlanId } from './plans';
import { planById } from './plans';

export const API = process.env.NEXT_PUBLIC_SRO_API || '';
export const DEMO = !API;
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

/** What the server has switched on. Read at run time, so adding a key in WordPress needs no rebuild. */
export interface Config { google: string; otp: boolean }
let cfgP: Promise<Config> | null = null;
export function getConfig(): Promise<Config> {
  if (DEMO) return Promise.resolve({ google: '', otp: true });
  if (!cfgP) {
    cfgP = call<Partial<Config>>('/config')
      .then((c) => ({ google: c.google || GOOGLE_CLIENT_ID, otp: !!c.otp }))
      .catch(() => { cfgP = null; return { google: GOOGLE_CLIENT_ID, otp: false }; });
  }
  return cfgP;
}

export interface User { id: number; name: string; phone?: string; email?: string; plan: PlanId | 'free'; planUntil?: string; refCode: string }
export interface Order { orderId: string; keyId: string; amount: number; currency: 'INR'; plan: PlanId; name: string; contact: string }

const DEMO_KEY = 'sro:demo-user';
const readDemo = (): User | null => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch { return null; } };
const writeDemo = (u: User | null) => { try { u ? localStorage.setItem(DEMO_KEY, JSON.stringify(u)) : localStorage.removeItem(DEMO_KEY); } catch {} };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(API + path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-SRO': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { message?: string }).message || 'Something went wrong. Please try again.');
  return data as T;
}

export const validPhone = (p: string) => /^[6-9]\d{9}$/.test(p.replace(/\D/g, '').slice(-10));
export const cleanPhone = (p: string) => p.replace(/\D/g, '').slice(-10);

export function emitUser(u: User | null) { window.dispatchEvent(new CustomEvent('sro:user', { detail: u })); }

export async function me(): Promise<User | null> {
  if (DEMO) return readDemo();
  try { return (await call<{ user: User | null }>('/me')).user; } catch { return null; }
}

export async function sendOtp(phone: string): Promise<void> {
  if (DEMO) { await wait(500); return; }
  await call('/auth/otp/send', { phone: cleanPhone(phone) });
}

export async function verifyOtp(phone: string, code: string, ref?: string): Promise<User> {
  if (DEMO) {
    await wait(500);
    if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code.');
    const prev = readDemo();
    const u: User = prev ?? { id: 1, name: 'Student', phone: cleanPhone(phone), plan: 'free', refCode: 'SRO' + cleanPhone(phone).slice(-4) };
    writeDemo({ ...u, phone: cleanPhone(phone) });
    return { ...u, phone: cleanPhone(phone) };
  }
  return (await call<{ user: User }>('/auth/otp/verify', { phone: cleanPhone(phone), code, ref })).user;
}

export async function googleLogin(credential: string, ref?: string): Promise<User> {
  return (await call<{ user: User }>('/auth/google', { credential, ref })).user;
}

export async function demoGoogle(): Promise<User> {
  await wait(400);
  const u: User = readDemo() ?? { id: 1, name: 'Demo Student', email: 'student@example.com', plan: 'free', refCode: 'SRODEMO' };
  writeDemo(u);
  return u;
}

export async function logout() {
  accessP = null;
  if (DEMO) { writeDemo(null); return; }
  await call('/auth/logout', {});
}

/* ---------- what the signed-in student owns (SRO Studio: /sro-studio/v1/me/access) ---------- */
export const STUDIO = API ? API.replace(/\/sro\/v1\/?$/, '/sro-studio/v1') : '';
export interface OwnedItem { kind: 'jeet' | 'exam' | 'mock'; title: string; until: string; url: string }
export interface OldItem { title: string; until: string; active: boolean; url: string; date: string }
export interface Payment { title: string; amount: number; date: string; payment: string }
export interface Access {
  signedIn: boolean; name?: string; email?: string;
  all?: string | null; exams?: Record<string, string>; papers?: Record<string, string>;
  items?: OwnedItem[]; old?: OldItem[]; orders?: Payment[];
}
let accessP: Promise<Access | null> | null = null;
/** Cached per page load; pass fresh=true after sign-in, sign-out or a payment. */
export function myAccess(fresh = false): Promise<Access | null> {
  if (DEMO || !STUDIO) return Promise.resolve(null);
  if (!accessP || fresh) {
    accessP = fetch(`${STUDIO}/me/access`, { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return accessP;
}
/** Till when this student may open what a buy button sells (null = not owned). */
export function ownedUntil(a: Access | null, kind: string, key: string): string | null {
  if (!a || !a.signedIn) return null;
  const today = new Date().toISOString().slice(0, 10);
  const ok = (d?: string | null) => (d && d >= today ? d : null);
  if (kind === 'mock') { const exam = key.split('/')[0]; return ok(a.papers?.[key]) || ok(a.exams?.[exam]) || ok(a.all); }
  if (kind === 'exam') return ok(a.exams?.[key]) || ok(a.all);
  return ok(a.all); // SRO Jeet plans
}

export async function checkCoupon(code: string, plan: PlanId): Promise<{ ok: boolean; off: number; message: string }> {
  if (DEMO) {
    await wait(300);
    return code.trim().toUpperCase() === 'JEET50' ? { ok: true, off: plan === 'jeet-mo' ? 10 : 50, message: 'JEET50 applied' } : { ok: false, off: 0, message: 'This coupon is not valid' };
  }
  return call('/coupon', { code, plan });
}

/** plan 'mock' = one mock test (exam = "exam/paper", priced on the server by SRO Studio). */
export async function createOrder(plan: PlanId | 'mock', phone: string, coupon?: string, ref?: string, exam?: string, demoPrice = 0): Promise<Order> {
  if (DEMO) {
    await wait(500);
    const price = plan === 'mock' ? demoPrice : planById(plan)!.price;
    return { orderId: 'order_DEMO', keyId: 'rzp_demo', amount: price * 100, currency: 'INR', plan: plan as PlanId, name: 'SRO Jeet', contact: cleanPhone(phone) };
  }
  return call('/pay/order', { plan, phone: cleanPhone(phone), coupon, ref, exam });
}

/** Verifies the Razorpay signature server-side. Signed-in buyers get Jeet at once; a guest buyer's order is
 *  held against the phone number and attached the moment that number is confirmed by OTP (no account takeover). */
export async function verifyPayment(p: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<{ user: User | null }> {
  return call<{ user: User | null }>('/pay/verify', p);
}

export const refCode = (): string | undefined => { try { return localStorage.getItem('sro:ref') || undefined; } catch { return undefined; } };

export async function demoActivate(plan: PlanId, phone: string): Promise<User> {
  await wait(1100);
  const days = plan === 'jeet-2yr' ? 730 : plan === 'jeet-mo' ? 30 : 365;
  const until = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
  const u: User = { ...(readDemo() ?? { id: 1, name: 'Student', refCode: 'SRO' + cleanPhone(phone).slice(-4) }), phone: cleanPhone(phone), plan, planUntil: until } as User;
  writeDemo(u);
  return u;
}

export async function submitAttempt(a: { paperKey: string; answers: Record<string, string>; seconds: number }): Promise<{ score: number; rank: number; total: number; percentile: number | null }> {
  return call('/attempts', a);
}

export async function leaderboard(paperKey: string): Promise<{ rows: { rank: number; name: string; score: number }[]; total: number }> {
  if (DEMO) return { rows: [], total: 0 };
  return call(`/leaderboard?paper=${encodeURIComponent(paperKey)}`);
}

export async function referrals(): Promise<{ joined: number; qualified: number; rewards: number; perReward: number }> {
  if (DEMO) return { joined: 0, qualified: 0, rewards: 0, perReward: 3 };
  return call('/referrals');
}

/** Loads Razorpay Checkout on demand (only when someone actually pays). */
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
