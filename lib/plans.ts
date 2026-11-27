// Single source of truth for SRO Jeet plans (pricing page, checkout sheet, in-feed promos, backend).
// SRO Jeet is the bucket: rank, mock series, live tests, PDFs and analysis all live inside it.
export type PlanId = 'free' | 'jeet-exam' | 'jeet-yr' | 'jeet-2yr' | 'jeet-mo';
export interface Plan { id: PlanId; name: string; short: string; price: number; was?: number; per: string; i3d: string; tagline: string; yes: string[]; no?: string[]; best?: boolean }

export const BRAND = 'SRO Jeet';
export const LAUNCH_COUPON = 'JEET50'; // first 10,000 students; validated server-side

export const PLANS: Plan[] = [
  { id: 'free', name: 'Free', short: 'Free', price: 0, per: 'forever', i3d: 'gift', tagline: 'Practise every PYQ',
    yes: ['Every PYQ with verified solution', 'Practice mode with instant answers', 'Real exam mode on every PYQ', 'Score, accuracy & chapter analysis', 'English · हिन्दी · ગુજરાતી', 'Bookmarks, streak, Daily Quiz'],
    no: ['All-India rank & percentile', 'Jeet mock test series', 'PDF downloads'] },
  { id: 'jeet-exam', name: 'Jeet Exam', short: 'One exam', price: 149, was: 299, per: 'per year · one exam', i3d: 'ticket', tagline: 'For one target exam',
    yes: ['Everything in Free', 'Full mock series for 1 exam', 'All-India rank & percentile', 'Topper comparison & time analysis', 'PDF of every paper & topic', 'Unlimited re-attempts, ad-free'],
    no: ['Other exams'] },
  { id: 'jeet-yr', name: 'SRO Jeet', short: 'All exams', price: 349, was: 499, per: 'per year · every exam', i3d: 'crown', tagline: 'Most students choose this', best: true,
    yes: ['Everything in Jeet Exam', 'Every exam — SSC, Railway, Banking, State, Engineering', 'Live tests with All-India rank', 'Daily practice built from your mistakes', 'Weak-topic drills & revision alerts', 'Priority doubt help on Telegram'] },
  { id: 'jeet-2yr', name: 'Jeet 2 Years', short: '2 years', price: 599, per: 'for 2 years · ₹25/month', i3d: 'gem', tagline: 'Best value',
    yes: ['Everything in SRO Jeet', 'Covers two exam cycles', 'Price locked — no renewal hike'] },
];
export const MONTHLY: Plan = { id: 'jeet-mo', name: 'Jeet Monthly', short: 'Monthly', price: 49, per: 'per month', i3d: 'calendar', tagline: 'Try for a month', yes: ['Everything in SRO Jeet', 'No auto-renewal'] };
export const planById = (id: string) => [...PLANS, MONTHLY].find((p) => p.id === id);
