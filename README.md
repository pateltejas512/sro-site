# SRO PYQ Platform (Next.js)

The new PYQ section for sarkariresultout.com: PYQ hub, exam pages, paper pages (practice mode),
Real exam mode (CBT), question pages and topic MCQ pages. Static export, so it runs on the
current Hostinger hosting behind Cloudflare.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000/pyq/
npm run build        # writes the static site to ./out
```

## Deploy (current hosting)

1. `npm run build`
2. Build with the live API and fresh WordPress posts on the homepage:
   `WP_URL=https://sarkariresultout.com NEXT_PUBLIC_SRO_API=/wp-json/sro/v1 NEXT_PUBLIC_GOOGLE_CLIENT_ID=… npm run build`
3. Upload the contents of `out/` to the site root, **except `index.html` → rename it to `home.html`**
   (so it never competes with WordPress's `index.php`; keep `index.txt` as is — the app uses it for instant navigation). Folders: `pyq/ question/ mcq/ gu/ hi/ jeet/ test-series/ current-affairs/ daily-quiz/ refer/ my/ revise/ _next/ i3d/`
   plus `daily-quiz.json`, `search-index.json`, `manifest.webmanifest`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. Do **not** upload a `robots.txt`.
4. WordPress keeps serving everything else (jobs, results, admin, search). Add to `.htaccess`
   **above** the WordPress block:

```apache
RewriteEngine On
# New homepage (only the bare "/" — WordPress search /?s=… and previews still reach WordPress)
RewriteCond %{QUERY_STRING} ^$
RewriteRule ^$ /home.html [L]
# Static app sections
RewriteRule ^(pyq|question|mcq|gu|hi|jeet|test-series|current-affairs|daily-quiz|refer|my|revise|_next|i3d)(/.*)?$ - [L]
# Old WordPress question URLs → new pages (301, keeps rankings). Generated list: data/live/redirects.csv
RewriteRule ^pyq/(?:gu/)?question/([a-z0-9-]+)/?$ /question/$1/ [R=301,L]
```

Security headers for the app (put in the same `.htaccess`, needs `mod_headers`):

```apache
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")"
  <If "%{REQUEST_URI} =~ m#^/(home\.html|pyq|question|mcq|gu|hi|jeet|test-series|current-affairs|daily-quiz|refer|my|revise)(/|$)#">
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://accounts.google.com; frame-src https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
  </If>
</IfModule>
```

The 301 rule is a catch-all; 99 questions also got a better slug, so add the specific lines from
`data/live/redirects.htaccess` **above** it (ready-made lines for every question whose slug changed).

5. Add `Sitemap: https://sarkariresultout.com/pyq/sitemap.xml` to the WordPress robots.txt (Rank Math/Yoast keeps the rest).
6. Install the **SRO API** plugin (`wp-plugin/sro-api.zip`, see its README) for login, payments and rank.
7. Cloudflare: cache everything for the static folders above (HTML 1-day edge TTL, `_next/static` 1 year);
   **bypass** cache for `/wp-json/sro/*`.
8. Rebuild automatically when a post is published (GitHub Actions or a Hostinger cron running `npm run build` every 30 min) —
   the homepage also refreshes the jobs/results board in the browser from `/wp-json/wp/v2/posts`, so visitors never see stale posts.

## Where things live

| Path | What |
| --- | --- |
| `lib/types.ts` | Data model (mirrors the production DB: exams, papers, questions, question_i18n) |
| `lib/langs.ts` | Language registry — 3 live (en, gu, hi), 9 ready (mr, bn, ta, te, kn, ml, pa, or, ur) |
| `lib/data.ts` | Queries, URL helpers, weightage, related questions |
| `lib/seo.ts` | Title formulas, Education Q&A (Quiz) schema, breadcrumbs, FAQ, ItemList |
| `data/*.ts` | Sample content imported from the live site (replace with the DB export) |
| `components/TestEngine.tsx` | Real exam mode (timer, palette, mark for review, result, solutions) |
| `components/Practice.tsx` | Instant-answer practice on server-rendered questions (~1 KB) |
| `scripts/make-preview.mjs` | Builds the shareable preview only; not used in production |

## Adding a language

1. Set its `status` to `'live'` in `lib/langs.ts`.
2. Add `text.<code>` (stem, options, quick, formula, detailed, tip) to each translated question.
3. Add the code to the paper's `languages`. No page or component changes.

## Next steps (see the blueprint doc)

- Replace `data/*.ts` with a build-time export from the WordPress question bank (`/wp-json/sro/v1/export`).
- SRO API plugin: login (Google/OTP), save attempts, shift-wise rank.
- Per-language URLs (`/gu/…`, `/hi/…`) with hreflang once translations are complete per paper.
- 301 redirects from old URLs (`/pyq/question/{slug}/` → `/question/{slug}/`, `/sro-pyq-draft/` → `/pyq/`).

## v2 notes (premium redesign)

- Design system: `app/globals.css` (tokens at the top), 3D icons in `public/i3d/` (Microsoft Fluent 3D, MIT licence), generated exam covers in `components/ExamCover.tsx`.
- Font: one preloaded Latin font (Plus Jakarta Sans, OFL). Gujarati/Hindi use the phone's built-in fonts — no extra download.
- New pages: `/jeet/` (SRO Jeet pricing), `/my/` (streak, history, bookmarks).
- Search index is a separate static file (`/search-index.json`) loaded only when the search box is used.
- Progress (streak, bookmarks, attempts) is stored on the device in `lib/local.ts`; the same shapes sync to the SRO API after sign-in.

## v3 notes

- Homepage `/` (`app/page.tsx`): quick actions, offer carousel, live Sarkari updates board (WordPress posts, Gujarat tab), exams, Jeet series, PYQs, daily practice, toppers (real data only), app install.
- One-tap checkout + sign-in (`components/AccountSheets.tsx`): any element with `data-checkout="jeet-yr"` or `data-login` opens it. UPI-first Razorpay Checkout; demo mode when `NEXT_PUBLIC_SRO_API` is not set.
- In-feed promos every 5 MCQs (`components/FeedPromo.tsx`) — hidden for Jeet members.
- Viral: `/daily-quiz/` (same 10 PYQs statewide per day, WhatsApp challenge), `/refer/` (3 friends = 1 month), referral code on every share link.
- Per-language question pages `/gu/question/…`, `/hi/question/…` with hreflang + localized titles and Quiz schema.
- Backend: `wp-plugin/sro-api` (PHP, linted) — OTP/Google login, Razorpay order/verify/webhook, server scoring, shift rank, leaderboard, referrals.

## v4 notes

- Plan renamed **SRO Jeet** (`/jeet/`, plan ids `jeet-*`, coupon `JEET50`). Rank, mocks, live tests and PDFs are features inside it.
- Language order everywhere: English → हिन्दी → ગુજરાતી (`orderLangs` in `lib/data.ts`). No Gujarat-only UI; the install-app prompt is removed.
- Practice section: `lib/taxonomy.ts` (subjects → chapters with 3D icons) + `lib/practice.ts`. Engineering (Electrical, Civil, Mechanical, Electronics, Computer), Reasoning, Maths, GK, Science, English, Hindi, Gujarati.
- Current affairs day-wise: add a day to `data/current-affairs.ts` → `/current-affairs/{yyyy-mm-dd}/` is generated; `/current-affairs/today/` always shows the latest.
- Mock test SEO: `/test-series/` and `/test-series/{exam}/` (free tests from real papers, Jeet test types, pattern, how-to, FAQs, Product + FAQ schema).
- Branded PDF: `PrintButton` (free after sign-in = lead capture) + `PrintBrand` (header, watermark, footer with site + Telegram on every page).

## v8 · mobile-first polish and full solutions in papers

- **Full solutions inside papers/chapters**: `app/sol/[id]/route.ts` writes `/sol/<question-id>.json` (≈1–2 KB each) at build time. `components/FullSolution.tsx` fetches it the first time a student opens “View answer & solution”. Cache `/sol/` like other static JSON (e.g. `Cache-Control: public, max-age=3600`).
- **Fonts**: Inter (`app/fonts/inter-latin.woff2`) for text/UI, Plus Jakarta Sans for headings. Noto Gujarati/Devanagari load only for elements with `lang="gu"`/`lang="hi"`.
- **No viewport prefetch**: `components/SmartLink.tsx` sets `prefetch={false}` (hover/touch prefetch still works).
- **Mobile rules**: see the “v8” blocks at the end of `app/globals.css` (single-column grids use `minmax(0, 1fr)`; `main { overflow-x: clip }` is a safety net).
- Serve the export with Brotli or gzip on — the long paper pages are ~2.5 MB raw but ~180 KB compressed.
