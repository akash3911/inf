import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';

export default function App() {
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  return (
    <div className="p-4">
      <nav className="flex gap-4 border-b pb-2 mb-4">
        <Link className="underline" to="/">Problems</Link>
        <Link className="underline" to="/submissions">Submissions</Link>
        <Link className="underline" to="/auth">Login</Link>
        {token && <button className="border px-2" onClick={() => { localStorage.removeItem('token'); nav('/auth'); }}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/" element={<Problems />} />
        <Route path="/problem/:slug" element={<ProblemDetail />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}
