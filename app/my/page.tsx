import Breadcrumbs from '@/components/Breadcrumbs';
import MyDashboard from '@/components/MyDashboard';
import MyAccount from '@/components/MyAccount';
import I3D from '@/components/I3D';
import { meta } from '@/lib/seo';

export const metadata = meta({ title: 'My Account', description: 'Your purchases, SRO Jeet, streak, test history and bookmarked questions.', path: '/my/', noindex: true });

export default function MyPage() {
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'My Account', path: '/my/' }]} />
      <header className="phead"><div className="phead-in" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}><div><h1>My Account</h1><p>Your purchases, SRO Jeet and progress in one place.</p></div><I3D name="studentf" lg size={130} className="side-art" /></div></header>
      <div className="section"><MyAccount /></div>
      <div className="section"><h2 className="row" style={{ gap: 8 }}><I3D name="chart" size={28} /> My progress</h2><MyDashboard /></div>
    </div>
  );
}
