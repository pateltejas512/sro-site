import { SUBJECTS } from '@/lib/taxonomy';
import { subjectStats } from '@/lib/practice';
import { exams, papers, topicGroups, topicGroupUrl, chapterUrl, allQuestions, playable, examUrl, paperUrl, questionUrl, stemText, truncate, getExam } from '@/lib/data';
export const dynamic = 'force-static';
// Loaded only when the visitor focuses the search box — keeps every page light even with 100k questions.
export function GET() {
  const items = [
    ...exams.map((e) => ({ t: e.name, s: `${e.short} · ${e.authority}`, u: examUrl(e), k: 'Exam' })),
    ...papers.filter(playable).map((p) => ({ t: p.title, s: getExam(p.examSlug)!.short, u: paperUrl(p), k: 'Paper' })),
    ...SUBJECTS.flatMap((s) => subjectStats(s.slug)!.chapters.filter((c) => c.count > 0).map((c) => ({ t: `${c.chapter.name} MCQ`, s: `${s.name} · ${c.count} PYQs`, u: chapterUrl(s.slug, c.slug), k: 'Chapter' }))),
    ...topicGroups().map((g) => ({ t: `${g.topic} MCQ`, s: `${g.chapter} · ${g.questions.length} PYQs`, u: topicGroupUrl(g), k: 'Topic' })),
    ...allQuestions.map((q) => ({ t: truncate(stemText(q), 90), s: `${q.topic} · ${getExam(q.examSlug)!.short}`, u: questionUrl(q), k: 'Question' })),
  ];
  return Response.json(items);
}
