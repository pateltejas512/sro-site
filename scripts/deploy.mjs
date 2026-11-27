// Sends the built site (out/) to the server: only files whose content changed, in zip chunks.
// Used by .github/workflows/publish.yml. Needs: SITE (https://sarkariresultout.com/) and SRO_DEPLOY_KEY.
//
//   node scripts/deploy.mjs [outDir]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const OUT = path.resolve(process.argv[2] || 'out');
const SITE = (process.env.SITE || 'https://sarkariresultout.com/').replace(/\/?$/, '/');
const KEY = process.env.SRO_DEPLOY_KEY;
const API = SITE + 'wp-json/sro-studio/v1/deploy/';
if (!KEY) throw new Error('SRO_DEPLOY_KEY is not set (GitHub → Settings → Secrets → Actions).');

const SKIP = new Set(['studio-build.json']); // written by the server at the end
const files = {};
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs);
    else {
      const rel = path.relative(OUT, abs).split(path.sep).join('/');
      if (!SKIP.has(rel)) files[rel] = crypto.createHash('sha1').update(fs.readFileSync(abs)).digest('hex');
    }
  }
})(OUT);

async function call(name, body, form) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(API + name, {
        method: 'POST',
        headers: { 'X-SRO-Deploy-Key': KEY, 'User-Agent': 'SRO-Build', ...(form ? {} : { 'Content-Type': 'application/json' }) },
        body: form || JSON.stringify(body || {}),
      });
      const text = await res.text();
      let json; try { json = JSON.parse(text); } catch { json = { message: text.slice(0, 200) }; }
      if (!res.ok) throw new Error(`${name}: ${res.status} ${json.message || ''}`);
      return json;
    } catch (e) {
      if (attempt >= 4 || /401|403/.test(e.message)) throw e;
      console.log(`  retry ${name} (${e.message})`);
      await new Promise((r) => setTimeout(r, attempt * 5000));
    }
  }
}

const build = JSON.parse(fs.readFileSync(path.join(OUT, 'studio-build.json'), 'utf8'));
try {
  const start = await call('start', { version: build.version, run: process.env.RUN_URL || '' });
  const chunkLimit = Math.max(2, Math.min(24, Math.floor((start.maxBytes || 8 * 2 ** 20) / 2 ** 20) - 2)) * 2 ** 20;
  const all = Object.keys(files);
  console.log(`${all.length} files in build. Comparing with the server…`);
  const need = [];
  for (let i = 0; i < all.length; i += 1500) {
    const part = Object.fromEntries(all.slice(i, i + 1500).map((k) => [k, files[k]]));
    const r = await call('diff', { files: part });
    need.push(...r.need);
    if (r.skipped?.length) throw new Error(`The server refuses ${r.skipped.length} file(s), e.g. ${r.skipped.slice(0, 3).join(', ')}. Nothing was uploaded.`);
  }
  console.log(`${need.length} changed files to upload (chunks up to ${chunkLimit >> 20} MB).`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sro-'));
  let chunk = [], size = 0, n = 0, sent = 0;
  const flush = async () => {
    if (!chunk.length) return;
    const zipPath = path.join(tmp, `c${++n}.zip`);
    execFileSync('zip', ['-q', '-X', '-9', zipPath, '-@'], { cwd: OUT, input: chunk.join('\n') });
    const form = new FormData();
    form.append('zip', new Blob([fs.readFileSync(zipPath)], { type: 'application/zip' }), `c${n}.zip`);
    const r = await call('upload', null, form);
    sent += r.written;
    console.log(`  chunk ${n}: ${r.written} files${r.skipped?.length ? `, ${r.skipped.length} skipped` : ''}`);
    fs.unlinkSync(zipPath);
    chunk = []; size = 0;
  };
  for (const rel of need) {
    const s = fs.statSync(path.join(OUT, rel)).size;
    if (size + s > chunkLimit * 2.5) await flush(); // html/json compress ~3-5x
    chunk.push(rel); size += s;
  }
  await flush();
  await call('finish', { version: build.version, stamp: build.stamp || '', questions: build.questions || 0, changed: sent });
  console.log(`Done. ${sent} files updated on ${SITE}`);
} catch (e) {
  console.error('Deploy failed:', e.message);
  try { await call('fail', { message: e.message }); } catch {}
  process.exit(1);
}
