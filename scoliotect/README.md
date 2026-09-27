# Scoliotect - minimal interview version
FastAPI (model loaded once at startup) + YOLOv8 (best.pt, 1400+ images) + React overlay, no report.

## Run
```
docker compose up --build
```
- frontend: http://localhost:5174
- backend: http://localhost:8000 (POST /v1/getprediction)
