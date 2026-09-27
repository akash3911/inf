# LabTrack - minimal interview version (Infosys SpringBoard)
React + Spring Boot + PostgreSQL + Docker + Tailwind (no styling)

Features (exactly per description): equipment booking, maintenance tracking,
utilization analytics, user management with RBAC (ADMIN / STAFF / USER).

## Run
```
docker compose up --build
```
- frontend: http://localhost:5176
- backend: http://localhost:8080/api/analytics/health
- db: postgres:5435

Seeded logins: admin/admin123 (ADMIN), staff/staff123 (STAFF). Register creates USER.
