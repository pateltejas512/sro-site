// Sarkari updates board. Server-rendered (every tab is in the HTML, so Google indexes all of it);
// UpdatesEnhancer adds tab switching, NEW badges and a live refresh from WordPress without shipping the data twice.
import I3D from './I3D';
import UpdatesEnhancer from './UpdatesEnhancer';
import { BOARDS, type Board, type Post } from '@/lib/wp';

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function Row({ p, k }: { p: Post; k?: string }) {
  return (
    <li>
      <a href={p.u}>
        <span className="upd-t">{p.t}</span>
        <span className="upd-m">{k && <span className="chip">{k}</span>}<time dateTime={p.d}>{fmt(p.d)}</time></span>
      </a>
    </li>
  );
}

export default function LiveUpdates({ initial: board }: { initial: Board; asOf?: string }) {
  const tabs = BOARDS.map(({ key, label, i3d }) => ({ key, label, i3d }));
  return (
    <div className="card updates" id="sro-updates">
      <div className="upd-tabs" role="tablist" aria-label="Sarkari updates">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} data-tab={t.key} aria-selected={t.key === 'jobs'} aria-controls={`pan-${t.key}`}>
            <I3D name={t.i3d} size={20} /> {t.label}
          </button>
        ))}
      </div>
      {BOARDS.map((b) => (
        <div key={b.key} role="tabpanel" id={`pan-${b.key}`} aria-labelledby={`tab-${b.key}`} hidden={b.key !== 'jobs'}>
          <ul className="upd-list" data-board={b.key} data-cat={b.cat}>{board[b.key].map((p) => <Row key={p.u} p={p} />)}</ul>
          <a className="upd-more" href={`/category/${b.slug}/`}>All {b.label.toLowerCase()} →</a>
        </div>
      ))}
      <UpdatesEnhancer />
    </div>
  );
}
