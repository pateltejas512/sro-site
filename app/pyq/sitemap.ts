import type { MetadataRoute } from 'next';
import { SUBJECTS } from '@/lib/taxonomy';
import { currentAffairs } from '@/data/current-affairs';
import { BOARDS } from '@/data/boards';
import { subjectStats } from '@/lib/practice';
import { exams, papers, mocks, mockUrl, allQuestions, topicPageGroups, topicGroupUrl, chapterUrl, playable, paperUrl, questionUrl, questionUrlIn, pageLangs, defaultLang, SITE } from '@/lib/data';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string, priority: number) => ({ url: `${SITE.url}${p}`, lastModified: SITE.updated, priority });
  return [
    u('/', 1),
    u('/pyq/', 1),
    u('/exams/', 0.95),
    ...BOARDS.map((b) => u(`/exams/${b.slug}/`, 0.85)),
    u('/request-paper/', 0.5),
    u('/daily-quiz/', 0.8),
    u('/jeet/', 0.7),
    ...exams.map((e) => u(`/pyq/${e.slug}/`, 0.9)),
    ...papers.filter(playable).map((p) => u(paperUrl(p), 0.8)),
    u('/test-series/', 0.9),
    ...exams.map((e) => u(`/test-series/${e.slug}/`, 0.9)),
    ...mocks.map((p) => u(mockUrl(p), 0.85)),
    u('/mcq/', 0.8),
    ...SUBJECTS.map((s) => u(`/mcq/${s.slug}/`, 0.7)),
    u('/current-affairs/', 0.8),
    ...currentAffairs.map((d) => u(`/current-affairs/${d.date}/`, 0.6)),
    ...SUBJECTS.flatMap((s) => subjectStats(s.slug)!.chapters.filter((c) => c.count > 0).map((c) => u(chapterUrl(s.slug, c.slug), 0.7))),
    ...topicPageGroups().map((g) => u(topicGroupUrl(g), 0.6)),
    ...allQuestions.map((q) => ({ ...u(questionUrl(q), 0.5), lastModified: q.updated ?? SITE.updated })),
    ...allQuestions.flatMap((q) => pageLangs(q).filter((l) => l !== defaultLang(q)).map((l) => ({ ...u(questionUrlIn(q, l), 0.5), lastModified: q.updated ?? SITE.updated }))),
  ];
}
