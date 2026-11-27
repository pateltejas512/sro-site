// Data model mirrors the production database described in the blueprint:
// exams -> papers -> paper_questions -> questions (+ question_i18n per language).

import type { Lang } from './langs';
export type { Lang };
export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'Easy' | 'Moderate' | 'Hard';

export interface QuestionText {
  stem: string;
  options: [string, string, string, string];
  quick: string; // one-paragraph answer shown first (also feeds the meta description)
  formula?: string[]; // key relations, one per line
  detailed?: string; // markdown-ish: blank line = new paragraph, "### " = sub-heading
  tip?: string;
}

export interface Question {
  id: string; // stable uid, e.g. SRO-RRBJE-2026-C2-Q004
  slug: string; // permanent URL: /question/{slug}/
  examSlug: string;
  paperSlug: string;
  qNo: number;
  section: string; // section of the paper (for the test palette)
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  concept?: string; // the exact idea tested, e.g. "Direction and Magnitude of Induced EMF"
  difficulty: Difficulty;
  answer: OptionKey;
  verifiedBy: string;
  primaryLang: Lang;
  figureMissing?: boolean; // question refers to a figure not yet uploaded
  year?: number;
  liveUrl?: string; // old WordPress URL (301s to /question/{slug}/)
  solutionImages?: string[];
  updated?: string; // YYYY-MM-DD when this question was last published (SRO Studio)
  figure?: string; // figure/diagram image (uploaded in SRO Studio)
  lazyLangs?: boolean; // other languages load on demand on list pages (public/i18n/q/<id>.json)
  text: Partial<Record<Lang, QuestionText>>;
}

export interface Paper {
  slug: string; // e.g. 2024-05-08-shift-4
  examSlug: string;
  title: string; // human title used in H1
  shortTitle: string;
  year: number;
  heldOn?: string; // ISO date
  shift?: string;
  stage?: string;
  totalQuestions?: number; // official count, when known
  marks?: number;
  minutes?: number;
  negative?: number; // marks deducted per wrong answer
  languages: Lang[];
  status: 'complete' | 'partial' | 'import-pending' | 'auto';
  seoTitle?: string;
  seoDescription?: string; // auto = worked out from the question count (SRO Studio)
  importedQuestions?: number; // shown when status is import-pending (live DB count)
  /* mock tests (SRO Studio, kind = 'mock'): /test-series/{exam}/{slug}/ */
  kind?: 'pyq' | 'mock';
  premium?: boolean; // SRO Jeet: only the first freeQuestions are in the static site, the rest come from the API
  freeQuestions?: number;
  liveQuestions?: number; // questions live in Studio (premium: more than the public ones)
  sections?: { name: string; n: number }[]; // subject-wise question count of the full test
  about?: string;
  legacyAttempts?: number; // attempts on the old mock test system
  price?: number; // ₹ to buy this one premium mock (SRO Studio); SRO Jeet unlocks it too
  image?: string; // cover uploaded in Studio (generated covers in public/covers win)
  gallery?: string[];
  highlights?: string[];
}

export interface Exam {
  slug: string;
  name: string;
  short: string;
  authority: string;
  state?: string;
  category: string; // a category slug (data/exams.ts, editable in SRO Studio → Library)
  seoTitle?: string;
  seoDescription?: string;
  description: string;
  pattern?: { label: string; value: string }[];
  faqs?: { q: string; a: string }[];
  icon: string; // short text badge, e.g. "RRB"
  iconUrl?: string; // uploaded icon image (SRO Studio); shown instead of the 3D icon
  board?: string; // data/boards.ts slug this exam belongs to (SRO Studio)
  seeded?: boolean;
  i3d: string; // 3D icon name in /public/i3d
  cover: { t1: string; t2: string; t3: string; icon: string };
}
