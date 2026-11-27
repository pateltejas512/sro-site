import Link from '@/components/SmartLink';
export default function NotFound() {
  return (<div className="wrap empty"><h1>Page not found</h1><p>This paper or question may have moved.</p><Link className="btn btn-primary" href="/pyq/">Browse all previous papers</Link></div>);
}
