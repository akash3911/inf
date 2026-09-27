import { useEffect, useState } from 'react';
import { API, headers } from '../api';
export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  async function load() {
    const r = await fetch(`${API}/api/links`, { headers: headers() }).then(r => r.json());
    setLinks(r.links || []);
  }
  useEffect(() => { load(); }, []);
  async function create() {
    await fetch(`${API}/api/links`, { method: 'POST', headers: headers(), body: JSON.stringify({ long_url: url }) });
    setUrl(''); load();
  }
  async function del(id) {
    await fetch(`${API}/api/links/${id}`, { method: 'DELETE', headers: headers() });
    load();
  }
  async function showStats(id) {
    const r = await fetch(`${API}/api/links/${id}/stats`, { headers: headers() }).then(r => r.json());
    setStats(r);
  }
  return (
    <div>
      <h2 className="font-bold">LinkLite Dashboard</h2>
      <input className="border p-1 m-1 w-80" placeholder="https://example.com/long" value={url} onChange={e => setUrl(e.target.value)} />
      <button className="border px-2" onClick={create}>Shorten</button>
      <ul>
        {links.map(l => (
          <li key={l.id} className="border m-2 p-2">
            <p>{l.long_url}</p>
            <p><a className="underline" href={`${API}/${l.short_code}`} target="_blank" rel="noreferrer">{API}/{l.short_code}</a> - clicks: {l.clicks}</p>
            <button className="border px-2 m-1" onClick={() => showStats(l.id)}>Stats</button>
            <button className="border px-2 m-1" onClick={() => del(l.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {stats && (
        <div className="border p-2">
          <h3 className="font-bold">Stats for /{stats.link?.short_code}</h3>
          <p>Target: {stats.link?.long_url}</p>
          <p>Total clicks: <b>{stats.total}</b></p>
          <table className="border-collapse mt-1">
            <thead><tr><th className="border px-2">Date</th><th className="border px-2">Clicks</th></tr></thead>
            <tbody>
              {stats.daily.map(d => (
                <tr key={d.day}><td className="border px-2">{d.day}</td><td className="border px-2">{d.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
