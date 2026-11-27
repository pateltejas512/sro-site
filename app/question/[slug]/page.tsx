import { notFound } from 'next/navigation';
import QuestionView, { questionMeta } from '@/components/QuestionView';
import { allQuestions, getQuestion, defaultLang } from '@/lib/data';

export const dynamicParams = false;
export function generateStaticParams() { return allQuestions.map((q) => ({ slug: q.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }) {
  const q = getQuestion(params.slug);
  return q ? questionMeta(q, defaultLang(q)) : {};
}

export default function QuestionPage({ params }: { params: { slug: string } }) {
  const q = getQuestion(params.slug);
  if (!q) notFound();
  return <QuestionView q={q} lang={defaultLang(q)} />;
}
