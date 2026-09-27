export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}
export async function api(path, opts = {}) {
  const res = await fetch(API + path, { ...opts, headers: { ...authHeaders(), ...(opts.headers || {}) } });
  return res.json();
}
