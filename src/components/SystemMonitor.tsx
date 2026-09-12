import { useEffect, useRef, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
interface Snapshot {
  generatedAt: string;
  checks: Array<{ id:string; label:string; status:string; detail:string }>;
  storage: { databaseTableBytes:number|null; lessonJsonBytes:number|null; lessons:number|null; scope:string };
}
const labels: Record<string,string> = { healthy:'Verified', unavailable:'Unavailable', configured:'Configured · not tested', 'not-configured':'Setup required', 'not-tested':'Not tested' };
function size(bytes:number|null) { return bytes === null ? 'Not measured' : `${(bytes / 1e9).toFixed(4)} GB`; }
export default function SystemMonitor() {
  const [data,setData] = useState<Snapshot|null>(null);
  const [error,setError] = useState(''); const [loading,setLoading] = useState(false); const [refresh,setRefresh] = useState(0);
  const request = useRef<AbortController|null>(null);
  useEffect(() => {
    const controller = new AbortController(); request.current = controller;
    const timer = setTimeout(() => controller.abort(),9000); setLoading(true); setError(''); setData(null);
    fetch(`${API_PREFIX}/admin/system-monitor`, { credentials:'include', cache:'no-store', signal:controller.signal })
      .then(async response => { const json = await response.json(); if (!response.ok || !json.success || !Array.isArray(json.checks)) throw new Error('Health checks could not be loaded.'); return json as Snapshot; })
      .then(json => { if (!controller.signal.aborted) setData(json); })
      .catch(() => { if (request.current === controller) setError('No live result available. Retry the checks; no healthy status is assumed.'); })
      .finally(() => { clearTimeout(timer); if (request.current === controller) setLoading(false); });
    return () => { request.current = null; clearTimeout(timer); controller.abort(); };
  },[refresh]);
  return <section className="sf-panel" aria-label="Site monitoring">
    <div className="flex items-center justify-between flex-wrap gap-3"><h2 className="font-black text-xl flex items-center gap-2"><Activity />Site monitoring</h2>
      <button type="button" className="sf-primary" disabled={loading} onClick={() => setRefresh(value => value+1)}><RefreshCw size={18} />{loading ? 'Checking…':'Run checks'}</button></div>
    {error && <p role="alert" className="mt-3">{error}</p>}
    {data && <><p className="mt-3 text-sm">Checked {new Date(data.generatedAt).toLocaleString('en-GB')}. A configuration check is not a successful end-to-end test.</p>
      <div className="sf-monitor-grid">{data.checks.map(check => <article className="sf-monitor-check" key={check.id}>
        <strong>{check.label}</strong><span>{labels[check.status] || 'Unknown'}</span><small>{check.detail}</small>
      </article>)}</div>
      <h3 className="font-black">Cloud storage measurements</h3>
      <p>Database tables and indexes: {size(data.storage.databaseTableBytes)}</p><p>Active lesson JSON: {size(data.storage.lessonJsonBytes)}</p>
      <p className="text-sm mt-2">{data.storage.scope}</p></>}
    <p className="mt-4 text-sm">797 integration is read-only and disabled until a separate server token is configured. No child conversations, images or credentials are returned.</p>
  </section>;
}
