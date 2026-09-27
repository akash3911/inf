export const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const headers = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};
export const role = () => localStorage.getItem('role') || '';
