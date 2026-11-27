'use client';
import { useEffect, useRef, useState } from 'react';
import { API, DEMO } from '@/lib/api';
import ActionIcon from './ActionIcon';

type Opt = { slug: string; short: string; exams: string[] };
const MAX_FILES = 6, MAX_FILE = 10 * 1024 * 1024, MAX_TOTAL = 25 * 1024 * 1024;
const OK_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function RequestPaper({ boards }: { boards: Opt[] }) {
  const [board, setBoard] = useState('');
  const [exam, setExam] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Pre-fill from ?board=&exam= (links from board pages).
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const b = p.get('board') || '';
    if (boards.some((x) => x.slug === b)) setBoard(b);
    const e = p.get('exam');
    if (e) setExam(e.slice(0, 160));
  }, [boards]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!OK_TYPES.includes(f.type)) { setMsg({ ok: false, t: `${f.name}: only PDF, JPG, PNG or WebP.` }); continue; }
      if (f.size > MAX_FILE) { setMsg({ ok: false, t: `${f.name} is over 10 MB.` }); continue; }
      if (next.length >= MAX_FILES) { setMsg({ ok: false, t: `Up to ${MAX_FILES} files.` }); break; }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    if (next.reduce((n, f) => n + f.size, 0) > MAX_TOTAL) { setMsg({ ok: false, t: 'Total upload must be under 25 MB.' }); return; }
    setFiles(next);
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setMsg(null);
    const form = ev.currentTarget;
    const fd = new FormData(form);
    fd.delete('files[]');
    files.forEach((f) => fd.append('files[]', f, f.name));
    if (String(fd.get('exam') || '').trim().length < 3) { setMsg({ ok: false, t: 'Please tell us the exam name.' }); return; }
    setBusy(true);
    try {
      if (DEMO) { await new Promise((r) => setTimeout(r, 700)); }
      else {
        const r = await fetch(`${API}/requests`, { method: 'POST', credentials: 'include', headers: { 'X-SRO': '1' }, body: fd });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((d as { message?: string }).message || 'Could not send. Please try again.');
      }
      setMsg({ ok: true, t: files.length ? `Thank you! Your request and ${files.length} file${files.length > 1 ? 's' : ''} reached our editors. We solve the paper and notify you when it is live.` : 'Thank you! Your request reached our editors. Most-requested papers are published first.' });
      form.reset(); setFiles([]); setExam('');
    } catch (e) {
      setMsg({ ok: false, t: (e as Error).message });
    } finally { setBusy(false); }
  };

  const sel = boards.find((b) => b.slug === board);
  const year = new Date().getFullYear();
  return (
    <form className="rq-form card" onSubmit={submit} noValidate>
      <div className="rq-row">
        <label>Exam board
          <select name="board" value={board} onChange={(e) => setBoard(e.target.value)}>
            <option value="">Select board (optional)</option>
            {boards.map((b) => <option key={b.slug} value={b.slug}>{b.short}</option>)}
            <option value="other">Other board / state</option>
          </select>
        </label>
        <label>Exam name *
          <input name="exam" required maxLength={160} list="rq-exams" value={exam} onChange={(e) => setExam(e.target.value)} placeholder="e.g. RRB NTPC Graduate, GSSSB CCE" />
          <datalist id="rq-exams">{(sel ? sel.exams : boards.flatMap((b) => b.exams)).map((x) => <option key={x} value={x} />)}</datalist>
        </label>
      </div>
      <div className="rq-row">
        <label>Year
          <select name="year" defaultValue="">
            <option value="">Any / latest</option>
            {Array.from({ length: 12 }, (_, i) => year - i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Date / shift / stage
          <input name="shift" maxLength={80} placeholder="e.g. 8 May 2024 · Shift 2 · CBT 1" />
        </label>
      </div>
      <div className="rq-row">
        <label>Paper language
          <select name="lang" defaultValue="">
            <option value="">Any</option><option value="en">English</option><option value="hi">हिन्दी</option><option value="gu">ગુજરાતી</option>
          </select>
        </label>
        <label>Mobile or email (to notify you)
          <input name="contact" maxLength={190} inputMode="email" autoComplete="email" placeholder="Optional" />
        </label>
      </div>
      <div
        className={`rq-drop${over ? ' over' : ''}`}
        role="button" tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <ActionIcon name="request" size={40} />
        <b>Upload the question paper (optional)</b>
        <small>PDF or photos · up to {MAX_FILES} files · 10 MB each</small>
        <input ref={input} type="file" name="files[]" accept="application/pdf,image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {files.length > 0 && (
        <ul className="rq-files">{files.map((f, i) => <li key={f.name + f.size}><span>{f.name} · {kb(f.size)}</span><button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button></li>)}</ul>
      )}
      <label>Anything else?
        <textarea name="note" rows={3} maxLength={600} placeholder="Post name, source of the paper, answer key link…" />
      </label>
      <div className="rq-hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {msg && <p className={`rq-msg ${msg.ok ? 'ok' : 'err'}`} role={msg.ok ? 'status' : 'alert'}>{msg.t}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send request'}</button>
      <small className="muted">Uploads are seen only by SRO editors and are used only to publish the paper. {DEMO && '(Preview mode: nothing is sent.)'}</small>
    </form>
  );
}
