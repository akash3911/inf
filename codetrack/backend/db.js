const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/codetrack' });

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
    description TEXT NOT NULL, starter_code TEXT NOT NULL, tests JSONB NOT NULL)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE,
    problem_id INT REFERENCES problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL, code TEXT NOT NULL, status TEXT NOT NULL,
    output TEXT, created_at TIMESTAMP DEFAULT NOW())`);
}
module.exports = { pool, initDb };
