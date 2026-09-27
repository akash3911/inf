import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(null);
  useEffect(() => {
    api('/api/problems').then(d => setProblems(d.problems || []));
    if (localStorage.getItem('token')) api('/api/progress').then(setProgress).catch(() => {});
  }, []);
  return (
    <div>
      <h2 className="font-bold">Problems</h2>
      {progress && <p>Solved {progress.solved}/{progress.total} (attempted {progress.attempted})</p>}
      <ul>
        {problems.map(p => (
          <li key={p.slug} className="border m-2 p-2">
            <Link className="underline" to={`/problem/${p.slug}`}>{p.title}</Link>
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
