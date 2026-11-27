import { notFound } from 'next/navigation';
import MockRunner from '@/components/MockRunner';
import type { TPaper } from '@/components/TestEngine';
import { mocks, getExam, getMock, questionsForMock, mockUrl, mockSize, orderLangs } from '@/lib/data';
import { toTQ } from '@/lib/tpaper';
import { planById } from '@/lib/plans';
import { meta } from '@/lib/seo';

export const dynamicParams = false;
// A static export needs at least one path: before the first mock is published this renders a 404 at /test-series/_/_/.
export function generateStaticParams() { return mocks.length ? mocks.map((p) => ({ exam: p.examSlug, mock: p.slug })) : [{ exam: '_', mock: '_' }]; }
export function generateMetadata({ params }: { params: { exam: string; mock: string } }) {
  const p = getMock(params.exam, params.mock);
  if (!p) return {};
  // App screen: kept out of the index so Google ranks the mock test page itself.
  return meta({ title: `${p.title} – Start Test`, description: `Attempt ${p.title} online in the real exam screen.`, path: `${mockUrl(p)}test/`, noindex: true });
}

export default function MockTestPage({ params }: { params: { exam: string; mock: string } }) {
  const p = getMock(params.exam, params.mock);
  if (!p) notFound();
  const e = getExam(p.examSlug)!;
  const qs = questionsForMock(p); // premium: only the free questions Studio exports (usually none)
  const total = mockSize(p);
  const perQ = p.minutes && (p.totalQuestions || total) ? (p.minutes * 60) / (p.totalQuestions || total) : 60;
  const data: TPaper = {
    key: `mock/${p.examSlug}/${p.slug}`,
    title: p.title,
    examShort: e.short,
    paperUrl: mockUrl(p),
    backLabel: 'Back to the test page',
    tag: 'MOCK',
    seconds: Math.round(perQ * qs.length),
    negative: p.negative ?? 0,
    langs: orderLangs(p.languages),
    cover: { t1: e.cover.t1, t2: e.cover.t2, t3: p.shortTitle.slice(0, 18), cls: `c-${e.category}` },
    questions: qs.map((q) => toTQ(q, false)),
  };
  return <MockRunner paper={data} premium={!!p.premium} exam={p.examSlug} slug={p.slug} total={total} perQ={perQ} price={planById('jeet-exam')?.price ?? 149} testPrice={p.price ?? 0} />;
}
