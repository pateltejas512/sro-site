// Imports the questions that are live on sarkariresultout.com (WP plugin "sro-question-bank-pro")
// into the Next.js question bank, with the corrected taxonomy from scripts/live-map.mjs.
//
//   node scripts/import-live.mjs [data/live/raw.json]
//
// raw.json is the export made by the in-browser crawler (it walks /sro-pyq-sitemap-questions-1.xml and
// reads each question page). Outputs:
//   data/live/questions.json   – Question[] used by lib/data.ts
//   data/live/redirects.csv    – old WP URL → new URL (301 map for .htaccess / Rank Math)
//   data/live/corrections.csv  – old WP labels → corrected subject/chapter/topic/subtopic (fix the WP terms too)
//   data/live/report.json      – counts and anything that needs a human look
import fs from 'node:fs';
import crypto from 'node:crypto';
import { EE, CH, EE_TOPICS, NON_EE_ORDERED, GU_SUB, examPaper, fixGujarati } from './live-map.mjs';

const src = process.argv[2] || 'data/live/raw.json';
const raw = JSON.parse(fs.readFileSync(src, 'utf8')).questions;

const slugOf = (u) => u.replace(/\/$/, '').split('/').pop();
const isLatin = (s) => !/[઀-૿ऀ-ॿ]/.test(s);
const clean = (s, lang) => (lang === 'gu' ? fixGujarati(s ?? '') : s ?? '').replace(/ /g, ' ').trim();

const STEM_FIX = {
  'SRO-L0401F9AF50': 'જો √(x + 12) + √(x − 12) = 6 હોય, અને x એ ધન પૂર્ણાંક હોય, તો x નું મૂલ્ય શોધો.',
  'SRO-LF48C7788F9': 'જો એક શંકુનું કુલ પૃષ્ઠફળ 616 sq ઇંચ હોય અને તેની ત્રિજ્યા 7 ઇંચ હોય, તો તેનું વક્ર પૃષ્ઠફળ (curved surface area) (sq ઇંચમાં) કેટલું હશે? (π = 22/7 લો)',
};

function stemFormat(s) {
  return s
    // The WP editor turned decimals like "1.11" / "1.2 A" into bold list markers ("is**1.** 11").
    .replace(/\b(is|to)\*\*(\d)\.\*\* (\d)\. (?=[A-Z])/g, '$1 $2.**$3.** ') // "is**2.** 2. The" = "is 2. **2.** The"
    .replace(/\b(is|to|be|was|approximately|about|nearly|for|of|at)\*\*(\d)\.\*\* ?(\d+)/g, '$1 $2.$3')
    .replace(/(multiplier is \d+)\.(\d)\. (?=[A-Z])/g, '$1.\n**$2.** ') // "…multiplier is 5.3. An earth fault…" = "is 5. **3.** An"
    .replace(/\s*(\*\*\d+\.\*\*)/g, '\n$1') // **1.** statements on their own line
    .replace(/([.?:;])\s*((?:I|II|III|IV|V)\.\s)/g, '$1\n$2') // I. II. III. statements
    .replace(/([.?:;])\s*(Statement\s*\d\s*:)/gi, '$1\n$2')
    .replace(/([.?:;])\s*(Assertion|Reason)\s*(\(?[AR]\)?\s*:)/g, '$1\n$2 $3')
    .replace(/([A-Za-z0-9)][.?])(Which|What|Choose|Select|Identify|Find|How|With)\b/g, '$1\n$2') // "…the cause.Which of the above"
    .replace(/^\n+/, '')
    .replace(/\n{2,}/g, '\n');
}

function sections(md) {
  const parts = (md ?? '').split(/^### /m);
  const pre = parts.shift().trim();
  const list = parts.map((part) => {
    const nl = part.indexOf('\n');
    return { h: (nl < 0 ? part : part.slice(0, nl)).trim(), body: (nl < 0 ? '' : part.slice(nl + 1)).trim() };
  }).filter((x) => x.h);
  return { pre, list };
}
const DROP = /^(Correct Answer|સાચો જવાબ|Quick Concept Explanation|Related Revision Path)/i;
const LEAK = /[^.\n]*(For production content|official answer should be retained)[^.\n]*\.?/g;
const has = (list, re) => list.some((s) => re.test(s.h));

function solution(r, lang) {
  const d = sections(clean(r.detailed, lang));
  const x = sections(clean(r.extra, lang));
  let list = d.list.filter((s) => !DROP.test(s.h));
  let tip;
  for (const s of x.list) {
    if (/^(Exam Tip|પરીક્ષા ટિપ)/i.test(s.h)) { tip = s.body; continue; }
    if (/other options|બીજા વિકલ્પો/i.test(s.h) && has(list, /other options|બીજા વિકલ્પો/i)) continue;
    if (/common mistake|સામાન્ય ભૂલ/i.test(s.h) && has(list, /common mistake|સામાન્ય ભૂલ/i)) continue;
    if (/trick|ટ્રિક/i.test(s.h) && has(list, /trick|shortcut|ટ્રિક/i)) continue;
    list.push(s);
  }
  if (tip) list = list.filter((s) => !(/^(Exam Tip|પરીક્ષા ટિપ)$/i.test(s.h) && s.body === tip));
  const md = [d.pre, ...list.map((s) => `### ${s.h}\n${s.body}`)].filter(Boolean).join('\n\n').replace(LEAK, '').replace(/\n{3,}/g, '\n\n').trim();
  return { detailed: md, tip };
}

function subtopicLabel(r, lang) {
  const n = clean(r.subtopic?.name, lang);
  if (!n) return undefined;
  if (isLatin(n)) return n;
  const m = n.match(/\(([^()]*[A-Za-z][^()]*)\)\s*$/);
  if (m && isLatin(m[1])) return m[1].trim();
  return GU_SUB[n] ?? GU_SUB[n.replace(/\s*\([^)]*\)\s*$/, '')] ?? n;
}

const DIFF = { Easy: 'Easy', Medium: 'Moderate', Moderate: 'Moderate', Hard: 'Hard' };
const FIG = /\b(?:fig\.|figure|circuit shown|shown in fig|given fig|shown below)/i;

const out = [];
const redirects = [['old_url', 'new_url']];
const corrections = [['old_url', 'lang', 'old_subject', 'old_subsubject', 'old_topic', 'old_subtopic', 'new_subject', 'new_chapter', 'new_topic', 'new_subtopic', 'exam', 'paper']];
const report = { total: raw.length, imported: 0, skipped: [], unmapped: [], untranslated: [], figureMissing: [], perPaper: {}, perChapter: {} };
const qNo = {};
const slugify = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EXAM_SHORT = { 'gpssb-aae-electrical': 'gpssb-aae-2026', 'gpsc-ae-electrical-class-2': 'gpsc-ae', 'gssb-supervisor-instructor-electrical': 'gsssb-si-2026', 'gpsc-dee-electrical': 'gpsc-dee', 'guvnl-vidyut-sahayak-je': 'vidyut-sahayak-2024' };
const used = new Set(raw.map((r) => slugOf(r.url)));
let nonEE = 0;

for (const r of raw) {
  const liveSlug = slugOf(r.url);
  const lang = r.lang === 'gu' ? 'gu' : 'en';
  const ep = examPaper(r);
  const isEE = r.subject?.slug === 'electrical-engineering';
  const ne = isEE ? null : NON_EE_ORDERED[nonEE++];
  if (!ep) { report.skipped.push({ slug: liveSlug, why: 'already in the local RRB JE paper file' }); continue; }
  const [examSlug, paperSlug] = ep;

  let subject, chapter, topic, subtopic;
  if (ne) [subject, chapter, topic, subtopic] = ne;
  else {
    const t = clean(r.topic?.name, lang);
    const m = EE_TOPICS[`${r.subsubject?.slug}|${t}`] ?? EE_TOPICS[t];
    if (!m) { report.unmapped.push({ slug: liveSlug, subsubject: r.subsubject?.slug, topic: t }); continue; }
    subject = EE; chapter = CH[m[0]]; topic = m[1]; subtopic = m[2] ?? subtopicLabel(r, lang);
  }
  if (subtopic && !isLatin(subtopic)) report.untranslated.push({ slug: liveSlug, subtopic });

  // WP auto-slugs like "question-3923" or "…-q102-gujarati-solution" carry no keywords: give them a descriptive slug (old URL 301s to it).
  let slug = liveSlug;
  if (/^bms-electrical(-pyq)?-/.test(liveSlug)) {
    slug = liveSlug.replace(/^bms-electrical(-pyq)?-/, 'gpsc-dee-electrical-2024-');
  } else if (/^question-\d+$/.test(liveSlug) || /-(gujarati|answer)-solution$/.test(liveSlug)) {
    const tail = subtopic && subtopic.toLowerCase().includes(topic.toLowerCase().split(' ')[0]) ? subtopic : `${topic} ${subtopic ?? ''}`;
    const no = liveSlug.match(/-q(\d+)-/)?.[1];
    const base = slugify(`${EXAM_SHORT[examSlug] ?? examSlug} ${no ? 'q' + no : ''} ${tail}`);
    slug = base; let n = 2;
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
  }
  const k = `${examSlug}/${paperSlug}`;
  qNo[k] = (qNo[k] ?? 0) + 1;
  const stem = stemFormat(clean(r.stem, lang));
  const { detailed, tip } = solution(r, lang);
  const yr = Number((r.badges ?? []).find((b) => /^\d{4}$/.test(b)));
  const figureMissing = FIG.test(stem) || /^જો હોય, અને/.test(stem) || slug.includes('polygon') || undefined;
  if (figureMissing) report.figureMissing.push(slug);

  const q = {
    id: 'SRO-L' + crypto.createHash('sha1').update(liveSlug).digest('hex').slice(0, 10).toUpperCase(),
    slug,
    examSlug,
    paperSlug,
    qNo: qNo[k],
    section: subject,
    subject,
    chapter,
    topic,
    ...(subtopic ? { subtopic } : {}),
    concept: clean(r.concept?.name || r.title, lang),
    difficulty: DIFF[r.badges?.[0]] ?? 'Moderate',
    answer: r.answer,
    verifiedBy: 'SRO editorial desk',
    primaryLang: lang,
    ...(yr ? { year: yr } : {}),
    liveUrl: r.url,
    ...(figureMissing ? { figureMissing: true } : {}),
    ...(r.simg?.length ? { solutionImages: r.simg } : {}),
    text: {
      [lang]: {
        stem,
        options: r.options.map((o) => clean(o, lang)),
        quick: clean(r.quick, lang),
        ...(r.formula?.length ? { formula: r.formula.map((f) => clean(f, lang)) } : {}),
        ...(detailed ? { detailed } : {}),
        ...(tip ? { tip } : {}),
      },
    },
  };
  // The WP editor dropped inline math from a few stems; restore it from the paper.
  const fix = STEM_FIX[q.id];
  if (fix) { q.text[lang].stem = fix; delete q.figureMissing; report.figureMissing = report.figureMissing.filter((s) => s !== slug); }
  out.push(q);
  report.perPaper[k] = qNo[k];
  report.perChapter[`${subject} › ${chapter}`] = (report.perChapter[`${subject} › ${chapter}`] ?? 0) + 1;
  redirects.push([r.url, `/question/${slug}/`]);
  corrections.push([r.url, lang, r.subject?.name, r.subsubject?.name, r.topic?.name, r.subtopic?.name ?? '', subject, chapter, topic, subtopic ?? '', examSlug, paperSlug]);
}
// Use the real question number from the paper when every question of that paper carries one in its old slug.
const byPaper = {};
for (const q of out) (byPaper[q.paperSlug] ??= []).push(q);
for (const list of Object.values(byPaper)) {
  const nums = list.map((q) => Number(q.liveUrl.match(/-q(\d+)-/)?.[1] ?? NaN));
  if (nums.every((n) => n > 0) && new Set(nums).size === nums.length) list.forEach((q, i) => { q.qNo = nums[i]; });
}
report.imported = out.length;

const csv = (rows) => '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
fs.writeFileSync('data/live/questions.json', JSON.stringify(out));
fs.writeFileSync('data/live/redirects.csv', csv(redirects));
fs.writeFileSync('data/live/corrections.csv', csv(corrections));
fs.writeFileSync('data/live/report.json', JSON.stringify(report, null, 1));
console.log(`imported ${out.length}/${raw.length}; unmapped ${report.unmapped.length}; untranslated ${report.untranslated.length}; figure ${report.figureMissing.length}`);
if (report.unmapped.length) console.log(report.unmapped.slice(0, 30));
if (report.untranslated.length) console.log(report.untranslated.slice(0, 40));
