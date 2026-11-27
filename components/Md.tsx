// Tiny, safe markdown for question text and solutions: **bold**, line breaks, "### " headings, "- " / "1. " lists,
// LaTeX formulas ($...$, $$...$$, \(...\), \[...\]) typeset with KaTeX, and solution diagrams written as
// ![alt text](https://…/image.png) on their own line.
// No raw HTML from content is ever injected — text renders as React text nodes; only KaTeX output is set as HTML.
import { Fragment, type ReactNode } from 'react';
import Tex from './Tex';

const MATH = /(\$\$[^$]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
const IMG = /^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^\s)]+)\)\s*$/;

/** Text with formulas: plain parts stay text, formula parts become <Tex>. */
function Rich({ text }: { text: string }) {
  const parts = text.split(MATH);
  return (
    <>
      {parts.map((p, k) => {
        if (k % 2 === 0) return p ? <Fragment key={k}>{p}</Fragment> : null;
        if (p.startsWith('$$')) return <Tex key={k} tex={p.slice(2, -2).trim()} display />;
        if (p.startsWith('\\[')) return <Tex key={k} tex={p.slice(2, -2).trim()} display />;
        if (p.startsWith('\\(')) return <Tex key={k} tex={p.slice(2, -2).trim()} />;
        return <Tex key={k} tex={p.slice(1, -1).trim()} />;
      })}
    </>
  );
}

/** A picture inside question or option text, written as ![alt](https://…/image.png) on its own line
 *  (an option whose answer is a figure, like the original paper). */
function InlineImg({ alt, src }: { alt: string; src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="opt-img"
      src={src}
      alt={alt || 'Figure'}
      loading="lazy"
      decoding="async"
      style={{ display: 'block', maxWidth: '100%', width: 'auto', height: 'auto', maxHeight: 200, margin: '2px 0', borderRadius: 6, background: '#fff' }}
    />
  );
}

/** Inline: **bold**, formulas, single line breaks and pictures on their own line. */
export function Inline({ text }: { text: string }) {
  const lines = dropBareImgs(text).split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const img = line.trim().match(IMG);
        if (img) return <InlineImg key={i} alt={img[1]} src={img[2]} />;
        const why = line.trim().match(/^\(\((.+)\)\)$/); // "((Why? …))" = a muted reason line under a step
        if (why) return <span key={i} className="md-why"><Inline text={why[1]} /></span>;
        return (
        <Fragment key={i}>
          {i > 0 && !lines[i - 1].trim().match(IMG) && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') && part.length > 4
              ? <b key={j}><Rich text={part.slice(2, -2)} /></b>
              : <Rich key={j} text={part.replace(/\*\*/g, '')} />
          )}
        </Fragment>
        );
      })}
    </>
  );
}

/** A pipe-table row from the paper, e.g. "Number/Symbol | 2 | ? | * | @" (needs 3+ cells). */
const isRow = (l: string) => !/\$[^\s$][^$]*\|[^$]*[^\s$]\$/.test(l) && (l.match(/\|/g) || []).length >= 2 && l.split('|').filter((c) => c.trim() !== '').length >= 3;
const cells = (l: string) => {
  const c = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((x) => x.trim());
  return c;
};
/** A table cell: formulas still typeset, but a lone symbol like "$" or "@" stays plain text. */
function Cell({ text }: { text: string }) {
  return /\$[^$]+\$|\\[(\[]/.test(text) ? <Inline text={text} /> : <>{text}</>;
}

/** Question text (stem): every line is its own evenly spaced row (blank lines in the source no longer make
 *  uneven gaps), and rows written as "a | b | c" become a real table (koshtak), like in the printed paper. */
export function Stem({ text }: { text: string }) {
  const lines = dropBareImgs(text).split('\n').map((l) => l.trimEnd());
  const blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (isRow(line) && i + 1 < lines.length && isRow(lines[i + 1])) {
      const rows: string[][] = [];
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]));
      i--;
      const w = Math.max(...rows.map((r) => r.length));
      blocks.push(
        <span key={blocks.length} className="sl q-tablewrap">
          <table className="q-table">
            <tbody>
              {rows.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c) || c === '')).map((r, ri) => (
                <tr key={ri}>{Array.from({ length: w }, (_, ci) => (ci === 0 || (ri === 0 && rows.length > 2) ? <th key={ci} scope={ri === 0 && rows.length > 2 ? 'col' : 'row'}><Cell text={r[ci] ?? ''} /></th> : <td key={ci}><Cell text={r[ci] ?? ''} /></td>))}</tr>
              ))}
            </tbody>
          </table>
        </span>
      );
      continue;
    }
    blocks.push(<span key={blocks.length} className="sl"><Inline text={line} /></span>);
  }
  return <>{blocks}</>;
}

/** Join a display formula that was written over several lines ($$ … $$ / \[ … \]) into one line. */
function joinDisplayMath(text: string): string {
  return text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, t: string) => `$$${t.replace(/\s*\n\s*/g, ' ').trim()}$$`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, t: string) => `\\[${t.replace(/\s*\n\s*/g, ' ').trim()}\\]`);
}

function Figure({ alt, src }: { alt: string; src: string }) {
  return (
    <figure className="sol-fig" style={{ margin: '12px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: 720, borderRadius: 12, border: '1px solid rgba(127,127,127,.25)', background: '#fff' }}
      />
    </figure>
  );
}

function Block({ text }: { text: string }) {
  const lines = joinDisplayMath(text).split('\n');
  const out: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];
  const flushPara = () => { if (para.length) out.push(<p key={out.length}><Inline text={para.join('\n')} /></p>); para = []; };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}><Inline text={it} /></li>);
    out.push(list.ordered ? <ol key={out.length}>{items}</ol> : <ul key={out.length}>{items}</ul>);
    list = null;
  };
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const line = raw.trimEnd();
    // Markdown table: "| a | b |" header, "|---|---|" separator, then body rows
    if (/^\s*\|.*\|\s*$/.test(line) && li + 1 < lines.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[li + 1])) {
      flushList();
      flushPara();
      const head = cells(line);
      const body: string[][] = [];
      li += 2;
      while (li < lines.length && /^\s*\|.*\|\s*$/.test(lines[li])) body.push(cells(lines[li++]));
      li--;
      out.push(
        <div key={out.length} className="q-tablewrap md-tablewrap">
          <table className="q-table md-table">
            <thead><tr>{head.map((c, ci) => <th key={ci} scope="col"><Inline text={c} /></th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{head.map((_, ci) => <td key={ci}><Inline text={r[ci] ?? ''} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    // Flow chips: ">> step → step → answer" (last chip = result, shown green)
    const flow = line.match(/^\s*>>\s*(.+)$/);
    if (flow) {
      flushList();
      flushPara();
      const chips = flow[1].split(/\s*→\s*/).filter(Boolean);
      out.push(
        <div key={out.length} className="md-flow">
          {chips.map((c, ci) => (
            <Fragment key={ci}>
              {ci > 0 && <span className="md-flow-arrow" aria-hidden="true">→</span>}
              <span className={ci === chips.length - 1 ? 'md-chip md-chip-end' : 'md-chip'}><Inline text={c} /></span>
            </Fragment>
          ))}
        </div>
      );
      continue;
    }
    // Hidden answer: "||label|answer||" or "||answer||" → tap to reveal (practice questions)
    const rev = line.trim().match(/^\|\|(?:([^|]{1,40})\|)?(.+)\|\|$/);
    if (rev) {
      flushList();
      flushPara();
      out.push(
        <details key={out.length} className="md-reveal">
          <summary>{rev[1] || '✓ Answer'}</summary>
          <div><Inline text={rev[2]} /></div>
        </details>
      );
      continue;
    }
    const img = line.trim().match(IMG);
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const disp = line.trim().match(/^(?:\$\$([^$]+)\$\$|\\\[([\s\S]+)\\\])$/);
    if (img) {
      flushList();
      flushPara();
      out.push(<Figure key={out.length} alt={img[1]} src={img[2]} />);
    } else if (disp && !list) {
      // a formula on its own line = its own centred block
      flushPara();
      out.push(<div key={out.length} className="math-block"><Tex tex={(disp[1] ?? disp[2]).trim()} display /></div>);
    } else if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((ul ?? ol)![1]);
    } else if (list && line && /^\s{2,}/.test(raw)) {
      list.items[list.items.length - 1] += '\n' + line.trim();
    } else if (list && line && !/^#/.test(line) && !/^\*\*[^*]+\*\*$/.test(line)) {
      // continuation line right under a list item (the live solutions write the reason on the next line)
      list.items[list.items.length - 1] += '\n' + line;
    } else {
      flushList();
      if (line) para.push(line); else flushPara();
    }
  }
  flushList();
  flushPara();
  return <>{out}</>;
}

/** Block markdown used for detailed solutions. */
/** Pictures whose file never got a web address (e.g. a bare "q16-svc.png" from ChatGPT) are left out instead of showing as
 *  raw text, together with a "Diagram:" label that would be left empty. */
export const dropBareImgs = (t: string) =>
  t.includes('](')
    ? t.replace(/!\[[^\]]*\]\((?!https?:\/\/|\/)[^)]*\)/g, '').split('\n').filter((l) => !/^\s*(\*\*)?(diagram|figure)\s*:?\s*(\*\*)?\s*:?\s*$/i.test(l)).join('\n')
    : t;
/** Premium solution cards: a "### " heading that starts with one of these marks becomes a coloured card
 *  (💡 concept, 🧩 steps, ⚡ shortcut, 🔁 another method, ⚠️ trap, 🧠 memory trick, 📚 exam bonus, ❌ why other
 *  options are wrong, ✅ verify). Any other heading stays a plain section, so old solutions look the same. */
const KINDS: [string, string][] = [['🎯', 'ask'], ['💡', 'concept'], ['🧩', 'steps'], ['⚡', 'short'], ['🔁', 'alt'], ['⚠', 'trap'], ['🧠', 'memo'], ['📚', 'bonus'], ['❌', 'wrong'], ['✅', 'check'], ['📘', 'learn'], ['✏', 'practice']];
const kindOf = (h: string) => KINDS.find(([m]) => h.startsWith(m))?.[1];

type SecT = { h: string; body: string; k?: string };
function Sec({ h, body, k }: SecT) {
  return (
    <section className={k ? `md-sec sk sk-${k}` : 'md-sec'}>
      <p className="dh"><b>{h}</b></p>
      {body && <Block text={body} />}
    </section>
  );
}
/** Short side cards sit two per row: ⚡ shortcut + 🔁 another way, ⚠️ trap + 🧠 memory trick. */
const PAIRS = [['short', 'trap'], ['short', 'alt'], ['trap', 'memo']];
function group(list: SecT[]): SecT[][] {
  const out: SecT[][] = [];
  for (let i = 0; i < list.length; i++) {
    const a = list[i], b = list[i + 1];
    if (b && PAIRS.some(([x, y]) => a.k === x && b.k === y)) { out.push([a, b]); i++; } else out.push([a]);
  }
  return out;
}

export default function Md({ text, className = 'detail' }: { text: string; className?: string }) {
  const clean = dropBareImgs(text);
  const parts = clean.split(/^### /m).filter((p, i) => i === 0 || p.indexOf('\n') >= 0 && p.slice(p.indexOf('\n') + 1).trim() !== '');
  const pre = parts.shift()!.trim();
  return (
    <div className={className}>
      {pre && <Block text={pre} />}
      {group(parts.map((p) => {
        const nl = p.indexOf('\n');
        const h = (nl < 0 ? p : p.slice(0, nl)).trim();
        const body = nl < 0 ? '' : p.slice(nl + 1).trim();
        return { h, body, k: kindOf(h) };
      })).map((g, i) =>
        g.length > 1 ? (
          <div key={i} className="sk-pair">{g.map((x, j) => <Sec key={j} {...x} />)}</div>
        ) : (
          <Sec key={i} {...g[0]} />
        )
      )}
    </div>
  );
}
