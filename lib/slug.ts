const ascii = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** Short, stable hash so a name written only in Gujarati/Hindi still gets a web address (never an empty one). */
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
export const slugify = (s: string) => ascii(s ?? '') || (String(s ?? '').trim() ? `t-${hash(String(s).trim())}` : 'general');
/** Plain text for titles, meta and schema: drops **bold** markers and folds line breaks. */
export const plain = (s: string) => s.replace(/!\[([^\]]*)\]\([^)\s]+\)/g, (_m, a: string) => a || 'Figure').replace(/\*\*/g, '').replace(/\s*\n+\s*/g, ' ').trim();
