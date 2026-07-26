# Dossier Platform

This repository now contains:

- A TanStack Start frontend in `src/`
- A FastAPI backend in `backend/app/`
- JSON-backed mock and synthetic databases for OSINT and investigation flows

## Run The Frontend

```bash
npm install
npm run dev
```

## Run The Backend

```bash
pip install -r backend/requirements.txt
npm run backend:dev
```

The backend exposes:

- `GET /health`
- `GET /api/v1/search/databases`
- `POST /api/v1/search`
- `GET /api/v1/investigation/databases`
- `POST /api/v1/investigation`

## Data Stores

- Mock data: `backend/app/data/mock/`
- Synthetic data: `backend/app/data/synthetic/`

The JSON files are designed as stand-ins for future PostgreSQL and graph-backed
repositories while keeping the API stable for frontend integration.
