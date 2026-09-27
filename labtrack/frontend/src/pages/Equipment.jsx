import { useEffect, useState } from 'react';
import { API, headers, role } from '../api';
export default function Equipment() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const load = () => fetch(`${API}/api/equipment`, { headers: headers() }).then(r => r.json()).then(setList).catch(() => {});
  useEffect(() => { load(); }, []);
  async function create() {
    await fetch(`${API}/api/equipment`, { method: 'POST', headers: headers(), body: JSON.stringify({ name, category, location, status: 'AVAILABLE' }) });
    setName(''); setCategory(''); setLocation(''); load();
  }
  async function setStatus(id, status) {
    await fetch(`${API}/api/equipment/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) });
    load();
  }
  const canManage = role() === 'ADMIN' || role() === 'STAFF';
  return (
    <div>
      <h2 className="font-bold">Equipment</h2>
      {canManage && (
        <div>
          <input className="border p-1 m-1" placeholder="name" value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-1 m-1" placeholder="category" value={category} onChange={e => setCategory(e.target.value)} />
          <input className="border p-1 m-1" placeholder="location" value={location} onChange={e => setLocation(e.target.value)} />
          <button className="border px-2" onClick={create}>Add</button>
        </div>
      )}
      <ul>{list.map(e => (
        <li key={e.id} className="border m-2 p-2">
          {e.name} ({e.category}) - {e.location} - <b>{e.status}</b>
          {canManage && (
            <span>
              <button className="border px-2 m-1" onClick={() => setStatus(e.id, 'AVAILABLE')}>Available</button>
              <button className="border px-2 m-1" onClick={() => setStatus(e.id, 'UNDER_MAINTENANCE')}>Maintenance</button>
            </span>
          )}
        </li>
      ))}</ul>
    </div>
  );
}
