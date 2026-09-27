# CodeTrack - minimal interview version
React + Express + Postgres + self-hosted Piston (isolated execution) + Docker + Tailwind (no styling)

## Run
```
docker compose up --build
```
- frontend: http://localhost:5173
- backend: http://localhost:5000/api/health
- piston: http://localhost:2000/api/v2/runtimes
- db: postgres:5433

Register -> view problems -> open problem -> Run (Piston) -> Submit -> Submissions + Progress.

Notes:
- Public Piston API (emkc.org) now needs an auth token, so this project self-hosts
  Piston as a compose service (`privileged` for the isolate sandbox). Backend
  auto-installs the python runtime on startup via `POST /api/v2/packages`.
- To use an external Piston instead: set `PISTON_API` (+ optional `PISTON_KEY`) on backend.
