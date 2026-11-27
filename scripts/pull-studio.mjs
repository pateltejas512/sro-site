// Pulls everything published in SRO Studio into the site build.
//
//   node scripts/pull-studio.mjs [url-or-file]
//   default: https://sarkariresultout.com/wp-json/sro-studio/v1/export
//
// Writes data/studio/export.json (read by lib/data.ts and data/boards.ts) and public/studio-build.json
// (Studio reads it back to show "Website is up to date").
import fs from 'node:fs';

const src = process.argv[2] || 'https://sarkariresultout.com/wp-json/sro-studio/v1/export';
let data;
try {
  if (/^https?:/.test(src)) {
    const r = await fetch(src, { headers: { 'Cache-Control': 'no-cache' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = JSON.parse(await r.text());
  } else data = JSON.parse(fs.readFileSync(src, 'utf8'));
} catch (e) {
  // Studio unreachable: build with the committed export only when it is exactly what the website already shows
  // (same version), so a WordPress hiccup can never wipe published content from the site.
  const site = new URL('/', /^https?:/.test(src) ? src : 'https://sarkariresultout.com/').href;
  const live = await fetch(site + 'studio-build.json?t=' + Date.now()).then((r) => r.json()).catch(() => null);
  const committed = JSON.parse(fs.readFileSync('data/studio/export.json', 'utf8'));
  if (!live || committed.version !== live.version) throw new Error(`Studio export unavailable (${e.message}) and the committed copy is not the live version`);
  console.warn(`Studio export unavailable (${e.message}); using the committed copy (version ${committed.version}, same as the website).`);
  data = committed;
}
if (!Array.isArray(data.exams) || !Array.isArray(data.papers) || !Array.isArray(data.questions)) throw new Error('Not a Studio export');

const problems = [];
const slugs = new Set();
const paperKeys = new Set(data.papers.map((p) => `${p.examSlug}/${p.slug}`));
for (const q of data.questions) {
  if (!q.slug) problems.push(`${q.id}: no slug`);
  if (slugs.has(q.slug)) problems.push(`${q.id}: duplicate slug ${q.slug}`);
  slugs.add(q.slug);
  if (!paperKeys.has(`${q.examSlug}/${q.paperSlug}`)) problems.push(`${q.id}: paper ${q.examSlug}/${q.paperSlug} is not published`);
  if (!['A', 'B', 'C', 'D'].includes(q.answer)) problems.push(`${q.id}: no answer`);
  for (const [l, t] of Object.entries(q.text || {})) if (!t.stem || (t.options || []).length !== 4) problems.push(`${q.id}: ${l} text incomplete`);
}
if (problems.length) {
  console.error('Studio export problems:\n  ' + problems.join('\n  '));
  data.questions = data.questions.filter((q) => !problems.some((p) => p.startsWith(q.id + ':')));
}
// Scanner (OCR) reads θ as a capital "S": "\tan^2 S", "\sec S" → "\tan^2\theta", "\sec\theta" (only right after a trig function).
let thetaFixed = 0;
const TRIG_S = /\\(sin|cos|tan|sec|cosec|csc|cot)(\^\{?\d\}?)?\s*S(?![A-Za-z])/g;
const fixStr = (t) => t.replace(TRIG_S, (_m, f, p = '') => { thetaFixed++; return `\\${f}${p}\\theta`; });
const walk = (v) => (typeof v === 'string' ? fixStr(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v);
data.questions = data.questions.map((q) => ({ ...q, text: walk(q.text) }));
if (thetaFixed) console.log(`Fixed ${thetaFixed} θ written as S`);
data.hidden = data.hidden || { exams: [], papers: [] };
fs.mkdirSync('data/studio', { recursive: true });
fs.writeFileSync('data/studio/export.json', JSON.stringify(data));
fs.writeFileSync('public/studio-build.json', JSON.stringify({ version: data.version, stamp: data.stamp || '', builtAt: new Date().toISOString(), questions: data.questions.length }));
console.log(`Studio v${data.version}: ${data.exams.length} exams, ${data.papers.length} papers, ${data.questions.length} questions${problems.length ? ` (${problems.length} skipped)` : ''}`);
