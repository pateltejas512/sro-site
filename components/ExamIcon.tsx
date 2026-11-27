import I3D, { asset } from './I3D';

/** Exam icon: the image uploaded in SRO Studio when there is one, otherwise the exam's 3D icon. */
export default function ExamIcon({ exam, size = 40, lg = false, className = '' }: { exam: { i3d: string; iconUrl?: string; short?: string }; size?: number; lg?: boolean; className?: string }) {
  if (exam.iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={exam.iconUrl.startsWith('/') ? asset(exam.iconUrl) : exam.iconUrl} width={size} height={size} alt="" loading="lazy" decoding="async" className={`i3d exam-icon ${className}`} style={{ objectFit: 'contain' }} />;
  }
  return <I3D name={exam.i3d} size={size} lg={lg} className={className} />;
}
