import { useEffect, useState } from 'react';
import { API, headers, role } from '../api';
export default function Maintenance() {
  const [list, setList] = useState([]);
  const [equip, setEquip] = useState([]);
  const [equipmentId, setEquipmentId] = useState('');
  const [description, setDescription] = useState('');
  const load = () => {
    fetch(`${API}/api/maintenance`, { headers: headers() }).then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/api/equipment`, { headers: headers() }).then(r => r.json()).then(setEquip).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  async function report() {
    await fetch(`${API}/api/maintenance`, { method: 'POST', headers: headers(), body: JSON.stringify({ equipmentId, description }) });
    setDescription(''); load();
  }
  async function setStatus(id, status) {
    await fetch(`${API}/api/maintenance/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) });
    load();
  }
  const canTrack = role() === 'ADMIN' || role() === 'STAFF';
  return (
    <div>
      <h2 className="font-bold">Maintenance</h2>
      <select className="border p-1 m-1" value={equipmentId} onChange={e => setEquipmentId(e.target.value)}>
        <option value="">equipment...</option>
        {equip.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
      <input className="border p-1 m-1" placeholder="issue description" value={description} onChange={e => setDescription(e.target.value)} />
      <button className="border px-2" onClick={report}>Report</button>
      <ul>{list.map(m => (
        <li key={m.id} className="border m-1 p-1">
          {m.equipment?.name} | by {m.reportedBy} | {m.description} - <b>{m.status}</b>
          {canTrack && (
            <span>
              <button className="border px-2 m-1" onClick={() => setStatus(m.id, 'IN_PROGRESS')}>Start</button>
              <button className="border px-2 m-1" onClick={() => setStatus(m.id, 'RESOLVED')}>Resolve</button>
            </span>
          )}
        </li>
      ))}</ul>
    </div>
  );
}
