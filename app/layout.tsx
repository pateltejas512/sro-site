import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header, BottomNav, Footer } from '@/components/Header';
import NavHighlighter from '@/components/NavHighlighter';
import AccountHost from '@/components/Account';
import JsonLd from '@/components/JsonLd';
import { SITE } from '@/lib/data';
import { graph, orgLd } from '@/lib/seo';

// Two self-hosted Latin variable fonts, both preloaded: Inter for reading text and UI (≈48 KB, built for small screens),
// Plus Jakarta Sans for headings and numbers that carry the brand (≈28 KB). Gujarati/Hindi use self-hosted Noto Sans
// (globals.css), fetched only on pages with that script.
const inter = localFont({ src: './fonts/inter-latin.woff2', weight: '100 900', display: 'swap', variable: '--font-inter', preload: true, fallback: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'], adjustFontFallback: 'Arial' });
const jakarta = localFont({ src: './fonts/jakarta-latin.woff2', weight: '200 800', display: 'swap', variable: '--font-jakarta', preload: true, fallback: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'], adjustFontFallback: 'Arial' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Previous Year Question Papers with Solutions – SarkariResultOut', template: '%s | SRO' },
  description: 'Solved previous year question papers, mock tests with All-India rank, chapter-wise MCQs and daily current affairs for every government exam, in English, Hindi and Gujarati.',
  applicationName: SITE.name,
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: 'SRO', statusBarStyle: 'black-translucent' },
  verification: { google: '4iduGzGWjSWU_cB8YaAxH1W7fUqe3MbA6Lt8iz052rs' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1015' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Saved theme before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('sro:theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <BottomNav />
        <NavHighlighter />
        <AccountHost />
        <JsonLd data={graph(orgLd(), { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: SITE.url, name: SITE.name, potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/pyq/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } })} />
      </body>
    </html>
  );
}
