import { useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ANGLE_LABELS = { pt: 'Proximal Thoracic (PT)', mt: 'Main Thoracic (MT)', tl: 'Thoracolumbar (TL)' };

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState({ w: 1000, h: 1000 });

  function onFile(e) {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    const r = await fetch(`${API}/v1/getprediction`, { method: 'POST', body: fd }).then(r => r.json());
    setResult(r);
    setLoading(false);
  }

  const dets = result?.detections || [];
  const lines = result?.midpoint_lines || [];
  const angles = result?.angles;
  const angleEntries = angles && !Array.isArray(angles)
    ? Object.entries(angles)
    : (angles || []).map((a, i) => [`curve-${i + 1}`, typeof a === 'number' ? { angle: a, idxs: [] } : a]);

  return (
    <div className="p-4">
      <h1 className="font-bold">Scoliotect - Cobb Angle</h1>
      <input type="file" accept="image/*" onChange={onFile} />
      <button className="border px-2 m-2" onClick={upload}>{loading ? 'Measuring...' : 'Measure'}</button>

      {preview && (
        <div className="relative inline-block border" style={{ maxWidth: 500 }}>
          <img src={preview} style={{ maxWidth: 500, display: 'block' }} onLoad={e => setSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })} />
          <svg viewBox={`0 0 ${size.w} ${size.h}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {dets.map((d, i) => (
              <rect key={i} x={d.xmin} y={d.ymin} width={d.xmax - d.xmin} height={d.ymax - d.ymin} fill="none" stroke="red" strokeWidth={Math.max(2, size.w / 300)} />
            ))}
            {lines.map((l, i) => (
              <line key={'l' + i} x1={l[0][0]} y1={l[0][1]} x2={l[1][0]} y2={l[1][1]} stroke="lime" strokeWidth={Math.max(2, size.w / 300)} />
            ))}
          </svg>
        </div>
      )}

      {result && (
        <div className="border p-2 mt-2" style={{ maxWidth: 500 }}>
          <h2 className="font-bold">Result</h2>
          <p>File: {file?.name}</p>
          <p>Curve type: <b>{result.curve_type === 'S' ? 'S-curve' : result.curve_type === 'C' ? 'C-curve' : 'n/a'}</b></p>
          <p>Vertebrae detected: <b>{dets.length}</b></p>

          <h3 className="font-bold mt-2">Cobb angles</h3>
          {angleEntries.length === 0 && <p>No angles computed (need 2+ vertebrae).</p>}
          <ul>
            {angleEntries.map(([key, a]) => (
              <li key={key} className="border m-1 p-1">
                <b>{ANGLE_LABELS[key] || key}:</b> {Number(a.angle).toFixed(1)}°
                {a.idxs?.length > 0 && <span> (vertebrae {a.idxs.join(' – ')})</span>}
              </li>
            ))}
          </ul>

          <h3 className="font-bold mt-2">Detections</h3>
          <table className="border-collapse">
            <thead><tr><th className="border px-2">#</th><th className="border px-2">Label</th><th className="border px-2">Confidence</th></tr></thead>
            <tbody>
              {dets.map((d, i) => (
                <tr key={i}>
                  <td className="border px-2">{i + 1}</td>
                  <td className="border px-2">{d.name || d.class}</td>
                  <td className="border px-2">{(d.confidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1">Midpoint lines drawn: {lines.length}</p>
        </div>
      )}
      <p className="mt-2 text-sm">Red boxes = vertebrae, green lines = midpoints. Angles from YOLOv8 (best.pt) + cobb_angle_cal.</p>
    </div>
  );
}
