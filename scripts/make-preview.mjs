// Turns the NEXT_PUBLIC_PREVIEW=1 export (out-preview/) into a folder that works from any sub-path
// (relative asset paths, index.html links, no client router). Production builds never use this.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(process.argv[2] || 'out-preview');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(root);
const pages = files.filter((f) => f.endsWith('index.html')).map((f) => '/' + path.relative(root, path.dirname(f)).split(path.sep).filter(Boolean).join('/') + (path.dirname(f) === root ? '' : '/'));
const known = JSON.stringify(pages);

for (const f of files) {
  if (f.endsWith('.txt')) { fs.unlinkSync(f); continue; }
  if (f.includes(`${path.sep}_next${path.sep}`) && f.endsWith('.css')) {
    let s = fs.readFileSync(f, 'utf8');
    if (s.includes('/__SRO__/_next/static/')) { s = s.replaceAll('/__SRO__/_next/static/', '../'); fs.writeFileSync(f, s); }
    continue;
  }
  if (f.includes(`${path.sep}_next${path.sep}`) && f.endsWith('.js')) {
    let s = fs.readFileSync(f, 'utf8');
    if (s.includes('"/__SRO__/_next/"')) { s = s.replaceAll('"/__SRO__/_next/"', '(self.__SRO_BASE||"/")+"_next/"'); fs.writeFileSync(f, s); }
    continue;
  }
  if (!f.endsWith('.html')) continue;
  const depth = path.relative(root, path.dirname(f)).split(path.sep).filter(Boolean).length;
  const rel = depth ? '../'.repeat(depth) : './';
  let s = fs.readFileSync(f, 'utf8');
  s = s.replaceAll('/__SRO__/', rel);
  const toRel = (u) => {
    const [pq, h] = u.split('#'); const p = pq.split('?')[0];
    const target = p.endsWith('/') ? p : p + '/';
    if (!pages.includes(target) && !/\.(svg|xml|txt|png|webp|json|webmanifest|woff2)$/.test(p)) return null;
    const file = /\.(svg|xml|txt|png|webp|json|webmanifest|woff2)$/.test(p) ? p.slice(1) : target.slice(1) + 'index.html';
    return rel + file + (h ? '#' + h : '');
  };
  s = s.replace(/(href|action|src)="(\/[^"/][^"]*|\/)"/g, (m, attr, u) => { const r = toRel(u); return r ? `${attr}="${r}"` : m; });
  const boot = `<script>self.__SRO_BASE=${JSON.stringify(rel)};(function(){var K=${known};function t(m){var d=document.createElement('div');d.textContent=m;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0b1a4a;color:#fff;padding:10px 16px;border-radius:12px;z-index:999;font:600 14px system-ui;max-width:90vw;text-align:center';document.body.appendChild(d);setTimeout(function(){d.remove()},2600)}document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="/"]');if(!a)return;var u=a.getAttribute('href');if(u.slice(0,2)==='//')return;e.preventDefault();var p=u.split('#')[0],h=u.split('#')[1];var tg=p.slice(-1)==='/'?p:p+'/';if(K.indexOf(tg)<0){t('In the live site this opens the existing '+p+' section.');return}location.href=self.__SRO_BASE+tg.slice(1)+'index.html'+(h?'#'+h:'')},true)})();</script>`;
  s = s.replace('<head>', '<head>' + boot);
  fs.writeFileSync(f, s);
}
console.log('pages', pages.length);
