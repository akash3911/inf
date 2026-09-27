const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDb } = require('./db');
const { seed } = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const PISTON_API = process.env.PISTON_API || 'https://emkc.org/api/v2/piston/execute';
const PISTON_KEY = process.env.PISTON_KEY || '';
const PISTON_BASE = PISTON_API.replace(/\/execute\/?$/, ''); // works for public (/api/v2/piston) and self-hosted (/api/v2)

// --- piston: isolated execution ---
async function pistonRun(language, code, stdin = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (PISTON_KEY) headers.Authorization = PISTON_KEY;
  const res = await fetch(PISTON_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({ language, version: '*', files: [{ content: code }], stdin })
  });
  if (!res.ok) throw new Error('piston HTTP ' + res.status);
  const data = await res.json();
  if (!data.run) throw new Error('piston error: ' + (data.message || 'no run result'));
  return {
    stdout: data.run.stdout || '',
    stderr: data.run.stderr || '',
    output: data.run.output || ''
  };
}

// background: make sure the python runtime is installed (self-hosted piston starts empty)
async function ensurePistonRuntime() {
  for (let i = 1; i <= 60; i++) {
    try {
      const rt = await fetch(PISTON_BASE + '/runtimes').then(r => r.json());
      if (Array.isArray(rt) && rt.some(r => r.language === 'python')) {
        console.log('piston python runtime ready');
        return;
      }
      console.log(`installing piston python runtime (attempt ${i}/60)...`);
      await fetch(PISTON_BASE + '/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'python', version: '3.x' })
      });
    } catch (e) {
      console.log(`piston not reachable yet (${i}/60): ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}
void ensurePistonRuntime();

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }
}

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// --- auth ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'username+password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query('INSERT INTO users (username,password_hash) VALUES ($1,$2) RETURNING id,username', [username, hash]);
    const token = jwt.sign({ id: r.rows[0].id, username }, JWT_SECRET);
    res.json({ token, user: r.rows[0] });
  } catch (e) { res.status(400).json({ message: 'username taken' }); }
});
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  if (!r.rows[0]) return res.status(400).json({ message: 'invalid credentials' });
  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if (!ok) return res.status(400).json({ message: 'invalid credentials' });
  const token = jwt.sign({ id: r.rows[0].id, username }, JWT_SECRET);
  res.json({ token, user: { id: r.rows[0].id, username } });
});

// --- problems ---
app.get('/api/problems', async (req, res) => {
  const r = await pool.query('SELECT slug,title,description FROM problems ORDER BY id');
  res.json({ problems: r.rows });
});
app.get('/api/problems/:slug', async (req, res) => {
  const r = await pool.query('SELECT * FROM problems WHERE slug=$1', [req.params.slug]);
  if (!r.rows[0]) return res.status(404).json({ message: 'not found' });
  res.json({ problem: r.rows[0] });
});

// --- run (no save, piston) ---
app.post('/api/run', async (req, res) => {
  const { language = 'python', code = '', stdin = '' } = req.body || {};
  try {
    const out = await pistonRun(language, code, stdin);
    res.json(out);
  } catch (e) { res.status(502).json({ message: 'execution failed', error: String(e) }); }
});

// --- submit: run all tests via piston, save ---
app.post('/api/submissions', auth, async (req, res) => {
  const { slug, language = 'python', code = '' } = req.body || {};
  const pr = await pool.query('SELECT * FROM problems WHERE slug=$1', [slug]);
  if (!pr.rows[0]) return res.status(404).json({ message: 'problem not found' });
  const problem = pr.rows[0];
  const tests = problem.tests;
  let status = 'Accepted', outputs = [];
  for (const t of tests) {
    try {
      const out = await pistonRun(language, code, t.stdin);
      const actual = (out.stdout || '').trim();
      const expected = (t.expected || '').trim();
      const passed = actual === expected;
      outputs.push({ stdin: t.stdin, expected, actual, passed });
      if (!passed) status = 'Wrong Answer';
    } catch (e) { status = 'Runtime Error'; outputs.push({ error: String(e) }); }
  }
  const r = await pool.query(
    'INSERT INTO submissions (user_id,problem_id,language,code,status,output) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.user.id, problem.id, language, code, status, JSON.stringify(outputs)]
  );
  res.status(201).json({ submission: r.rows[0], results: outputs, status });
});

// --- submissions + progress ---
app.get('/api/submissions', auth, async (req, res) => {
  const { slug } = req.query;
  let r;
  if (slug) {
    r = await pool.query(`SELECT s.*, p.slug FROM submissions s JOIN problems p ON p.id=s.problem_id
      WHERE s.user_id=$1 AND p.slug=$2 ORDER BY s.id DESC`, [req.user.id, slug]);
  } else {
    r = await pool.query(`SELECT s.*, p.slug FROM submissions s JOIN problems p ON p.id=s.problem_id
      WHERE s.user_id=$1 ORDER BY s.id DESC LIMIT 50`, [req.user.id]);
  }
  res.json({ submissions: r.rows });
});
app.get('/api/progress', auth, async (req, res) => {
  const total = await pool.query('SELECT COUNT(*)::int AS c FROM problems');
  const solved = await pool.query(`SELECT COUNT(DISTINCT problem_id)::int AS c FROM submissions
    WHERE user_id=$1 AND status='Accepted'`, [req.user.id]);
  const attempted = await pool.query('SELECT COUNT(*)::int AS c FROM submissions WHERE user_id=$1', [req.user.id]);
  res.json({ total: total.rows[0].c, solved: solved.rows[0].c, attempted: attempted.rows[0].c });
});

const PORT = process.env.PORT || 5000;
(async () => {
  // retry until postgres is ready (backend may start before db accepts connections)
  for (let i = 1; i <= 20; i++) {
    try {
      await initDb();
      await seed();
      console.log('db ready');
      break;
    } catch (e) {
      console.log(`db not ready (attempt ${i}/20), retrying in 3s...`);
      if (i === 20) { console.error(e); process.exit(1); }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  app.listen(PORT, () => console.log('codetrack backend on ' + PORT));
})();
