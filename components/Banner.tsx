'use client';
// Auto-advancing promo carousel (CSS scroll-snap; JS only moves it and paints the dots).
import { useEffect, useRef, useState } from 'react';

export default function Banner({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current!;
    const onScroll = () => setI(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    const stop = () => { paused.current = true; };
    el.addEventListener('pointerdown', stop); el.addEventListener('focusin', stop);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = reduce ? 0 : window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const n = (Math.round(el.scrollLeft / el.clientWidth) + 1) % count;
      el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
    }, 5000);
    return () => { el.removeEventListener('scroll', onScroll); clearInterval(t); };
  }, [count]);

  return (
    <div className="banner">
      <div className="banner-track" ref={ref} aria-roledescription="carousel">{children}</div>
      <div className="banner-dots" aria-hidden="true">
        {Array.from({ length: count }, (_, n) => (
          <button key={n} type="button" tabIndex={-1} className={n === i ? 'on' : ''} onClick={() => { paused.current = true; ref.current?.scrollTo({ left: n * ref.current.clientWidth, behavior: 'smooth' }); }} />
        ))}
      </div>
    </div>
  );
}
