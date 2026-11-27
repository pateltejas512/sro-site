// Language registry. Adding a language = add one line here + translations in question_i18n.
// No schema, page or component change is needed — every page renders whatever languages a question has.
export const LANGS = [
  { code: 'en', name: 'English', native: 'English', short: 'EN', locale: 'en-IN', script: 'Latin', status: 'live' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', short: 'हि', locale: 'hi-IN', script: 'Devanagari', status: 'live' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', short: 'ગુ', locale: 'gu-IN', script: 'Gujarati', status: 'live' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', short: 'म', locale: 'mr-IN', script: 'Devanagari', status: 'planned' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', short: 'বা', locale: 'bn-IN', script: 'Bengali', status: 'planned' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', short: 'த', locale: 'ta-IN', script: 'Tamil', status: 'planned' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', short: 'తె', locale: 'te-IN', script: 'Telugu', status: 'planned' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', short: 'ಕ', locale: 'kn-IN', script: 'Kannada', status: 'planned' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', short: 'മ', locale: 'ml-IN', script: 'Malayalam', status: 'planned' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', short: 'ਪੰ', locale: 'pa-IN', script: 'Gurmukhi', status: 'planned' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', short: 'ଓ', locale: 'or-IN', script: 'Odia', status: 'planned' },
  { code: 'ur', name: 'Urdu', native: 'اردو', short: 'اُ', locale: 'ur-IN', script: 'Arabic', status: 'planned', rtl: true },
] as const;

export type Lang = (typeof LANGS)[number]['code'];
export const LANG_INFO = Object.fromEntries(LANGS.map((l) => [l.code, l])) as Record<Lang, (typeof LANGS)[number]>;
export const LIVE_LANGS = LANGS.filter((l) => l.status === 'live').map((l) => l.code) as Lang[];
/** URL prefix per language for production routing: / (en), /gu/, /hi/, /mr/ … */
export const langPrefix = (l: Lang) => (l === 'en' ? '' : `/${l}`);
