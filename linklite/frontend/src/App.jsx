import { Routes, Route, Link } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
export default function App() {
  return (
    <div className="p-4">
      <nav className="flex gap-4 border-b pb-2 mb-4">
        <Link className="underline" to="/">Dashboard</Link>
        <Link className="underline" to="/auth">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}
