import { exams as baseExams, papers as basePapers, categories as baseCategories } from '@/data/exams';
import studio from '@/data/studio/export.json';
import { rrbJeCbt2Questions } from '@/data/rrb-je-2026-cbt2';
import { cceQuestions } from '@/data/gsssb-cce-2024-05-08-s4';
import liveQuestions from '@/data/live/questions.json';
import liveI18n from '@/data/live/i18n.json';
import type { Exam, Lang, Paper, Question, QuestionText } from './types';
import { slugify, plain } from './slug';
import { chapterOf, chapterSlug, getSubject, type Chapter } from './taxonomy';
export { slugify, plain };

export const SITE = {
  name: 'SarkariResultOut',
  short: 'SRO',
  url: 'https://sarkariresultout.com',
  telegram: 'https://t.me/nataregistration',
  updated: '2026-10-23',
};

import { LANG_INFO, LANGS, LIVE_LANGS } from './langs';
export { LANGS, LIVE_LANGS };
export const LANG_LABEL = Object.fromEntries(LANGS.map((l) => [l.code, l.native])) as Record<Lang, string>;
export const LANG_SHORT = Object.fromEntries(LANGS.map((l) => [l.code, l.short])) as Record<Lang, string>;
export const langInfo = (l: Lang) => LANG_INFO[l];

// Local papers + every question imported from the live WordPress bank (scripts/import-live.mjs).
// Translations (data/i18n → scripts/merge-i18n.mjs) are merged in: stem, options and quick explanation per language.
const I18N = liveI18n as unknown as Record<string, Partial<Record<Lang, Pick<QuestionText, 'stem' | 'options' | 'quick'>>>>;
const withI18n = (q: Question): Question => {
  const tr = I18N[q.id];
  if (!tr) return q;
  const text = { ...q.text };
  for (const [l, t] of Object.entries(tr) as [Lang, QuestionText][]) if (!text[l]) text[l] = { stem: t.stem, options: t.options, quick: t.quick };
  return { ...q, text, lazyLangs: true };
};
const seedQuestions: Question[] = [...rrbJeCbt2Questions, ...cceQuestions, ...(liveQuestions as unknown as Question[]).map(withI18n)];

/* ---------- SRO Studio content (scripts/pull-studio.mjs → data/studio/export.json) ----------
   Studio exams/papers replace the built-in ones with the same slug (e.g. a new icon) and add new ones;
   Studio questions are added to the bank. Hidden items are dropped. */
type StudioExport = { version: number; exams: Exam[]; papers: Paper[]; questions: Question[]; hidden?: { exams?: string[]; papers?: string[] } };
const ST = studio as unknown as StudioExport;
const hiddenExams = new Set(ST.hidden?.exams ?? []);
const hiddenPapers = new Set(ST.hidden?.papers ?? []);
function mergeBy<T>(base: T[], extra: T[], key: (x: T) => string, hidden: Set<string>): T[] {
  const map = new Map<string, T>();
  for (const x of base) map.set(key(x), x);
  for (const x of extra) map.set(key(x), { ...(map.get(key(x)) ?? {}), ...x });
  return [...map.values()].filter((x) => !hidden.has(key(x)));
}
/* A paper re-uploaded in Studio replaces the old built-in copy of the same questions. A Studio question whose text
   matches an old one takes over its slug, so the old /question/ URL keeps its ranking; the old copy is dropped. */
const stemKey = (q: Question) => plain(Object.values(q.text)[0]?.stem ?? '').toLowerCase().replace(/[^a-z0-9\u0900-\u0aff]+/g, '').slice(0, 60);
const studioPaperKeys = new Set((ST.questions ?? []).map((q) => `${q.examSlug}/${q.paperSlug}`));
const seedByStem = new Map<string, Question>();
for (const q of seedQuestions) if (studioPaperKeys.has(`${q.examSlug}/${q.paperSlug}`)) seedByStem.set(`${q.examSlug}/${q.paperSlug}/${stemKey(q)}`, q);
const takenSlug = new Map<string, string>(); // studio id → old slug
const replacedSeed = new Set<string>();
for (const q of ST.questions ?? []) {
  const old = seedByStem.get(`${q.examSlug}/${q.paperSlug}/${stemKey(q)}`);
  if (old && !replacedSeed.has(old.id)) { replacedSeed.add(old.id); takenSlug.set(q.id, old.slug); }
}
const baseQuestions: Question[] = seedQuestions.filter((q) => !replacedSeed.has(q.id));
const baseIds = new Set(baseQuestions.map((q) => q.id));
const baseSlugs = new Set(baseQuestions.map((q) => q.slug));
/* Mock tests (Studio papers with kind 'mock') live apart from the previous year papers: their own pages under
   /test-series/, and their questions never become /question/ or /mcq/ pages (no thin duplicates for Google). */
const mockKeys = new Set((ST.papers ?? []).filter((p) => p.kind === 'mock').map((p) => `${p.examSlug}/${p.slug}`));
const isMockQ = (q: Question) => mockKeys.has(`${q.examSlug}/${q.paperSlug}`);
/* A subject typed outside the site's list (e.g. "Gujarati Language and Grammar" from an Excel) is filed under the
   nearest real subject, so every question gets a proper /mcq/ page instead of an orphan one. */
const SUBJECT_HINTS: [RegExp, string][] = [
  [/gujarati|ગુજરાતી/i, 'Gujarati'], [/hindi|हिन्दी|हिंदी/i, 'Hindi'], [/english/i, 'English'],
  [/reason|mental ability|logical/i, 'Reasoning'], [/quant|math|arithmetic|aptitude|numerical/i, 'Quantitative Aptitude'],
  [/computer|ict|information tech/i, 'Computer Science'], [/electrical/i, 'Electrical Engineering'], [/civil/i, 'Civil Engineering'],
  [/mechanical/i, 'Mechanical Engineering'], [/electronic|communication/i, 'Electronics & Communication'],
  [/science|physics|chemistry|biology/i, 'General Science'], [/general|g\.?k|current|polity|history|geography|economy|constitution/i, 'General Knowledge'],
];
const normSubject = (q: Question): Question => {
  if (getSubject(slugify(q.subject))) return q;
  const hit = SUBJECT_HINTS.find(([re]) => re.test(q.subject || ''));
  return hit ? { ...q, subject: hit[1], section: q.section && q.section === q.subject ? hit[1] : q.section } : q;
};
const studioQuestions = (ST.questions ?? []).filter((q) => !baseIds.has(q.id) && !isMockQ(q)).map(normSubject).map((q) => (takenSlug.has(q.id) ? { ...q, slug: takenSlug.get(q.id)! } : baseSlugs.has(q.slug) ? { ...q, slug: `${q.slug}-${q.id.slice(-4).toLowerCase()}` } : q));
export const allQuestions: Question[] = [...baseQuestions, ...studioQuestions];
const mockQs: Question[] = (ST.questions ?? []).filter(isMockQ);
export const exams: Exam[] = mergeBy(baseExams, ST.exams ?? [], (e) => e.slug, hiddenExams);
export const papers: Paper[] = mergeBy(basePapers, (ST.papers ?? []).filter((p) => p.kind !== 'mock'), (p) => `${p.examSlug}/${p.slug}`, hiddenPapers)
  .filter((p) => exams.some((e) => e.slug === p.examSlug))
  .map((p) => {
    if (p.status !== 'auto') return p;
    const n = allQuestions.filter((q) => q.examSlug === p.examSlug && q.paperSlug === p.slug).length;
    return { ...p, status: n === 0 ? 'import-pending' : p.totalQuestions && n >= p.totalQuestions ? 'complete' : 'partial', ...(n === 0 ? { importedQuestions: 0 } : {}) };
  });
export const STUDIO_VERSION = ST.version ?? 0;

/* ---------- mock tests ---------- */
/** Public questions of a mock: all of a free mock, the free preview of a premium one. */
export const questionsForMock = (p: Paper) => mockQs.filter((q) => q.examSlug === p.examSlug && q.paperSlug === p.slug).sort((a, b) => a.qNo - b.qNo);
/** Published mock tests that have questions, newest numbers last (Mock Test 1, 2, 3…). */
export const mocks: Paper[] = (ST.papers ?? [])
  .filter((p) => p.kind === 'mock' && exams.some((e) => e.slug === p.examSlug) && (p.liveQuestions ?? 0) > 0 && (questionsForMock(p).length > 0 || !!p.premium))
  .sort((a, b) => a.examSlug.localeCompare(b.examSlug) || a.title.localeCompare(b.title, 'en', { numeric: true }));
export const mocksForExam = (exam: string) => mocks.filter((p) => p.examSlug === exam);
export const getMock = (exam: string, slug: string) => mocks.find((p) => p.examSlug === exam && p.slug === slug);
export const mockUrl = (p: Paper) => `/test-series/${p.examSlug}/${p.slug}/`;
/** Questions in the full test (premium: includes the ones only members get). */
export const mockSize = (p: Paper) => p.liveQuestions ?? questionsForMock(p).length;
type Category = { slug: string; name: string; blurb: string; i3d: string; tint: string };
const studioCats = (studio as unknown as { library?: { categories?: Category[] } }).library?.categories;
const builtInCats = baseCategories as unknown as Category[];
/** Exam categories: SRO Studio → Library order and names when present, built-in list otherwise. */
export const categories: Category[] = studioCats?.length ? studioCats.map((c) => ({ ...(builtInCats.find((b) => b.slug === c.slug) ?? {}), ...c })) : builtInCats;


export const getExam = (slug: string): Exam | undefined => exams.find((e) => e.slug === slug);
export const papersForExam = (slug: string) =>
  papers.filter((p) => p.examSlug === slug).sort((a, b) => b.year - a.year || (b.heldOn ?? '').localeCompare(a.heldOn ?? ''));
export const getPaper = (exam: string, slug: string): Paper | undefined =>
  papers.find((p) => p.examSlug === exam && p.slug === slug);
/* ---------- paper parts (Part A / Part B, or the subject sections of a paper) ----------
   From data/paper-parts.json (written when a shift paper is imported), else the paper's own subject sections. */
import paperParts from '@/data/paper-parts.json';
export interface PaperPart { slug: string; name: string; sub?: string; from: number; to: number; count: number }
const PARTS = paperParts as unknown as Record<string, { name: string; sub?: string; from: number; to: number }[]>;
export function partsOf(p: Paper, qs: Question[]): PaperPart[] {
  let raw = PARTS[`${p.examSlug}/${p.slug}`];
  if (!raw) {
    raw = [];
    for (const q of [...qs].sort((a, b) => a.qNo - b.qNo)) {
      const last = raw[raw.length - 1];
      if (last && last.name === q.section) last.to = q.qNo; else raw.push({ name: q.section, from: q.qNo, to: q.qNo });
    }
    if (raw.length < 2 || raw.length > 8 || raw.some((r) => r.to - r.from < 4)) return [];
  }
  return raw.map((r) => ({ ...r, slug: slugify(r.name), count: qs.filter((q) => q.qNo >= r.from && q.qNo <= r.to).length })).filter((r) => r.count > 0);
}
export const partOfQ = (parts: PaperPart[], qNo: number) => parts.find((r) => qNo >= r.from && qNo <= r.to);

export const questionsForPaper = (p: Paper) =>
  allQuestions.filter((q) => q.examSlug === p.examSlug && q.paperSlug === p.slug).sort((a, b) => a.qNo - b.qNo);
export const questionsForExam = (exam: string) => allQuestions.filter((q) => q.examSlug === exam);
export const getQuestion = (slug: string) => allQuestions.find((q) => q.slug === slug);
export const paperOf = (q: Question) => getPaper(q.examSlug, q.paperSlug)!;
export const examOf = (q: Question) => getExam(q.examSlug)!;

export const paperUrl = (p: Paper) => `/pyq/${p.examSlug}/${p.slug}/`;
export const examUrl = (e: Exam | string) => `/pyq/${typeof e === 'string' ? e : e.slug}/`;
export const questionUrl = (q: Question) => `/question/${q.slug}/`;
export const subjectUrl = (subject: string) => `/mcq/${slugify(subject)}/`;

/* ---------- subject → chapter → topic → subtopic ---------- */
/** Canonical taxonomy chapter of a question (falls back to its own chapter label). */
export function chapterInfo(q: Pick<Question, 'subject' | 'chapter' | 'topic'>): { subjectSlug: string; name: string; slug: string; chapter?: Chapter } {
  const subjectSlug = slugify(q.subject);
  const c = chapterOf(subjectSlug, q.chapter, q.topic);
  return { subjectSlug, name: c?.name ?? q.chapter, slug: c ? chapterSlug(c) : slugify(q.chapter), chapter: c };
}
export const chapterUrl = (subjectSlug: string, chapter: string) => `/mcq/${subjectSlug}/${chapter}/`;
export const chapterUrlOf = (q: Pick<Question, 'subject' | 'chapter' | 'topic'>) => { const c = chapterInfo(q); return chapterUrl(c.subjectSlug, c.slug); };
/** A topic gets its own indexable page once it has this many questions; smaller topics live as a section of the chapter page. */
export const MIN_TOPIC_PAGE = 3;
let topicCount: Map<string, number> | undefined;
const topicKey = (q: Pick<Question, 'subject' | 'chapter' | 'topic'>) => { const c = chapterInfo(q); return `${c.subjectSlug}/${c.slug}/${slugify(q.topic)}`; };
export function hasTopicPage(q: Pick<Question, 'subject' | 'chapter' | 'topic'>) {
  if (!topicCount) { topicCount = new Map(); for (const x of allQuestions) topicCount.set(topicKey(x), (topicCount.get(topicKey(x)) ?? 0) + 1); }
  return (topicCount.get(topicKey(q)) ?? 0) >= MIN_TOPIC_PAGE;
}
export const topicUrl = (q: Pick<Question, 'subject' | 'chapter' | 'topic'>) =>
  hasTopicPage(q) ? `${chapterUrlOf(q)}${slugify(q.topic)}/` : `${chapterUrlOf(q)}#${slugify(q.topic)}`;
export const subtopicAnchor = (q: Pick<Question, 'topic' | 'subtopic'>) => `${slugify(q.topic)}--${slugify(q.subtopic ?? 'general')}`;
export const questionsForChapter = (subjectSlug: string, chapter: string) =>
  allQuestions.filter((q) => { const c = chapterInfo(q); return c.subjectSlug === subjectSlug && c.slug === chapter; });
/** "GPSC AE Electrical · DEE Master paper · 2026" — where a question was asked. */
export const askedIn = (q: Question) => { const p = paperOf(q); return `${examOf(q).short} · ${p.shortTitle}`; };

/** Text in the requested language, falling back to the question's original language. */
export const textOf = (q: Question, lang?: Lang): QuestionText =>
  (lang && q.text[lang]) || q.text[q.primaryLang] || (Object.values(q.text)[0] as QuestionText);
/** Display order everywhere: English, Hindi, Gujarati, then the rest (registry order). */
export const orderLangs = (ls: readonly Lang[]) => [...ls].sort((a, b) => LANGS.findIndex((x) => x.code === a) - LANGS.findIndex((x) => x.code === b));
export const langsOf = (q: Question) => orderLangs(Object.keys(q.text) as Lang[]);

/** English text when available (used for titles/meta so Google gets one consistent language per URL). */
export const seoText = (q: Question) => q.text.en ?? textOf(q);
/** Plain one-line stem for titles, lists and meta. */
export const stemText = (q: Question, lang?: Lang) => plain((lang ? textOf(q, lang) : seoText(q)).stem);

export const playable = (p: Paper) => p.status !== 'import-pending' && questionsForPaper(p).length > 0;

export function paperLabel(p: Paper) {
  const parts = [p.year.toString()];
  if (p.heldOn) parts[0] = formatDate(p.heldOn);
  if (p.stage) parts.push(p.stage);
  if (p.shift) parts.push(p.shift);
  return parts.join(' · ');
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function truncate(s: string, n: number) {
  const clean = s.replace(/\s+/g, ' ').trim();
  if (clean.length <= n) return clean;
  const cut = clean.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ') > n * 0.6 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:\-–]$/, '') + '…';
}

export interface TopicGroup {
  subject: string;
  subjectSlug: string;
  topic: string;
  topicSlug: string;
  chapter: string; // canonical chapter name
  chapterSlug: string;
  questions: Question[];
}

export function topicGroups(qs: Question[] = allQuestions): TopicGroup[] {
  const map = new Map<string, TopicGroup>();
  for (const q of qs) {
    const c = chapterInfo(q);
    const key = `${c.subjectSlug}/${c.slug}/${slugify(q.topic)}`;
    if (!map.has(key))
      map.set(key, { subject: q.subject, subjectSlug: c.subjectSlug, topic: q.topic, topicSlug: slugify(q.topic), chapter: c.name, chapterSlug: c.slug, questions: [] });
    map.get(key)!.questions.push(q);
  }
  return [...map.values()].sort((a, b) => b.questions.length - a.questions.length || a.topic.localeCompare(b.topic));
}
export const topicPageGroups = () => topicGroups().filter((g) => g.questions.length >= MIN_TOPIC_PAGE);
export const topicGroupUrl = (g: TopicGroup) => g.questions.length >= MIN_TOPIC_PAGE ? `/mcq/${g.subjectSlug}/${g.chapterSlug}/${g.topicSlug}/` : `/mcq/${g.subjectSlug}/${g.chapterSlug}/#${g.topicSlug}`;

/** Questions of one topic split by subtopic (for anchors and section headings). */
export function subtopicGroups(qs: Question[]) {
  const map = new Map<string, { name: string; anchor: string; questions: Question[] }>();
  for (const q of qs) {
    const name = q.subtopic ?? 'General';
    if (!map.has(name)) map.set(name, { name, anchor: subtopicAnchor(q), questions: [] });
    map.get(name)!.questions.push(q);
  }
  return [...map.values()].sort((a, b) => b.questions.length - a.questions.length || a.name.localeCompare(b.name));
}

export function subjects() {
  const map = new Map<string, { subject: string; slug: string; topics: TopicGroup[]; count: number }>();
  for (const g of topicGroups()) {
    if (!map.has(g.subjectSlug)) map.set(g.subjectSlug, { subject: g.subject, slug: g.subjectSlug, topics: [], count: 0 });
    const s = map.get(g.subjectSlug)!;
    s.topics.push(g);
    s.count += g.questions.length;
  }
  return [...map.values()];
}

/** Chapter weightage for an exam, computed live from the question bank. */
export function chapterWeightage(examSlug: string) {
  const qs = questionsForExam(examSlug);
  const counts = new Map<string, number>();
  for (const q of qs) { const c = chapterInfo(q).name; counts.set(c, (counts.get(c) ?? 0) + 1); }
  return [...counts.entries()]
    .map(([chapter, n]) => ({ chapter, n, share: n / qs.length }))
    .sort((a, b) => b.n - a.n);
}

export function difficultySplit(qs: Question[]) {
  const out = { Easy: 0, Moderate: 0, Hard: 0 };
  qs.forEach((q) => out[q.difficulty]++);
  return out;
}

export function relatedQuestions(q: Question, n = 6) {
  const sameSub = q.subtopic ? allQuestions.filter((x) => x.slug !== q.slug && x.topic === q.topic && x.subtopic === q.subtopic) : [];
  const sameTopic = allQuestions.filter((x) => x.slug !== q.slug && x.topic === q.topic && !sameSub.includes(x));
  const sameChapter = allQuestions.filter((x) => x.slug !== q.slug && x.chapter === q.chapter && x.topic !== q.topic);
  const samePaper = allQuestions.filter((x) => x.slug !== q.slug && x.paperSlug === q.paperSlug && x.chapter !== q.chapter);
  return [...sameSub, ...sameTopic, ...sameChapter, ...samePaper].slice(0, n);
}

export function neighbours(q: Question) {
  const list = questionsForPaper(paperOf(q));
  const i = list.findIndex((x) => x.slug === q.slug);
  return { prev: list[i - 1], next: list[i + 1], index: i, total: list.length };
}

export const totalStats = () => ({
  questions: allQuestions.length,
  papers: papers.filter(playable).length,
  papersInDb: papers.length,
  exams: exams.length,
  topics: topicGroups().length,
});

/* ---------- per-language question URLs (/gu/question/…, /hi/question/…) ---------- */
export const questionUrlIn = (q: Question, lang?: Lang) => (!lang || lang === 'en' ? questionUrl(q) : `/${lang}${questionUrl(q)}`);
/** Languages that get their own indexable page: every live language the question is fully translated into. */
export const pageLangs = (q: Question): Lang[] => (Object.keys(q.text) as Lang[]).filter((l) => LIVE_LANGS.includes(l));
/** The language of the default /question/ page: English when available, else the paper's own language. */
export const defaultLang = (q: Question): Lang => (q.text.en ? 'en' : q.primaryLang);
export const hreflangs = (q: Question) => {
  const out: Record<string, string> = {};
  for (const l of pageLangs(q)) out[LANG_INFO[l].locale] = l === defaultLang(q) ? questionUrl(q) : questionUrlIn(q, l);
  out['x-default'] = questionUrl(q);
  return out;
};
