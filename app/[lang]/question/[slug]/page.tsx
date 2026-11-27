import { notFound } from 'next/navigation';
import QuestionView, { questionMeta } from '@/components/QuestionView';
import { allQuestions, getQuestion, defaultLang, pageLangs } from '@/lib/data';
import type { Lang } from '@/lib/types';

// /gu/question/{slug}/ and /hi/question/{slug}/ — a real, indexable page per language (own title, H1,
// description and Quiz schema), cross-linked with hreflang. Only languages the question is translated into.
export const dynamicParams = false;
export function generateStaticParams() {
  return allQuestions.flatMap((q) => pageLangs(q).filter((l) => l !== defaultLang(q)).map((lang) => ({ lang, slug: q.slug })));
}

const pick = (p: { lang: string; slug: string }) => {
  const q = getQuestion(p.slug);
  return q && pageLangs(q).includes(p.lang as Lang) && p.lang !== defaultLang(q) ? q : null;
};

export function generateMetadata({ params }: { params: { lang: string; slug: string } }) {
  const q = pick(params);
  return q ? questionMeta(q, params.lang as Lang) : {};
}

export default function LangQuestionPage({ params }: { params: { lang: string; slug: string } }) {
  const q = pick(params);
  if (!q) notFound();
  return <QuestionView q={q} lang={params.lang as Lang} />;
}
