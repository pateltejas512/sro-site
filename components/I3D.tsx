/** Prefix for static assets: '' in production, the relative base inside the shareable preview. */
export const asset = (p: string) => {
  const base = typeof window !== 'undefined' ? (window as unknown as { __SRO_BASE?: string }).__SRO_BASE : undefined;
  return base ? base + p.slice(1) : p;
};

/** 3D illustration icon (Microsoft Fluent 3D, MIT licence), self-hosted as 128px WebP (~3 KB each). */
export default function I3D({ name, size = 40, alt = '', eager = false, lg = false, className = '' }: { name: string; size?: number; alt?: string; eager?: boolean; lg?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(`/i3d/${name}${lg ? '-lg' : ''}.webp`)}
      width={size}
      height={size}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...(eager && lg ? { fetchPriority: 'high' as const } : {})}
      className={`i3d ${className}`}
    />
  );
}
