// Menu used by the desktop nav, the mobile drawer and the footer. Build-time default; the live site can add
// editor-picked links on top (WordPress → Appearance → Menus → "SRO App Menu", served by sro-api /menu).
import { BOARDS } from '@/data/boards';
import type { ActionIconName } from '@/components/ActionIcon';
import { SUBJECTS } from './taxonomy';

export interface MenuItem { label: string; href: string; i3d: string; sub?: string; badge?: string; app?: boolean; seal?: string; ai?: ActionIconName }

export const PRIMARY: MenuItem[] = [
  { label: 'Home', href: '/', i3d: 'sparkles', app: true },
  { label: 'Previous Year Papers', href: '/pyq/', i3d: 'pages', ai: 'pyq', sub: 'Solved, every shift', app: true },
  { label: 'Mock Tests', href: '/test-series/', i3d: 'stopwatch', ai: 'mock', sub: 'Real CBT + All-India rank', app: true },
  { label: 'Practice MCQs', href: '/mcq/', i3d: 'target', ai: 'practice', sub: 'Chapter-wise PYQs', app: true },
  { label: 'Current Affairs', href: '/current-affairs/', i3d: 'newspaper', ai: 'current', sub: 'Day-wise + PDF', app: true },
  { label: 'Daily Quiz', href: '/daily-quiz/', i3d: 'fire', sub: '10 PYQs · 5 min', app: true },
  { label: 'My Revision', href: '/revise/', i3d: 'repeat', sub: 'Mistakes return until mastered', app: true },
  { label: 'Rank Predictor', href: '/rank-predictor/', i3d: 'chart', ai: 'rank', sub: 'From your answer key' },
  { label: 'SRO Jeet', href: '/jeet/', i3d: 'crown', sub: 'Mocks, rank, PDFs', badge: 'NEW', app: true },
];

/** Sarkari updates stay on WordPress (existing URLs keep their rankings). */
export const UPDATES: MenuItem[] = [
  { label: 'Latest Jobs', href: '/category/latest-jobs/', i3d: 'news', ai: 'jobs' },
  { label: 'Results', href: '/category/result/', i3d: 'trophy', ai: 'result' },
  { label: 'Admit Card', href: '/category/admit-card/', i3d: 'ticket', ai: 'admit' },
  { label: 'Answer Key', href: '/category/answer-key/', i3d: 'key', ai: 'answerkey' },
  { label: 'Syllabus', href: '/category/syllabus/', i3d: 'books' },
];

export const MENU_EXAMS: MenuItem[] = [
  ...BOARDS.slice(0, 7).map((b) => ({ label: b.short, href: `/exams/${b.slug}/`, i3d: 'govt', seal: b.slug, app: true })),
  { label: 'All exams', href: '/exams/', i3d: 'books', app: true },
];
export const REQUEST: MenuItem = { label: 'Request a paper', href: '/request-paper/', i3d: 'inbox', ai: 'request', sub: 'Upload it — we solve & publish' };
export const MENU_SUBJECTS: MenuItem[] = SUBJECTS.slice(0, 8).map((s) => ({ label: s.short, href: `/mcq/${s.slug}/`, i3d: s.i3d, app: true }));

export const HELP: MenuItem[] = [
  { label: 'My progress', href: '/my/', i3d: 'chart', app: true },
  { label: 'Refer & earn', href: '/refer/', i3d: 'gift', app: true },
  { label: 'About & editorial policy', href: '/about-us/', i3d: 'shield' },
  { label: 'Contact', href: '/contact-us/', i3d: 'chat' },
];
