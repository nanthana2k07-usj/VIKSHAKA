from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers.investigation import router as investigation_router
from backend.app.routers.search import router as search_router
from backend.app.routers.records import router as records_router


app = FastAPI(
    title="VIKSHAKA AI Intelligence Backend",
    version="0.2.0",
    description="FastAPI service for real-time and synthetic crime records, investigation graphs, and biometric intelligence.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "vikshaka-backend",
        "version": app.version,
        "available_datasets": ["mock", "synthetic", "realtime"],
    }


app.include_router(search_router)
app.include_router(investigation_router)
app.include_router(records_router)
