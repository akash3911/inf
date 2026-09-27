import { useState } from 'react';
import { API } from '../api';
export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  async function submit(mode) {
    const r = await fetch(`${API}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }).then(r => r.json());
    if (r.token) { localStorage.setItem('token', r.token); setStatus({ ok: true, text: 'Logged in as ' + r.user.username }); }
    else setStatus({ ok: false, text: r.message || 'Failed' });
  }
  return (
    <div>
      <h2 className="font-bold">Login / Register</h2>
      <input className="border p-1 m-1" placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-1 m-1" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="border px-2 m-1" onClick={() => submit('login')}>Login</button>
      <button className="border px-2 m-1" onClick={() => submit('register')}>Register</button>
      {status && <p className={status.ok ? 'text-green-700' : 'text-red-700'}>{status.text}</p>}
    </div>
  );
}
