'use client';
// Real exam mode for a previous year paper. "?part=part-a" (from the paper page) runs just that part
// with its own timer and saved progress; without it the whole paper runs.
import { useEffect, useState } from 'react';
import TestEngine, { type TPaper } from './TestEngine';

export default function PaperTest({ paper, perQ, parts }: { paper: TPaper; perQ: number; parts: { slug: string; name: string; from: number; to: number }[] }) {
  const [part, setPart] = useState<string | null | undefined>(undefined);
  useEffect(() => { setPart(new URLSearchParams(window.location.search).get('part')); }, []);
  if (part === undefined) return <div className="wrap" style={{ minHeight: '60vh' }} aria-busy="true" />;
  const r = part ? parts.find((x) => x.slug === part) : undefined;
  if (!r) return <TestEngine key="all" paper={paper} />;
  const questions = paper.questions.filter((q) => q.qNo >= r.from && q.qNo <= r.to);
  const p: TPaper = { ...paper, key: `${paper.key}/${r.slug}`, title: `${paper.title} · ${r.name}`, seconds: Math.round(perQ * questions.length), questions };
  return <TestEngine key={r.slug} paper={p} />;
}
