// Preview only: the hosted preview has a file budget, so keep every hub/chapter/topic page but only a
// sample of question pages (the local papers + the first question of every chapter). Production never runs this.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || 'out-preview');
const keep = new Set();
const qdir = path.join(root, 'question');
for (const d of fs.readdirSync(qdir)) if (/^(rrb-je-|gsssb-cce-)/.test(d)) keep.add(d);
const mcq = path.join(root, 'mcq');
for (const s of fs.readdirSync(mcq, { withFileTypes: true }).filter((e) => e.isDirectory())) {
  for (const c of fs.readdirSync(path.join(mcq, s.name), { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const f = path.join(mcq, s.name, c.name, 'index.html');
    if (!fs.existsSync(f)) continue;
    const m = [...fs.readFileSync(f, 'utf8').matchAll(/href="\/question\/([^/"]+)\/"/g)].map((x) => x[1]);
    for (const slug of [...new Set(m)].slice(0, 1)) keep.add(slug);
  }
}
let removed = 0;
for (const d of fs.readdirSync(qdir)) if (!keep.has(d)) { fs.rmSync(path.join(qdir, d), { recursive: true }); removed++; }
for (const l of ['gu', 'hi']) {
  const g = path.join(root, l, 'question');
  // a handful of translated question pages is enough to demo /hi/ and /gu/ URLs
  if (fs.existsSync(g)) { let k = 0; for (const d of fs.readdirSync(g).sort()) if (!keep.has(d) || ++k > 9) fs.rmSync(path.join(g, d), { recursive: true }); }
}
// one combined language file instead of one per question (components/LazyPane reads it in preview builds)
fs.rmSync(path.join(root, 'i18n', 'q'), { recursive: true, force: true });
console.log('kept', keep.size, 'removed', removed);
