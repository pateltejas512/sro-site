// Latest WordPress posts (jobs, results, admit cards…) for the homepage.
// Build time: fetched from WP_URL (the live site) so the static HTML is fresh for Google.
// Run time: components/LiveUpdates.tsx refreshes from same-origin /wp-json, so visitors always see new posts.
// Fallback: a real snapshot of the live site (data/wp-snapshot.json) when the build has no network.
import snapshot from '@/data/wp-snapshot.json';

export interface Post { t: string; u: string; d: string }
export type BoardKey = 'jobs' | 'results' | 'admit' | 'keys' | 'syllabus' | 'admission';
export type Board = Record<BoardKey, Post[]>;

export const BOARDS: { key: BoardKey; label: string; cat: number; slug: string; i3d: string }[] = [
  { key: 'jobs', label: 'Latest Jobs', cat: 7, slug: 'latest-jobs', i3d: 'news' },
  { key: 'results', label: 'Results', cat: 5, slug: 'result', i3d: 'trophy' },
  { key: 'admit', label: 'Admit Card', cat: 6, slug: 'admit-card', i3d: 'ticket' },
  { key: 'keys', label: 'Answer Key', cat: 8, slug: 'answer-key', i3d: 'key' },
  { key: 'syllabus', label: 'Syllabus', cat: 42, slug: 'syllabus', i3d: 'scroll' },
  { key: 'admission', label: 'Admission', cat: 10, slug: 'admission', i3d: 'cap' },
];

const decode = (s: string) => s.replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#038;|&amp;/g, '&').replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘').replace(/&#8220;|&#8221;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
export const toPosts = (rows: { title: { rendered: string }; link: string; date: string }[], origin: string): Post[] =>
  rows.map((p) => ({ t: decode(p.title.rendered), u: p.link.replace(origin, '') || '/', d: p.date.slice(0, 10) }));

export const wpQuery = (cat: number, n = 8) => `/wp-json/wp/v2/posts?categories=${cat}&per_page=${n}&_fields=title,link,date`;

export async function getBoard(): Promise<{ board: Board; asOf: string; live: boolean }> {
  const base = process.env.WP_URL;
  if (base) {
    try {
      const entries = await Promise.all(BOARDS.map(async (b) => {
        const r = await fetch(base + wpQuery(b.cat), { signal: AbortSignal.timeout(8000) });
        if (!r.ok) throw new Error(String(r.status));
        return [b.key, toPosts(await r.json(), base)] as const;
      }));
      return { board: Object.fromEntries(entries) as Board, asOf: new Date().toISOString().slice(0, 10), live: true };
    } catch { /* fall through to snapshot */ }
  }
  const { capturedAt, ...rest } = snapshot as unknown as Board & { capturedAt: string };
  return { board: rest as Board, asOf: capturedAt, live: false };
}

const GUJ = /gujarat|gsssb|gpsc|guvnl|gset|gseb|ohas|amc |amc$|surat|vadodara|rajkot|saurashtra|ahmedabad|gsrtc|gpssb|talati|lrd|ojas|gujarati|vidyut sahayak|ugvcl|pgvcl|dgvcl|mgvcl|getco|gsecl/i;
export const isGujarat = (p: Post) => GUJ.test(p.t);
