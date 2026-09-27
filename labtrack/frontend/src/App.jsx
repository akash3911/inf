import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Equipment from './pages/Equipment';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import { role } from './api';

export default function App() {
  const nav = useNavigate();
  const r = role();
  return (
    <div className="p-4">
      <nav className="flex gap-4 border-b pb-2 mb-4">
        <Link className="underline" to="/">Equipment</Link>
        <Link className="underline" to="/bookings">Bookings</Link>
        <Link className="underline" to="/maintenance">Maintenance</Link>
        {(r === 'ADMIN' || r === 'STAFF') && <Link className="underline" to="/analytics">Analytics</Link>}
        {r === 'ADMIN' && <Link className="underline" to="/users">Users</Link>}
        <Link className="underline" to="/auth">Login</Link>
        {localStorage.getItem('token') && <span>({r}) <button className="border px-2" onClick={() => { localStorage.clear(); nav('/auth'); }}>Logout</button></span>}
      </nav>
      <Routes>
        <Route path="/" element={<Equipment />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/users" element={<Users />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}
