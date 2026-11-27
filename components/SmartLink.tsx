import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/** next/link in production; a plain <a> in the shareable static preview (no client router there). */
export default function Link(props: ComponentProps<typeof NextLink>) {
  if (process.env.NEXT_PUBLIC_PREVIEW === '1') {
    const { href, prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, ...rest } = props as ComponentProps<typeof NextLink> & Record<string, unknown>;
    void prefetch; void replace; void scroll; void shallow; void passHref; void legacyBehavior; void locale;
    return <a href={typeof href === 'string' ? href : String(href)} {...(rest as object)} />;
  }
  // No viewport prefetch: on a phone it downloaded every linked page's data (≈1–2 MB on a question page).
  // Next still prefetches on hover/touch-start, so taps stay instant.
  return <NextLink prefetch={false} {...props} />;
}
