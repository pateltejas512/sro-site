import I3D from './I3D';
import type { Exam } from '@/lib/types';

/** Generated cover art for an exam / paper — no image files, crisp at any size. */
export default function ExamCover({ exam, tag, sub, size }: { exam: Exam; tag?: string; sub?: string; size?: number }) {
  const c = exam.cover;
  return (
    <div className={`cover c-${exam.category}`} style={size ? { width: size } : undefined} aria-hidden="true">
      <span className="t1">{c.t1}</span>
      <span className="t2">{c.t2}</span>
      <span className="t3">{sub ?? c.t3}</span>
      {tag && <span className="tag">{tag}</span>}
      {exam.iconUrl ? <img src={exam.iconUrl} width={30} height={30} alt="" loading="lazy" style={{ objectFit: 'contain' }} /> : <I3D name={c.icon} size={30} />}
    </div>
  );
}
