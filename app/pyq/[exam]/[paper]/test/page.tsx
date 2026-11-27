import { notFound } from 'next/navigation';
import { type TPaper } from '@/components/TestEngine';
import PaperTest from '@/components/PaperTest';
import { papers, getExam, getPaper, questionsForPaper, playable, paperUrl, orderLangs, partsOf, partOfQ } from '@/lib/data';
import { meta } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return papers.filter(playable).map((p) => ({ exam: p.examSlug, paper: p.slug })); }
export function generateMetadata({ params }: { params: { exam: string; paper: string } }) {
  const p = getPaper(params.exam, params.paper);
  if (!p) return {};
  // App screen: kept out of the index so Google ranks the paper page itself.
  return meta({ title: `${p.title} – Real Exam Mode`, description: `Attempt ${p.title} as a timed CBT.`, path: `${paperUrl(p)}test/`, noindex: true });
}

export default function TestPage({ params }: { params: { exam: string; paper: string } }) {
  const p = getPaper(params.exam, params.paper);
  if (!p) notFound();
  const e = getExam(p.examSlug)!;
  const qs = questionsForPaper(p);
  const parts = partsOf(p, qs);
  const perQ = p.minutes && p.totalQuestions ? (p.minutes * 60) / p.totalQuestions : 60;
  const data: TPaper = {
    key: `${p.examSlug}/${p.slug}`,
    title: p.title,
    examShort: e.short,
    paperUrl: paperUrl(p),
    seconds: Math.round(perQ * qs.length),
    negative: p.negative ?? 0,
    langs: orderLangs(p.languages),
    heldOn: p.heldOn,
    cover: { t1: e.cover.t1, t2: e.cover.t2, t3: String(p.year), cls: `c-${e.category}` },
    questions: qs.map((q) => ({
      id: q.id, qNo: q.qNo, section: (parts.length > 1 && partOfQ(parts, q.qNo)?.name) || q.section, chapter: q.chapter, topic: q.topic, answer: q.answer, slug: q.slug,
      ...(q.figure ? { figure: q.figure } : {}),
      text: Object.fromEntries(Object.entries(q.text).map(([l, t]) => [l, { stem: t!.stem.replace(/\*\*/g, ''), options: t!.options.map((o) => o.replace(/\*\*/g, '')), quick: t!.quick.replace(/\*\*/g, '') }])),
    })),
  };
  return <PaperTest paper={data} perQ={perQ} parts={parts.map(({ slug, name, from, to }) => ({ slug, name, from, to }))} />;
}
