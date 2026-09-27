import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API, api } from '../api';
export default function ProblemDetail() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [runOut, setRunOut] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    api(`/api/problems/${slug}`).then(d => { setProblem(d.problem); setCode(d.problem?.starter_code || ''); });
    if (localStorage.getItem('token')) loadSubs();
  }, [slug]);
  function loadSubs() {
    api(`/api/submissions?slug=${slug}`).then(d => setSubs(d.submissions || [])).catch(() => {});
  }
  if (!problem) return <p>loading...</p>;
  async function run() {
    const r = await fetch(`${API}/api/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: 'python', code, stdin }) }).then(r => r.json());
    setRunOut(r);
    setVerdict(null);
  }
  async function submit() {
    const r = await fetch(`${API}/api/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') }, body: JSON.stringify({ slug, language: 'python', code }) }).then(r => r.json());
    setVerdict(r);
    setRunOut(null);
    loadSubs();
  }
  return (
    <div>
      <h2 className="font-bold">{problem.title}</h2>
      <p>{problem.description}</p>
      <textarea className="border w-full h-40 p-2 font-mono" value={code} onChange={e => setCode(e.target.value)} />
      <div>
        <input className="border p-1 m-1" placeholder="stdin" value={stdin} onChange={e => setStdin(e.target.value)} />
        <button className="border px-2 m-1" onClick={run}>Run (Piston)</button>
        <button className="border px-2 m-1" onClick={submit}>Submit</button>
      </div>

      {runOut && (
        <div className="border p-2 mt-2">
          <h3 className="font-bold">Output</h3>
          <pre className="whitespace-pre-wrap">{runOut.stdout || '(no stdout)'}</pre>
          {runOut.stderr && (<><h3 className="font-bold">Errors</h3><pre className="whitespace-pre-wrap">{runOut.stderr}</pre></>)}
          {runOut.message && <p>Error: {runOut.message}</p>}
        </div>
      )}

      {verdict && verdict.results && (
        <div className="border p-2 mt-2">
          <h3 className="font-bold">Verdict: {verdict.status}</h3>
          <table className="border-collapse">
            <thead><tr><th className="border px-2">#</th><th className="border px-2">Input</th><th className="border px-2">Expected</th><th className="border px-2">Actual</th><th className="border px-2">Pass</th></tr></thead>
            <tbody>
              {verdict.results.map((t, i) => (
                <tr key={i}>
                  <td className="border px-2">{i + 1}</td>
                  <td className="border px-2"><pre>{t.stdin}</pre></td>
                  <td className="border px-2"><pre>{t.expected}</pre></td>
                  <td className="border px-2"><pre>{t.actual}</pre></td>
                  <td className="border px-2">{t.passed ? '✓' : '✗'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {verdict && verdict.message && <p>Error: {verdict.message}</p>}

      <h3 className="font-bold mt-2">My submissions for this problem</h3>
      <ul>{subs.map(s => (
        <li key={s.id} className="border m-1 p-1">{s.status} - {s.language} - {new Date(s.created_at).toLocaleString()}</li>
      ))}</ul>
    </div>
  );
}
