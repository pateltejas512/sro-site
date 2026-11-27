import Breadcrumbs from '@/components/Breadcrumbs';
import I3D from '@/components/I3D';
import Revision from '@/components/Revision';
import { meta } from '@/lib/seo';

export const metadata = meta({ title: 'My Revision – Mistakes that come back until you master them', description: 'Every question you get wrong is saved and brought back after 1, 3, 7, 15 and 30 days until you answer it right. Free on SarkariResultOut.', path: '/revise/', noindex: true });

export default function RevisePage() {
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'My Revision', path: '/revise/' }]} />
      <header className="phead">
        <div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <div>
            <span className="chip gold" style={{ marginBottom: 10 }}>Spaced repetition · free</span>
            <h1>My Revision</h1>
            <p>Every question you get wrong comes back after 1, 3, 7, 15 and 30 days. Answer it right five times and it is mastered — the same method toppers use with flash cards.</p>
          </div>
          <I3D name="repeat" size={110} className="side-art" />
        </div>
      </header>
      <Revision />
    </div>
  );
}
