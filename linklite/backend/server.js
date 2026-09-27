const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/linklite' });
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const app = express();
app.use(cors());
app.use(express.json());

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS links (id SERIAL PRIMARY KEY, short_code TEXT UNIQUE NOT NULL, long_url TEXT NOT NULL, user_id INT REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS clicks (id SERIAL PRIMARY KEY, link_id INT REFERENCES links(id) ON DELETE CASCADE, clicked_at TIMESTAMP DEFAULT NOW(), ip TEXT)`);
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(t, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Invalid token' }); }
}

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query('INSERT INTO users (username,password_hash) VALUES ($1,$2) RETURNING id,username', [username, hash]);
    res.json({ token: jwt.sign({ id: r.rows[0].id, username }, JWT_SECRET), user: r.rows[0] });
  } catch { res.status(400).json({ message: 'username taken' }); }
});
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  if (!r.rows[0] || !(await bcrypt.compare(password, r.rows[0].password_hash))) return res.status(400).json({ message: 'invalid' });
  res.json({ token: jwt.sign({ id: r.rows[0].id, username }, JWT_SECRET), user: { id: r.rows[0].id, username } });
});

function makeCode() { return crypto.randomBytes(4).toString('base64url').slice(0, 6); }

app.post('/api/links', auth, async (req, res) => {
  let { long_url } = req.body || {};
  if (!long_url) return res.status(400).json({ message: 'long_url required' });
  if (!/^https?:\/\//i.test(long_url)) long_url = 'http://' + long_url;
  const code = makeCode();
  const r = await pool.query('INSERT INTO links (short_code,long_url,user_id) VALUES ($1,$2,$3) RETURNING *', [code, long_url, req.user.id]);
  res.status(201).json({ link: r.rows[0] });
});
app.get('/api/links', auth, async (req, res) => {
  const r = await pool.query(`SELECT l.*, (SELECT COUNT(*)::int FROM clicks c WHERE c.link_id=l.id) AS clicks
    FROM links l WHERE l.user_id=$1 ORDER BY l.id DESC`, [req.user.id]);
  res.json({ links: r.rows });
});
app.delete('/api/links/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM links WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});
app.get('/api/links/:id/stats', auth, async (req, res) => {
  const l = await pool.query('SELECT * FROM links WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!l.rows[0]) return res.status(404).json({ message: 'not found' });
  const total = await pool.query('SELECT COUNT(*)::int AS c FROM clicks WHERE link_id=$1', [req.params.id]);
  const daily = await pool.query(`SELECT to_char(clicked_at,'YYYY-MM-DD') AS day, COUNT(*)::int AS count
    FROM clicks WHERE link_id=$1 GROUP BY 1 ORDER BY 1`, [req.params.id]);
  res.json({ link: l.rows[0], total: total.rows[0].c, daily: daily.rows });
});

// redirect + click count (public)
app.get('/:code', async (req, res) => {
  if (req.params.code.startsWith('api')) return res.status(404).send('not found');
  const r = await pool.query('SELECT * FROM links WHERE short_code=$1', [req.params.code]);
  if (!r.rows[0]) return res.status(404).send('not found');
  await pool.query('INSERT INTO clicks (link_id, ip) VALUES ($1,$2)', [r.rows[0].id, req.ip]);
  res.redirect(r.rows[0].long_url);
});

const PORT = process.env.PORT || 5001;
(async () => { await initDb(); app.listen(PORT, () => console.log('linklite on ' + PORT)); })();
