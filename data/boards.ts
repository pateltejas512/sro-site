// Exam boards → groups → exams. `exam` links an exam that already has papers on SRO (data/exams.ts);
// every other exam is listed so students can find it and request its paper (/request-paper/).
// Exam lists follow each board's current recruitment cycle (RRB CEN 2025-26, SSC calendar 2026, IBPS/SBI/RBI, GSSSB/GPSSB/GPSC 2026).

import studio from './studio/export.json';

export interface BoardExam { name: string; short: string; exam?: string; posts?: string }
export interface BoardGroup { title: string; exams: BoardExam[] }
export interface Board {
  slug: string;
  short: string;
  name: string;
  scope: 'Central' | 'Gujarat';
  blurb: string;
  seal: { mono: string; hue: string; deep: string; motif: 'rail' | 'book' | 'bank' | 'clipboard' | 'scales' | 'village' | 'bolt' | 'shield' | 'chalk' };
  groups: BoardGroup[];
  popular?: boolean;
}

export const BOARDS: Board[] = [
  {
    slug: 'rrb', short: 'RRB', name: 'Railway Recruitment Boards', scope: 'Central', popular: true,
    blurb: 'Indian Railways recruitment through 21 RRBs — technical, non-technical, Group D and RPF.',
    seal: { mono: 'RRB', hue: '#c23a2b', deep: '#7d1d14', motif: 'rail' },
    groups: [
      { title: 'Engineering & technical', exams: [
        { name: 'RRB Junior Engineer (JE)', short: 'RRB JE', exam: 'rrb-je', posts: 'JE, DMS, CMA' },
        { name: 'RRB Assistant Loco Pilot (ALP)', short: 'RRB ALP' },
        { name: 'RRB Technician (Grade I & III)', short: 'RRB Technician' },
        { name: 'RRB Section Controller', short: 'Section Controller' },
      ] },
      { title: 'Non-technical (NTPC)', exams: [
        { name: 'RRB NTPC Graduate Level', short: 'NTPC Graduate', posts: 'Station Master, Goods Train Manager, Clerk' },
        { name: 'RRB NTPC Undergraduate Level', short: 'NTPC Undergraduate', posts: 'Clerk-cum-Typist, Train Clerk' },
        { name: 'RRB Ministerial & Isolated Categories', short: 'Ministerial & Isolated' },
        { name: 'RRB Paramedical Categories', short: 'Paramedical' },
      ] },
      { title: 'Group D & RPF', exams: [
        { name: 'RRB Group D (Level 1)', short: 'RRB Group D' },
        { name: 'RPF Sub-Inspector', short: 'RPF SI' },
        { name: 'RPF Constable', short: 'RPF Constable' },
      ] },
    ],
  },
  {
    slug: 'ssc', short: 'SSC', name: 'Staff Selection Commission', scope: 'Central', popular: true,
    blurb: 'Central government Group B & C posts — CGL, CHSL, MTS, GD, JE, CPO and more.',
    seal: { mono: 'SSC', hue: '#3e47b0', deep: '#1f2566', motif: 'book' },
    groups: [
      { title: 'Graduate & 12th level', exams: [
        { name: 'SSC Combined Graduate Level (CGL)', short: 'SSC CGL' },
        { name: 'SSC Combined Higher Secondary Level (CHSL)', short: 'SSC CHSL' },
        { name: 'SSC Stenographer Grade C & D', short: 'SSC Stenographer' },
        { name: 'SSC Selection Post (Phase)', short: 'SSC Selection Post' },
      ] },
      { title: '10th level & police', exams: [
        { name: 'SSC Multi-Tasking Staff (MTS) & Havaldar', short: 'SSC MTS' },
        { name: 'SSC GD Constable', short: 'SSC GD' },
        { name: 'SSC CPO Sub-Inspector (Delhi Police & CAPF)', short: 'SSC CPO' },
      ] },
      { title: 'Engineering', exams: [
        { name: 'SSC Junior Engineer (Civil, Electrical, Mechanical)', short: 'SSC JE' },
      ] },
    ],
  },
  {
    slug: 'banking', short: 'Banking', name: 'Banking — IBPS, SBI & RBI', scope: 'Central', popular: true,
    blurb: 'PO, Clerk, SO and RRB exams of IBPS, SBI and RBI.',
    seal: { mono: 'BANK', hue: '#13865c', deep: '#0a4c34', motif: 'bank' },
    groups: [
      { title: 'IBPS', exams: [
        { name: 'IBPS Probationary Officer (PO)', short: 'IBPS PO' },
        { name: 'IBPS Clerk', short: 'IBPS Clerk' },
        { name: 'IBPS Specialist Officer (SO)', short: 'IBPS SO' },
        { name: 'IBPS RRB Officer Scale I', short: 'IBPS RRB PO' },
        { name: 'IBPS RRB Office Assistant', short: 'IBPS RRB Clerk' },
      ] },
      { title: 'SBI & RBI', exams: [
        { name: 'SBI Probationary Officer (PO)', short: 'SBI PO' },
        { name: 'SBI Junior Associate (Clerk)', short: 'SBI Clerk' },
        { name: 'RBI Grade B Officer', short: 'RBI Grade B' },
        { name: 'RBI Assistant', short: 'RBI Assistant' },
      ] },
    ],
  },
  {
    slug: 'gsssb', short: 'GSSSB', name: 'Gujarat Subordinate Service Selection Board', scope: 'Gujarat', popular: true,
    blurb: 'Gujarat Class-3 posts — Combined Competitive Exam (CCE) Group A & B and technical cadres.',
    seal: { mono: 'GSSSB', hue: '#d2541a', deep: '#8a3207', motif: 'clipboard' },
    groups: [
      { title: 'Combined Competitive Exam', exams: [
        { name: 'GSSSB CCE Group A & B (Prelims & Mains)', short: 'GSSSB CCE', exam: 'gsssb-cce', posts: 'Senior Clerk, Head Clerk, Office Assistant, Revenue Talati and more' },
      ] },
      { title: 'Technical & other cadres', exams: [
        { name: 'Supervisor Instructor – Electrical Group', short: 'Supervisor Instructor', exam: 'gssb-supervisor-instructor-electrical' },
        { name: 'GSSSB Forest Beat Guard', short: 'Forest Beat Guard' },
        { name: 'GSSSB Staff Nurse', short: 'Staff Nurse' },
        { name: 'GSSSB Research / Statistical Assistant', short: 'Research Assistant' },
      ] },
    ],
  },
  {
    slug: 'gpsc', short: 'GPSC', name: 'Gujarat Public Service Commission', scope: 'Gujarat', popular: true,
    blurb: 'Gujarat Class-1 & Class-2 officers — civil services, engineering and specialist posts.',
    seal: { mono: 'GPSC', hue: '#7a3aa3', deep: '#41195e', motif: 'scales' },
    groups: [
      { title: 'Engineering', exams: [
        { name: 'GPSC Deputy Executive Engineer (Electrical) Class-2', short: 'GPSC DEE Electrical', exam: 'gpsc-dee-electrical' },
        { name: 'GPSC Assistant Engineer (Electrical) Class-2', short: 'GPSC AE Electrical', exam: 'gpsc-ae-electrical-class-2' },
        { name: 'GPSC Assistant Engineer (Civil) Class-2', short: 'GPSC AE Civil' },
      ] },
      { title: 'Civil services & administration', exams: [
        { name: 'GPSC Gujarat Administrative Service Class 1-2 (Prelims)', short: 'GPSC Class 1-2' },
        { name: 'GPSC Deputy Section Officer / Deputy Mamlatdar', short: 'GPSC DySO' },
        { name: 'GPSC State Tax Inspector Class-3', short: 'GPSC STI' },
      ] },
    ],
  },
  {
    slug: 'gpssb', short: 'GPSSB', name: 'Gujarat Panchayat Service Selection Board', scope: 'Gujarat',
    blurb: 'District & taluka panchayat posts — Talati, Junior Clerk, Work Assistant and engineering.',
    seal: { mono: 'GPSSB', hue: '#138a8f', deep: '#0a4d50', motif: 'village' },
    groups: [
      { title: 'Panchayat posts', exams: [
        { name: 'GPSSB Talati cum Mantri', short: 'Talati cum Mantri' },
        { name: 'GPSSB Junior Clerk (Accounts / Administration)', short: 'Junior Clerk' },
        { name: 'GPSSB Work Assistant', short: 'Work Assistant' },
      ] },
      { title: 'Engineering', exams: [
        { name: 'GPSSB Additional Assistant Engineer (Electrical)', short: 'GPSSB AAE Electrical', exam: 'gpssb-aae-electrical' },
        { name: 'GPSSB Additional Assistant Engineer (Civil)', short: 'GPSSB AAE Civil' },
      ] },
    ],
  },
  {
    slug: 'guvnl', short: 'GUVNL', name: 'Gujarat Urja Vikas Nigam (GUVNL) companies', scope: 'Gujarat',
    blurb: 'Gujarat power companies — DGVCL, MGVCL, PGVCL, UGVCL, GETCO and GSECL.',
    seal: { mono: 'GUVNL', hue: '#b98a12', deep: '#6b4d05', motif: 'bolt' },
    groups: [
      { title: 'Engineering & office', exams: [
        { name: 'Vidyut Sahayak (Junior Engineer – Electrical)', short: 'Vidyut Sahayak JE', exam: 'guvnl-vidyut-sahayak-je' },
        { name: 'Vidyut Sahayak (Junior Assistant)', short: 'VS Junior Assistant' },
        { name: 'GETCO Junior Engineer (Electrical)', short: 'GETCO JE' },
      ] },
    ],
  },
  {
    slug: 'gujarat-police', short: 'Police', name: 'Gujarat Police Recruitment', scope: 'Gujarat',
    blurb: 'Lokrakshak (LRD), Police Sub-Inspector and other Gujarat Police posts.',
    seal: { mono: 'GP', hue: '#2a4f80', deep: '#142a48', motif: 'shield' },
    groups: [
      { title: 'Police', exams: [
        { name: 'Gujarat Police Lokrakshak (LRD) Constable', short: 'LRD Constable' },
        { name: 'Gujarat Police Sub-Inspector (PSI)', short: 'Gujarat PSI' },
      ] },
    ],
  },
  {
    slug: 'teaching', short: 'Teaching', name: 'Teacher Eligibility & Recruitment', scope: 'Central',
    blurb: 'CTET and Gujarat TET / TAT for primary, secondary and higher-secondary teachers.',
    seal: { mono: 'TET', hue: '#b33a62', deep: '#6b1b36', motif: 'chalk' },
    groups: [
      { title: 'Eligibility tests', exams: [
        { name: 'Central Teacher Eligibility Test (CTET)', short: 'CTET' },
        { name: 'Gujarat TET-1 & TET-2', short: 'Gujarat TET' },
        { name: 'Gujarat TAT (Secondary & Higher Secondary)', short: 'Gujarat TAT' },
      ] },
    ],
  },
];

// SRO Studio → Library → Boards: edited/added boards replace the built-in ones with the same slug.
for (const sb of ((studio as unknown as { library?: { boards?: Board[] } }).library?.boards ?? [])) {
  const i = BOARDS.findIndex((b) => b.slug === sb.slug);
  if (i >= 0) BOARDS[i] = { ...BOARDS[i], ...sb }; else BOARDS.push(sb);
}

// Exams added in SRO Studio with a board: link them on that board's page (matched by short name, else listed under "More exams").
for (const e of ((studio as unknown as { exams?: { slug: string; name: string; short: string; board?: string }[] }).exams ?? [])) {
  const b = e.board && BOARDS.find((x) => x.slug === e.board);
  if (!b || b.groups.some((g) => g.exams.some((x) => x.exam === e.slug))) continue;
  const same = b.groups.flatMap((g) => g.exams).find((x) => !x.exam && x.short.toLowerCase() === e.short.toLowerCase());
  if (same) { same.exam = e.slug; continue; }
  let more = b.groups.find((g) => g.title === 'More exams');
  if (!more) { more = { title: 'More exams', exams: [] }; b.groups.push(more); }
  more.exams.push({ name: e.name, short: e.short, exam: e.slug });
}

export const getBoard = (slug: string) => BOARDS.find((b) => b.slug === slug);
export const boardExams = (b: Board) => b.groups.flatMap((g) => g.exams);
export const liveCount = (b: Board) => boardExams(b).filter((e) => e.exam).length;
export const boardOfExam = (examSlug: string) => BOARDS.find((b) => boardExams(b).some((e) => e.exam === examSlug));
export const requestUrl = (b: Board, e?: BoardExam) => `/request-paper/?board=${b.slug}${e ? `&exam=${encodeURIComponent(e.short)}` : ''}`;
