// Builds deploy/sro-redirects.htaccess: 301s from the old WordPress PYQ plugin URLs (/pyq/question/…, /pyq/topic/…)
// to the new platform. Questions come from data/live/redirects.csv; hubs from data/live/old-entities.txt.
// Usage: node scripts/make-redirects.mjs out   (needs a production build in out/ to verify every target exists)
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve(process.argv[2] || 'out');
const exists = (u) => fs.existsSync(path.join(out, u, 'index.html'));
const EE = '/mcq/electrical-engineering/';
const mcq = fs.readdirSync(path.join(out, 'mcq'), { recursive: true }).filter((f) => f.endsWith('index.html')).map((f) => '/mcq/' + path.dirname(f).split(path.sep).join('/') + '/').filter((u) => u !== '/mcq/./');
const chapters = mcq.filter((u) => u.split('/').length === 5 && u.startsWith(EE));
const topics = mcq.filter((u) => u.split('/').length === 6 && u.startsWith(EE));
const leaf = (u) => u.split('/').filter(Boolean).pop();

// Hand-checked mappings (old slug → new page) where words differ.
const MANUAL = {
  'subject/quantitative-aptitude': '/mcq/quantitative-aptitude/', 'subject/general-awareness': '/mcq/general-knowledge/', 'subsubject/general-awareness': '/mcq/general-knowledge/',
  'subject/electrical-engineering': EE, 'subsubject/electrical-engineering': EE, 'subject/english-language': '/mcq/english/',
  'authority/gujarat-public-service-commission-gpsc': '/exams/gpsc/', 'authority/gujarat-panchayat-service-selection-board-gpssb': '/exams/gpssb/',
  'authority/dakshin-gujarat-vij-company-limited-dgvcl': '/exams/guvnl/', 'authority/railway-recruitment-boards-rrbs': '/exams/rrb/', 'authority/not-stated-in-supplied-question-paper': '/exams/',
  'exam/bms': '/pyq/gpsc-dee-electrical/', 'exam/deputy-executive-engineer-electrical-class-2-sports-authority-of-gujarat-assistant-engineer-electrical-class-2-sports-authority-of-gujarat-assistant-engineer-electrical-c': '/pyq/gpsc-dee-electrical/', 'exam/additional-assistant-engineer-electrical': '/pyq/gpssb-aae-electrical/', 'exam/vidyut-sahayak-junior-engineer-electrical': '/pyq/guvnl-vidyut-sahayak-je/',
  'exam/assistant-engineer-electrical-class-2-road-and-building-department': '/pyq/gpsc-ae-electrical-class-2/', 'exam/railway-recruitment-boards-rrbs-rrb-junior-engineer-je': '/pyq/rrb-je/',
  'paper/master-question-paper-btp-btq-btr-bts-btt': '/pyq/gpsc-dee-electrical/2026-dee-master-paper/', 'paper/non-technical': '/pyq/gpssb-aae-electrical/2026-cbrt-non-technical/',
  'paper/technical-electrical-engineering': '/pyq/gpssb-aae-electrical/2026-cbrt-technical/', 'paper/electrical-engineering': '/pyq/gpsc-dee-electrical/2024-dee-electrical/',
  'paper/second-tier-examination-electrical-engineering': '/pyq/guvnl-vidyut-sahayak-je/2024-second-tier-electrical/',
  'paper/railway-recruitment-boards-rrbs-rrb-junior-engineer-je-cbt-2-electrical-and-allied-engineering': '/pyq/rrb-je/2026-cbt-2-electrical-shift-1/',
  'subsubject/electric-circuits': 'network-theory', 'subsubject/circuit-theory': 'network-theory', 'subsubject/electromagnetic-theory': 'electromagnetic-fields',
  'subsubject/electrical-electronics-measuring-instruments': 'measurements-and-instruments', 'subsubject/measurement-and-instrumentation': 'measurements-and-instruments',
  'subsubject/power-system-protection': 'switchgear-and-protection', 'topic/protection': 'switchgear-and-protection',
  'subsubject/electrical-building-services': 'utilisation-and-building-services', 'subsubject/building-electrical-services': 'utilisation-and-building-services', 'subsubject/building-services': 'utilisation-and-building-services',
  'subsubject/illumination-engineering': 'utilisation-and-building-services', 'subsubject/fire-protection': 'utilisation-and-building-services', 'subsubject/utilization-of-electrical-energy': 'utilisation-and-building-services',
  'topic/vertical-transportation': 'utilisation-and-building-services', 'topic/gujarat-lift-regulations': 'utilisation-and-building-services', 'topic/lighting-design': 'utilisation-and-building-services',
  'subsubject/electrical-safety': 'installation-earthing-and-safety', 'subsubject/electrical-installation': 'installation-earthing-and-safety', 'subsubject/electrical-installation-safety': 'installation-earthing-and-safety', 'topic/electrical-installation-safety-earthing': 'installation-earthing-and-safety',
  'subsubject/energy-management': 'energy-management-and-electricity-laws', 'subsubject/renewable-energy-policy': 'energy-management-and-electricity-laws', 'subsubject/electricity-law-and-regulation': 'energy-management-and-electricity-laws',
  'subsubject/energy-and-environment': 'energy-management-and-electricity-laws', 'subsubject/electrical-laws-standards-and-energy-policy': 'energy-management-and-electricity-laws', 'subsubject/electrical-laws-standards': 'energy-management-and-electricity-laws',
  'topic/electricity-legislation': 'energy-management-and-electricity-laws', 'topic/indian-standards': 'installation-earthing-and-safety', 'topic/energy-efficiency': 'energy-management-and-electricity-laws', 'subsubject/renewable-energy': 'power-systems',
  'subsubject/industrial-electrical-systems': 'industrial-automation-and-drives', 'subsubject/industrial-automation': 'industrial-automation-and-drives',
  'subsubject/microprocessors-and-interfacing': 'microprocessors-and-microcontrollers', 'subsubject/microprocessors-microcontrollers': 'microprocessors-and-microcontrollers', 'topic/microcontrollers': 'microprocessors-and-microcontrollers',
  'subsubject/power-plant-engineering': 'power-systems', 'topic/power-plants': 'power-systems', 'topic/steam-power-plants': 'power-systems', 'subtopic/corona': 'power-systems', 'topic/high-voltage-engineering': 'power-systems', 'topic/power-systems-per-unit-system': 'power-systems',
  'subsubject/transformers': 'electrical-machines', 'subsubject/electrical-materials': 'basic-electrical-engineering', 'topic/magnetic-materials': 'basic-electrical-engineering', 'topic/electrical-materials-magnetic-materials': 'basic-electrical-engineering', 'topic/magnetic-circuits': 'basic-electrical-engineering',
  'topic/electromechanical-energy-conversion': 'electrical-machines', 'topic/dc-motors': 'electrical-machines', 'topic/synchronous-motors': 'electrical-machines', 'topic/synchronous-generators': 'electrical-machines', 'subtopic/speed-control': 'electrical-machines', 'topic/distribution-transformers': 'electrical-machines',
  'topic/boolean-algebra': 'digital-electronics', 'topic/combinational-logic': 'digital-electronics', 'topic/sequential-logic': 'digital-electronics', 'topic/programmable-logic': 'digital-electronics', 'subtopic/shift-registers': 'digital-electronics',
  'topic/controlled-rectifiers': 'power-electronics', 'topic/dc-dc-converters': 'power-electronics', 'subtopic/boost-converter': 'power-electronics',
  'topic/signal-classification': 'signals-and-systems', 'topic/lti-systems': 'signals-and-systems', 'topic/laplace-transform': 'signals-and-systems', 'topic/sampling': 'signals-and-systems', 'topic/discrete-time-signals': 'signals-and-systems',
  'topic/root-locus': 'control-systems', 'topic/controllers': 'control-systems', 'subtopic/stability-margins': 'control-systems', 'subtopic/asymptotes': 'control-systems', 'topic/second-order-systems': 'control-systems',
  'subtopic/z-parameters': 'network-theory', 'topic/three-phase-ac-circuits': 'network-theory', 'subtopic/hvdc-transmission-line-commutated-converters': 'power-systems',
};
const resolve = (kind, slug) => {
  const m = MANUAL[`${kind}/${slug}`];
  if (m) return m.startsWith('/') ? m : chapters.find((c) => leaf(c) === m);
  const t = topics.find((u) => leaf(u) === slug); if (t) return t;
  const c = chapters.find((u) => leaf(u) === slug); if (c) return c;
  return null;
};
const lines = ['# ---- SRO platform: 301s from the old /pyq/ WordPress plugin URLs (generated by scripts/make-redirects.mjs) ----', '<IfModule mod_rewrite.c>', 'RewriteEngine On', ''];
let n = 0; const bad = [];
for (const u of fs.readFileSync('data/live/old-entities.txt', 'utf8').split('\n').filter(Boolean)) {
  const [, , kind, slug] = u.split('/');
  const to = resolve(kind, slug);
  if (!to || !exists(to)) { bad.push(u); continue; }
  lines.push(`RewriteRule ^pyq/${kind}/${slug}/?$ ${to} [R=301,L]`); n++;
}
lines.push('', '# Questions (old → new slug)');
const rows = fs.readFileSync('data/live/redirects.csv', 'utf8').replace(/^﻿/, '').trim().split('\n').slice(1).map((l) => l.split('","').map((x) => x.replace(/"/g, '').trim()));
for (const [o, to] of rows) { if (!exists(to)) { bad.push(o); continue; } lines.push(`RewriteRule ^${o.slice(1).replace(/\/$/, '')}/?$ ${to} [R=301,L]`); n++; }
lines.push('', '# Anything else under the old plugin: same slug if that page exists, otherwise the PYQ hub',
  'RewriteCond %{DOCUMENT_ROOT}/question/$1/index.html -f', 'RewriteRule ^pyq/(?:gu/)?question/([^/]+)/?$ /question/$1/ [R=301,L]',
  'RewriteRule ^pyq/(?:gu/)?(?:question|questions|topic|subtopic|subsubject|subject|exam|paper|authority)(?:/.*)?$ /pyq/ [R=301,L]',
  'RewriteRule ^pyq/gu/?$ /pyq/ [R=301,L]', '</IfModule>', '');
fs.mkdirSync('deploy', { recursive: true });
fs.writeFileSync('deploy/sro-redirects.htaccess', lines.join('\n'));
console.log('rules', n, 'unresolved', bad.length, bad.slice(0, 20));
