// Day-wise current affairs sets. One entry per day; the editor (or the WordPress importer) appends here.
// Each item = one fact + its MCQ. Keep facts sourced: `source` is the official/news link it came from.
export interface CAItem { topic: 'National' | 'International' | 'Economy' | 'Sports' | 'Awards' | 'Science' | 'Appointments' | 'Days' | 'State'; fact: string; q: string; options: [string, string, string, string]; answer: 'A' | 'B' | 'C' | 'D'; source?: string }
export interface CADay { date: string; items: CAItem[] }
export const currentAffairs: CADay[] = [];
