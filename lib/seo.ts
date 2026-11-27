import type { Metadata } from 'next';
import type { Exam, Paper, Question } from './types';
import { SITE, seoText, truncate, questionUrlIn, defaultLang, paperUrl, examUrl, examOf, paperOf, plain, chapterInfo } from './data';
import type { Lang } from './langs';

export const abs = (path: string) => `${SITE.url}${path}`;

export function meta(opts: { title: string; description: string; path: string; noindex?: boolean; type?: 'website' | 'article'; languages?: Record<string, string>; locale?: string; image?: string }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: abs(opts.path), ...(opts.languages ? { languages: Object.fromEntries(Object.entries(opts.languages).map(([k, v]) => [k, abs(v)])) } : {}) },
    robots: opts.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    openGraph: { title: opts.title, description: opts.description, url: abs(opts.path), siteName: SITE.name, type: opts.type ?? 'website', locale: opts.locale ?? 'en_IN', ...(opts.image ? { images: [{ url: abs(opts.image), width: 1200, height: 675, alt: opts.title }] } : {}) },
    twitter: { card: 'summary_large_image', title: opts.title, description: opts.description, ...(opts.image ? { images: [abs(opts.image)] } : {}) },
  };
}

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

const KEYS = ['A', 'B', 'C', 'D'] as const;

/** Google Education Q&A markup for one question. */
export function questionLd(q: Question, lang?: Lang) {
  const l = lang && q.text[lang] ? lang : defaultLang(q);
  const t = q.text[l] ?? seoText(q);
  const correct = KEYS.indexOf(q.answer);
  const p = paperOf(q);
  return {
    '@type': 'Question',
    eduQuestionType: 'Multiple choice',
    learningResourceType: 'Practice problem',
    name: truncate(plain(t.stem), 110),
    text: plain(t.stem),
    encodingFormat: 'text/html',
    url: abs(questionUrlIn(q, l === defaultLang(q) ? undefined : l)),
    inLanguage: l,
    about: [chapterInfo(q).name, q.topic, ...(q.subtopic ? [q.subtopic] : [])].map((name) => ({ '@type': 'Thing', name })),
    isPartOf: { '@type': 'CreativeWork', name: p.title, url: abs(paperUrl(p)) },
    suggestedAnswer: t.options
      .map((o, i) => ({ '@type': 'Answer', position: i, text: plain(o), encodingFormat: 'text/html' }))
      .filter((_, i) => i !== correct),
    acceptedAnswer: {
      '@type': 'Answer',
      position: correct,
      text: plain(t.options[correct]),
      encodingFormat: 'text/html',
      answerExplanation: { '@type': 'Comment', text: plain(t.quick), encodingFormat: 'text/html' },
    },
  };
}

export function quizLd(qs: Question[], about: string, subject: string, path: string, lang?: Lang) {
  return {
    '@type': 'Quiz',
    name: about,
    url: abs(path),
    about: { '@type': 'Thing', name: about },
    inLanguage: lang ?? 'en',
    educationalAlignment: [{ '@type': 'AlignmentObject', alignmentType: 'educationalSubject', targetName: subject }],
    publisher: { '@id': `${SITE.url}/#org` },
    // Google reads the first questions; keeping the list short keeps big chapter/paper pages light.
    hasPart: qs.slice(0, 20).map((q) => questionLd(q, lang)),
  };
}

export const orgLd = () => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#org`,
  name: SITE.name,
  url: SITE.url,
  logo: abs('/icon.svg'),
  sameAs: [SITE.telegram],
});

export function itemListLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

export const faqLd = (faqs: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

// Title formulas from the blueprint (≤ 60 chars where possible).
export const titles = {
  exam: (e: Exam, from: number, to: number) => e.seoTitle || `${e.short} Previous Year Question Paper ${from === to ? from : `${from}–${to}`} with Solutions`,
  paper: (p: Paper) => p.seoTitle || `${p.title} with Answers`,
  question: (q: Question) => `[Solved] ${truncate(plain(seoText(q).stem), 62)}`,
  topic: (topic: string, n: number) => `${topic} MCQ [Free PDF] – ${n} Objective Questions with Answers`,
};

export { paperUrl, examUrl };
