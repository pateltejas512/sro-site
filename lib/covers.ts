// Cover image of a mock test: the generated one (scripts/covers.mjs → public/covers) or the one uploaded in Studio.
// Server-only (reads the file system at build time).
import fs from 'node:fs';
import path from 'node:path';
import type { Paper } from './types';

export function coverOf(p: Paper): string | undefined {
  const rel = `/covers/${p.examSlug}/${p.slug}.webp`;
  if (fs.existsSync(path.join(process.cwd(), 'public', rel))) return rel;
  return p.image || undefined;
}
