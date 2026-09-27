import { useEffect, useState } from 'react';
import { API, headers } from '../api';
export default function Bookings() {
  const [list, setList] = useState([]);
  const [equip, setEquip] = useState([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => {
    fetch(`${API}/api/bookings`, { headers: headers() }).then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/api/equipment`, { headers: headers() }).then(r => r.json()).then(setEquip).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  async function create() {
    const r = await fetch(`${API}/api/bookings`, { method: 'POST', headers: headers(), body: JSON.stringify({ equipmentId, startTime: start, endTime: end }) }).then(r => r.json());
    setMsg(JSON.stringify(r).slice(0, 200)); load();
  }
  async function cancel(id) {
    await fetch(`${API}/api/bookings/${id}/cancel`, { method: 'PUT', headers: headers() });
    load();
  }
  return (
    <div>
      <h2 className="font-bold">Bookings</h2>
      <select className="border p-1 m-1" value={equipmentId} onChange={e => setEquipmentId(e.target.value)}>
        <option value="">equipment...</option>
        {equip.map(e => <option key={e.id} value={e.id}>{e.name} ({e.status})</option>)}
      </select>
      <input className="border p-1 m-1" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
      <input className="border p-1 m-1" type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
      <button className="border px-2" onClick={create}>Book</button>
      <pre>{msg}</pre>
      <ul>{list.map(b => (
        <li key={b.id} className="border m-1 p-1">
          {b.equipment?.name} | {b.user?.username} | {b.startTime} → {b.endTime} - <b>{b.status}</b>
          {b.status === 'BOOKED' && <button className="border px-2 m-1" onClick={() => cancel(b.id)}>Cancel</button>}
        </li>
      ))}</ul>
    </div>
  );
}
