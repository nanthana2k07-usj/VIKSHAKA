# Dossier Backend

FastAPI backend scaffold for the Dossier platform. It provides JSON-backed mock
and synthetic databases so the OSINT and investigation pipelines work without a
live PostgreSQL or graph database.

## Endpoints

- `GET /health`
- `POST /api/v1/search`
- `GET /api/v1/search/databases`
- `POST /api/v1/investigation`
- `GET /api/v1/investigation/databases`

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

## Data Layout

- `backend/app/data/mock/`
- `backend/app/data/synthetic/`

## Notes

- Mock data is deterministic and safe for UI demos.
- Synthetic data is scenario-driven and intended for testing flows.
- Replace the JSON repositories with PostgreSQL, Prisma, or Neo4j adapters when
  the real infrastructure is ready.
