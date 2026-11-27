// Mock test cover images (1200×675 WebP): the picture on the mock page, the Google/WhatsApp share image and
// the card thumbnail. One consistent, premium design for every mock, generated from the Studio data.
//
//   node scripts/covers.mjs [export.json]      (needs Playwright + Chromium; skips quietly when not installed)
//
// Writes public/covers/<exam>/<mock>.webp. Existing files are kept unless the mock's facts changed
// (a small JSON next to the images remembers what each cover shows).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] || path.join(ROOT, 'data/studio/export.json');
const OUT = path.join(ROOT, 'public/covers');
let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  try { const { createRequire } = await import('node:module'); ({ chromium } = createRequire(import.meta.url)('playwright')); } // global install (NODE_PATH)
  catch { console.log('covers: Playwright not installed — skipped'); process.exit(0); }
}

const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const exams = Object.fromEntries((data.exams || []).map((e) => [e.slug, e]));
const mocks = (data.papers || []).filter((p) => p.kind === 'mock');
if (!mocks.length) { console.log('covers: no mock tests'); process.exit(0); }

// per exam category: background, accent and the big 3D icon
const THEME = {
  gujarat: { bg: ['#1b1036', '#3a1a6e'], glow: '#8b5cf6', icon: 'govt' },
  electricity: { bg: ['#0b1a3a', '#123a7a'], glow: '#f5b82e', icon: 'bolt' },
  engineering: { bg: ['#06262a', '#0d4b52'], glow: '#2dd4bf', icon: 'crane' },
  railway: { bg: ['#071d33', '#0b4a7a'], glow: '#38bdf8', icon: 'train' },
  default: { bg: ['#1a0f08', '#4a1d0a'], glow: '#f97316', icon: 'stopwatch' },
};
const LANG = { en: 'English', gu: 'ગુજરાતી', hi: 'हिन्दी' };
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'app/fonts', f)).toString('base64')}`;
const icon = (n) => { let f = path.join(ROOT, 'public/i3d', `${n}.webp`); if (!fs.existsSync(f)) f = path.join(ROOT, 'public/i3d/stopwatch.webp'); return `data:image/webp;base64,${fs.readFileSync(f).toString('base64')}`; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function facts(p) {
  const e = exams[p.examSlug] || { short: p.examSlug, name: p.examSlug, category: 'default' };
  const examName = /vidyut/i.test(e.name) ? 'Vidyut Sahayak JE' : /supervisor/i.test(e.name) ? 'Supervisor Instructor' : e.short;
  let head = p.title;
  for (const w of [e.short, examName, 'GSSSB', 'GSSB', 'Vidyut Sahayak JE', 'CCE']) head = head.replace(new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'i'), '');
  const sub = (head.match(/\(([^)]+)\)/) || [])[1] || '';
  head = head.replace(/\([^)]*\)/g, '').replace(/\bfree\b/i, '').replace(/\s+/g, ' ').trim();
  const n = p.liveQuestions || p.totalQuestions || 0;
  const neg = p.negative ? `−${Math.abs(p.negative - 1 / 3) < 1e-6 ? '1/3' : p.negative}` : 'No';
  const langs = (p.languages || []).map((l) => LANG[l] || l.toUpperCase()).join(' + ');
  return { e, examName, head, sub: sub || (p.sections?.length > 2 ? 'Full-length · latest exam pattern' : `${p.sections?.[0]?.name || 'Topic'} · sectional test`), n, min: p.minutes || n, neg, langs, premium: !!p.premium, price: p.price || 0 };
}

function html(p) {
  const f = facts(p);
  const t = THEME[f.e.category] || THEME.default;
  const big = f.head.length > 26 ? 58 : f.head.length > 20 ? 66 : f.head.length > 14 ? 80 : 100;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:J;src:url(${font('jakarta-latin.woff2')});font-weight:200 900}
@font-face{font-family:I;src:url(${font('inter-latin.woff2')});font-weight:100 900}
@font-face{font-family:G;src:url(${font('noto-gujarati.woff2')});font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:675px;overflow:hidden;font-family:I,G,sans-serif;color:#fff;background:linear-gradient(135deg,${t.bg[0]} 0%,${t.bg[1]} 100%);position:relative}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at 75% 40%,#000 0%,transparent 70%)}
.glow{position:absolute;width:640px;height:640px;right:-120px;top:-60px;border-radius:50%;background:radial-gradient(circle,${t.glow}88 0%,${t.glow}22 40%,transparent 70%)}
.wrap{position:absolute;inset:56px 64px 0 64px}
.brand{display:flex;align-items:center;gap:12px;font:700 20px J;letter-spacing:.06em}
.logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#f97316,#c2410c);display:grid;place-items:center;font:800 16px J;box-shadow:0 8px 24px #f9731666}
.brand small{display:block;font:600 13px I;opacity:.7;letter-spacing:.12em}
.badge{position:absolute;right:0;top:0;padding:12px 22px;border-radius:999px;font:800 22px J;letter-spacing:.08em}
.free{background:#16a34a;box-shadow:0 10px 30px #16a34a66}
.jeet{background:linear-gradient(135deg,#fde68a,#f59e0b);color:#3b2400;box-shadow:0 10px 30px #f59e0b66}
.exam{margin-top:58px;font:800 26px J;letter-spacing:.14em;text-transform:uppercase;color:${t.glow}}
h1{text-wrap:balance;margin-top:6px;font:800 ${big}px/1.04 J;letter-spacing:-.02em;max-width:700px;text-shadow:0 6px 30px rgba(0,0,0,.35)}
.sub{margin-top:14px;font:500 26px I;opacity:.85;max-width:700px}
.chips{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap;max-width:700px}
.chip{padding:12px 18px;border-radius:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);font:700 22px I;backdrop-filter:blur(6px)}
.chip b{font-family:J;font-size:26px;margin-right:6px}
.foot{position:absolute;left:0;right:0;bottom:0;height:84px;display:flex;align-items:center;gap:28px;padding:0 64px;background:rgba(0,0,0,.28);border-top:1px solid rgba(255,255,255,.12);font:600 21px I}
.foot span::before{content:'✓';color:${t.glow};font-weight:800;margin-right:8px}
.foot .r{margin-left:auto;opacity:.75;font-weight:700}.foot .r::before{content:none}
.art{position:absolute;right:70px;top:150px;width:330px;height:330px;filter:drop-shadow(0 30px 50px rgba(0,0,0,.45))}
.art2{position:absolute;right:330px;top:390px;width:110px;height:110px;filter:drop-shadow(0 16px 24px rgba(0,0,0,.4))}
</style></head><body><div class="grid"></div><div class="glow"></div>
<img class="art" src="${icon(f.e.i3d || t.icon)}"><img class="art2" src="${icon(f.premium ? 'crown' : 'stopwatch')}">
<div class="wrap">
<div class="brand"><div class="logo">SRO</div><div>SARKARIRESULTOUT<small>MOCK TEST · ${new Date().getFullYear()}</small></div></div>
<div class="badge ${f.premium ? 'jeet' : 'free'}">${f.premium ? 'SRO JEET' : 'FREE TEST'}</div>
<div class="exam">${esc(f.examName)}</div>
<h1>${esc(f.head)}</h1>
<div class="sub">${esc(f.sub)}</div>
<div class="chips"><div class="chip"><b>${f.n}</b>Questions</div><div class="chip"><b>${f.min}</b>Minutes</div><div class="chip"><b>${esc(f.neg)}</b>Negative</div><div class="chip">${esc(f.langs)}</div></div>
</div>
<div class="foot"><span>Real exam interface</span><span>All-India rank</span><span>Full solutions</span><div class="r">sarkariresultout.com</div></div>
</body></html>`;
}

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { const { createRequire } = await import('node:module'); return createRequire(import.meta.url)('sharp'); }
}

const memoFile = path.join(ROOT, 'data/covers.json'); // what each cover shows (kept out of public/)
const memo = fs.existsSync(memoFile) ? JSON.parse(fs.readFileSync(memoFile, 'utf8')) : {};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
let made = 0;
for (const p of mocks) {
  const key = `${p.examSlug}/${p.slug}`;
  const sig = JSON.stringify(facts(p));
  const file = path.join(OUT, p.examSlug, `${p.slug}.webp`);
  if (memo[key] === sig && fs.existsSync(file)) continue;
  await page.setContent(html(p), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sharp = await loadSharp();
  await sharp(png).webp({ quality: 86 }).toFile(file);
  memo[key] = sig;
  made++;
}
await browser.close();
fs.writeFileSync(memoFile, JSON.stringify(memo, null, 1));
console.log(`covers: ${made} made, ${mocks.length - made} unchanged`);
