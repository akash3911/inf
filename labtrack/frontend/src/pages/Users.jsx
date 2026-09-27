import { useEffect, useState } from 'react';
import { API, headers } from '../api';
export default function Users() {
  const [list, setList] = useState([]);
  const load = () => fetch(`${API}/api/users`, { headers: headers() }).then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {});
  useEffect(() => { load(); }, []);
  async function setRole(id, role) {
    await fetch(`${API}/api/users/${id}/role`, { method: 'PUT', headers: headers(), body: JSON.stringify({ role }) });
    load();
  }
  return (
    <div>
      <h2 className="font-bold">Users (ADMIN only)</h2>
      <ul>{list.map(u => (
        <li key={u.id} className="border m-1 p-1">
          {u.username} - <b>{u.role}</b>
          <button className="border px-2 m-1" onClick={() => setRole(u.id, 'ADMIN')}>ADMIN</button>
          <button className="border px-2 m-1" onClick={() => setRole(u.id, 'STAFF')}>STAFF</button>
          <button className="border px-2 m-1" onClick={() => setRole(u.id, 'USER')}>USER</button>
        </li>
      ))}</ul>
    </div>
  );
}
