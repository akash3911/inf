import { useState } from 'react';
import { API } from '../api';
export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  async function submit(mode) {
    const r = await fetch(`${API}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }).then(r => r.json());
    if (r.token) { localStorage.setItem('token', r.token); localStorage.setItem('role', r.role); setMsg('ok: ' + r.username + ' (' + r.role + ')'); }
    else setMsg(JSON.stringify(r));
  }
  return (
    <div>
      <h2 className="font-bold">Login / Register</h2>
      <p className="text-sm">Seeded: admin/admin123 (ADMIN), staff/staff123 (STAFF)</p>
      <input className="border p-1 m-1" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-1 m-1" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="border px-2 m-1" onClick={() => submit('login')}>Login</button>
      <button className="border px-2 m-1" onClick={() => submit('register')}>Register</button>
      <pre>{msg}</pre>
    </div>
  );
}
