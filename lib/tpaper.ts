// Turns site questions into the test engine's compact shape (shared by the PYQ and mock test screens,
// and by the mock runner for questions that arrive from the API).
import type { Question } from './types';
import type { TQ } from '@/components/TestEngine';

const strip = (s: string) => s.replace(/\*\*/g, '');

export function toTQ(q: Question, withSlug = true): TQ {
  return {
    id: q.id, qNo: q.qNo, section: q.section || q.subject, chapter: q.chapter, topic: q.topic, answer: q.answer, slug: withSlug ? q.slug : '',
    ...(q.figure ? { figure: q.figure } : {}),
    text: Object.fromEntries(Object.entries(q.text).map(([l, t]) => [l, {
      stem: strip(t!.stem),
      options: t!.options.map(strip),
      // mocks have no solution page, so the engine shows the whole explanation
      quick: strip(withSlug ? t!.quick : [t!.quick, t!.detailed, t!.tip ? `Tip: ${t!.tip}` : ''].filter(Boolean).join('\n\n')),
    }])),
  };
}
