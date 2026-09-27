import { useEffect, useState } from 'react';
import { api } from '../api';
export default function Submissions() {
  const [list, setList] = useState([]);
  useEffect(() => { api('/api/submissions').then(d => setList(d.submissions || [])); }, []);
  return (
    <div>
      <h2 className="font-bold">My Submissions</h2>
      <ul>{list.map(s => (
        <li key={s.id} className="border m-1 p-1">{s.slug} - {s.status} - {s.language} - {new Date(s.created_at).toLocaleString()}</li>
      ))}</ul>
    </div>
  );
}
