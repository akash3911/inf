import { useState } from 'react';
import { API, headers } from '../api';
export default function Analytics() {
  const [rows, setRows] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  async function load() {
    const r = await fetch(`${API}/api/analytics/utilization?from=${from}:00&to=${to}:00`, { headers: headers() }).then(r => r.json());
    setRows(Array.isArray(r) ? r : []);
  }
  return (
    <div>
      <h2 className="font-bold">Utilization Analytics (STAFF/ADMIN)</h2>
      <input className="border p-1 m-1" type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} />
      <input className="border p-1 m-1" type="datetime-local" value={to} onChange={e => setTo(e.target.value)} />
      <button className="border px-2" onClick={load}>Load</button>
      <ul>{rows.map(r => (
        <li key={r.equipmentId} className="border m-1 p-1">
          {r.equipmentName}: {r.bookingCount} bookings, {r.bookedHours}h — <b>{r.utilizationPct}%</b>
        </li>
      ))}</ul>
    </div>
  );
}
