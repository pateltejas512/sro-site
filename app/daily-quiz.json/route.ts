import { allQuestions, questionUrl, getExam } from '@/lib/data';
export const dynamic = 'force-static';
// Question pool for the Daily Quiz. Every visitor's browser picks the same 10 for the date (seeded),
// so the whole state plays the same quiz and scores are comparable — with no server work.
export function GET() {
  // questions whose options are pictures need the picture, so they stay out of the text-only quiz
  const pool = allQuestions.filter((q) => !q.figureMissing && !Object.values(q.text).some((t) => t!.options.some((o) => o.includes('](')))).map((q) => ({
    id: q.id, u: questionUrl(q), ex: getExam(q.examSlug)!.short, tp: q.topic, a: q.answer,
    t: Object.fromEntries(Object.entries(q.text).map(([l, t]) => [l, { s: t!.stem.replace(/\*\*/g, ''), o: t!.options.map((o) => o.replace(/\*\*/g, '')), q: t!.quick.replace(/\*\*/g, '') }])),
  }));
  return Response.json(pool);
}
