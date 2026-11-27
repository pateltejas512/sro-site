// Joins the question bank to the subject → chapter taxonomy (counts, topic links, "coming soon" chapters).
import { topicGroups, type TopicGroup } from './data';
import { SUBJECTS, chapterSlug, getSubject, type Chapter, type Subject } from './taxonomy';

export interface ChapterStat { chapter: Chapter; slug: string; topics: TopicGroup[]; count: number; planned: string[] }
export interface SubjectStat { subject: Subject; chapters: ChapterStat[]; count: number; topics: number }

export function subjectStats(slug: string): SubjectStat | undefined {
  const subject = getSubject(slug);
  if (!subject) return undefined;
  const groups = topicGroups().filter((g) => g.subjectSlug === slug);
  const chapters: ChapterStat[] = subject.chapters.map((c) => ({ chapter: c, slug: chapterSlug(c), topics: [], count: 0, planned: [] }));
  for (const g of groups) {
    const st = chapters.find((x) => x.slug === g.chapterSlug) ?? chapters[0];
    st.topics.push(g);
    st.count += g.questions.length;
  }
  for (const st of chapters) st.planned = (st.chapter.topics ?? []).filter((t) => !st.topics.some((g) => g.topic.toLowerCase() === t.toLowerCase()));
  return { subject, chapters, count: chapters.reduce((a, c) => a + c.count, 0), topics: groups.length };
}

export const allSubjectStats = () => SUBJECTS.map((s) => subjectStats(s.slug)!);

/** One chapter with its questions, for /mcq/{subject}/{chapter}/. */
export function chapterStat(subjectSlug: string, chapter: string) {
  const st = subjectStats(subjectSlug);
  const c = st?.chapters.find((x) => x.slug === chapter);
  return st && c ? { subject: st.subject, ...c, others: st.chapters.filter((x) => x.slug !== chapter) } : undefined;
}
