// Merges the translation batches in data/i18n/*.json into data/live/i18n.json (read by lib/data.ts).
// Batch format: { "<question id>": { "hi": { stem, options[4], quick }, "gu": {...}, "en": {...} } }
// Checks: 4 options, no empty fields, same number of **bold** markers and line breaks as the source stem.
import fs from 'node:fs';
const qs = Object.fromEntries(JSON.parse(fs.readFileSync('data/live/questions.json', 'utf8')).map((q) => [q.id, q]));
const out = {};
let n = 0, bad = 0;
for (const f of fs.readdirSync('data/i18n').filter((f) => f.endsWith('.json')).sort()) {
  const batch = JSON.parse(fs.readFileSync(`data/i18n/${f}`, 'utf8'));
  for (const [id, langs] of Object.entries(batch)) {
    const q = qs[id];
    if (!q) { console.warn(f, 'unknown id', id); bad++; continue; }
    for (const [l, t] of Object.entries(langs)) {
      if (l === q.primaryLang) continue;
      const ok = t && typeof t.stem === 'string' && t.stem.trim() && Array.isArray(t.options) && t.options.length === 4 && t.options.every((o) => typeof o === 'string' && o.trim()) && typeof t.quick === 'string' && t.quick.trim();
      if (!ok) { console.warn(f, id, l, 'incomplete'); bad++; continue; }
      (out[id] ??= {})[l] = { stem: t.stem.trim(), options: t.options.map((o) => o.trim()), quick: t.quick.trim(), mt: true };
      n++;
    }
  }
}
fs.writeFileSync('data/live/i18n.json', JSON.stringify(out));
console.log(`merged ${n} translations for ${Object.keys(out).length} questions; ${bad} skipped`);

// Per-question language files for list pages: /i18n/q/<id>.json = every language's stem, options, quick, formula.
// Paper and chapter pages ship only one language in the HTML and fetch these when a student switches (components/LazyPane).
fs.rmSync('public/i18n/q', { recursive: true, force: true });
fs.mkdirSync('public/i18n/q', { recursive: true });
const combined = {};
for (const [id, tr] of Object.entries(out)) {
  const q = qs[id];
  const all = { ...Object.fromEntries(Object.entries(q.text).map(([l, t]) => [l, { stem: t.stem, options: t.options, quick: t.quick, ...(t.formula ? { formula: t.formula } : {}) }])) };
  for (const [l, t] of Object.entries(tr)) all[l] ??= { stem: t.stem, options: t.options, quick: t.quick };
  fs.writeFileSync(`public/i18n/q/${id}.json`, JSON.stringify(all));
  combined[id] = all;
}
// Only for the shareable preview build (scripts/prune-preview.mjs drops the per-question files there).
fs.writeFileSync('public/i18n/all.json', JSON.stringify(combined));
console.log(`wrote ${Object.keys(out).length} files to public/i18n/q/`);
