import { allQuestions } from '@/lib/data';
import type { Question } from '@/lib/types';

export const dynamic = 'force-static';
export const dynamicParams = false;

// Full step-by-step solutions, one small JSON per question (/sol/<id>.json, ≈1–2 KB).
// Paper and chapter pages ship only the question, options and quick explanation; the full solution
// is fetched the moment a student opens "View answer & solution", so long papers stay fast on 4G.
// The shareable preview (file-count limit) gets one combined /sol/all.json instead.
const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';

export type Sol = { p: string; d: Record<string, string>; q?: Record<string, string>; f?: Record<string, string[]>; t?: Record<string, string>; i?: string[] };
const solOf = (q: Question): Sol => {
  const d: Record<string, string> = {}, t: Record<string, string> = {}, qk: Record<string, string> = {}, f: Record<string, string[]> = {};
  for (const [l, x] of Object.entries(q.text)) {
    if (!x) continue;
    if (x.detailed) d[l] = x.detailed;
    if (x.tip) t[l] = x.tip;
    if (x.quick) qk[l] = x.quick;
    if (x.formula?.length) f[l] = x.formula;
  }
  return { p: q.primaryLang, d, q: qk, ...(Object.keys(f).length ? { f } : {}), ...(Object.keys(t).length ? { t } : {}), ...(q.solutionImages?.length && !PREVIEW ? { i: q.solutionImages } : {}) };
};

export function generateStaticParams() {
  return PREVIEW ? [{ id: 'all.json' }] : allQuestions.map((q) => ({ id: `${q.id}.json` }));
}

export function GET(_req: Request, { params }: { params: { id: string } }) {
  if (params.id === 'all.json') return Response.json(Object.fromEntries(allQuestions.map((q) => [q.id, solOf(q)])));
  const q = allQuestions.find((x) => `${x.id}.json` === params.id);
  return q ? Response.json(solOf(q)) : new Response('Not found', { status: 404 });
}
